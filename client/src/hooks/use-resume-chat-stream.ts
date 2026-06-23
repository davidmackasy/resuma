import type { ResumeJson, ResumeChatEvent } from "@shared/resume-utils";

interface StreamResumeChatParams {
  applicationId: string;
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  contentJson: ResumeJson;
  customInstructions?: string;
  model?: string;
  onEvent: (event: ResumeChatEvent) => void;
  signal?: AbortSignal;
}

export async function streamResumeChatRequest({
  applicationId,
  message,
  history,
  contentJson,
  customInstructions,
  model,
  onEvent,
  signal,
}: StreamResumeChatParams): Promise<void> {
  const response = await fetch(`/api/applykit/applications/${applicationId}/resume-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message, history, contentJson, customInstructions, model }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Chat failed (${response.status})`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6)) as ResumeChatEvent;
        onEvent(event);
        if (event.type === "error") {
          throw new Error(event.message);
        }
      } catch (err) {
        if (err instanceof SyntaxError) continue;
        throw err;
      }
    }
  }

  const trailing = buffer.trim();
  if (trailing.startsWith("data: ")) {
    try {
      const event = JSON.parse(trailing.slice(6)) as ResumeChatEvent;
      onEvent(event);
      if (event.type === "error") {
        throw new Error(event.message);
      }
    } catch (err) {
      if (!(err instanceof SyntaxError)) throw err;
    }
  }
}
