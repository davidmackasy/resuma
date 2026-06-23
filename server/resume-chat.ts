import OpenAI from "openai";
import { getModelFallbackChain } from "@shared/ai-config";
import type { ResumeJson } from "@shared/resume-utils";
import {
  resumeJsonToMarkdown,
  setByPath,
  type ResumeChatEvent,
} from "../shared/resume-utils";
import { runWithModelFallback } from "./ai-model";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const UPDATE_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "update_resume_section",
    description:
      "Update one resume field. Use bracket paths: summary, header.title, experience[0].bullets[2], skills[0].items (comma-separated for skill lists). Call once per changed field.",
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          description: "Section path e.g. summary, header.title, experience[0].bullets[1]",
        },
        value: {
          type: "string",
          description: "New text content for that section",
        },
      },
      required: ["section", "value"],
      additionalProperties: false,
    },
  },
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface StreamResumeChatInput {
  message: string;
  history: ChatMessage[];
  resumeJson: ResumeJson;
  jobDescription: string;
  roleTitle?: string;
  companyName?: string;
  customInstructions?: string;
  model?: string;
  send: (event: ResumeChatEvent) => void;
}

function tryParseToolArgs(raw: string): { section?: string; value?: string } | null {
  try {
    return JSON.parse(raw);
  } catch {
    const sectionMatch = raw.match(/"section"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    const valueMatch = raw.match(/"value"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (sectionMatch) {
      return {
        section: sectionMatch[1].replace(/\\"/g, '"'),
        value: valueMatch ? valueMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : undefined,
      };
    }
    return null;
  }
}

function applySectionEdit(resume: ResumeJson, section: string, value: string): ResumeJson {
  let parsedValue: unknown = value;

  const skillsItemsMatch = section.match(/^skills\[(\d+)\]\.items$/);
  if (skillsItemsMatch) {
    parsedValue = value.split(",").map((s) => s.trim()).filter(Boolean);
  }

  const bulletsMatch = section.match(/^experience\[(\d+)\]\.bullets$/);
  if (bulletsMatch) {
    parsedValue = value.split("\n").map((s) => s.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
  }

  return setByPath(resume, section, parsedValue);
}

export async function streamResumeChat(input: StreamResumeChatInput): Promise<{
  assistantMessage: string;
  resumeJson: ResumeJson;
  tokensUsed: number;
}> {
  const modelChain = getModelFallbackChain(input.model);
  let workingResume = structuredClone(input.resumeJson);
  let assistantMessage = "";
  let tokensUsed = 0;

  const systemPrompt = `You are an expert resume editor assistant embedded in a live resume builder.

RULES:
- NEVER fabricate companies, dates, degrees, or metrics not already in the resume unless the user explicitly asks to add something grounded in their request.
- When the user pastes a job description, tailor relevant sections (summary, title, bullets, skills) using keywords from the JD while staying truthful.
- Always reply conversationally in 1-3 sentences explaining what you changed or recommend.
- Use update_resume_section tool calls for EVERY resume change — never tell the user to edit manually.
- Update sections incrementally; prefer multiple tool calls for multiple fields.
- Valid section paths: summary, header.title, header.name, experience[N].title, experience[N].bullets[M], experience[N].bullets (newline-separated list), skills[N].name, skills[N].items (comma-separated), education[N].degree, etc.

CURRENT RESUME (markdown):
${resumeJsonToMarkdown(workingResume)}

JOB DESCRIPTION:
${input.jobDescription.substring(0, 6000)}
${input.roleTitle ? `\nTARGET ROLE: ${input.roleTitle}` : ""}
${input.companyName ? `\nCOMPANY: ${input.companyName}` : ""}
${input.customInstructions ? `\nUSER CUSTOM INSTRUCTIONS:\n${input.customInstructions}` : ""}`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...input.history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: input.message },
  ];

  const { result: stream, modelUsed: resolvedModel, usedFallback } = await runWithModelFallback(
    modelChain,
    (model) =>
      openai.chat.completions.create({
        model,
        messages,
        tools: [UPDATE_TOOL],
        stream: true,
        max_completion_tokens: 4096,
      }),
  );

  if (usedFallback && resolvedModel !== modelChain[0]) {
    input.send({
      type: "chat_delta",
      content: `_(Using ${resolvedModel} — ${modelChain[0]} unavailable on this provider.)_\n\n`,
    });
  }

  const toolArgBuffers: Record<number, string> = {};
  const toolNames: Record<number, string> = {};
  const emittedSections = new Set<string>();

  for await (const chunk of stream) {
    if (chunk.usage) {
      tokensUsed = chunk.usage.total_tokens || tokensUsed;
    }

    const choice = chunk.choices[0];
    if (!choice) continue;

    const delta = choice.delta;

    if (delta.content) {
      assistantMessage += delta.content;
      input.send({ type: "chat_delta", content: delta.content });
    }

    if (delta.tool_calls) {
      for (const toolCall of delta.tool_calls) {
        const idx = toolCall.index;
        if (toolCall.function?.name) {
          toolNames[idx] = toolCall.function.name;
        }
        if (toolCall.function?.arguments) {
          toolArgBuffers[idx] = (toolArgBuffers[idx] || "") + toolCall.function.arguments;
          const parsed = tryParseToolArgs(toolArgBuffers[idx]);
          if (parsed?.section && parsed.value !== undefined) {
            if (!emittedSections.has(parsed.section)) {
              emittedSections.add(parsed.section);
              input.send({ type: "section_editing", section: parsed.section });
            }
            workingResume = applySectionEdit(workingResume, parsed.section, parsed.value);
            input.send({
              type: "section_edit",
              section: parsed.section,
              value: parsed.value,
              partial: choice.finish_reason !== "tool_calls",
            });
          }
        }
      }
    }
  }

  // Finalize any tool calls that weren't fully streamed
  for (const idx of Object.keys(toolArgBuffers)) {
    const parsed = tryParseToolArgs(toolArgBuffers[Number(idx)]);
    if (parsed?.section && parsed.value !== undefined && toolNames[Number(idx)] === "update_resume_section") {
      workingResume = applySectionEdit(workingResume, parsed.section, parsed.value);
      input.send({
        type: "section_edit",
        section: parsed.section,
        value: parsed.value,
        partial: false,
      });
    }
  }

  input.send({
    type: "done",
    assistantMessage: assistantMessage.trim(),
    tokensUsed,
  });

  return {
    assistantMessage: assistantMessage.trim(),
    resumeJson: workingResume,
    tokensUsed,
  };
}
