import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, ChevronDown, Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from "@shared/ai-config";
import { streamResumeChatRequest } from "@/hooks/use-resume-chat-stream";
import type { ResumeJson } from "@shared/resume-utils";
import { sectionPathToPreviewId } from "@shared/resume-utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ResumeAiAssistantProps {
  applicationId: string;
  getResumeData: () => ResumeJson;
  customInstructions: string;
  onCustomInstructionsChange: (value: string) => void;
  model: string;
  onModelChange: (model: string) => void;
  onBeforeAiEdit: () => void;
  onSectionEditing: (section: string) => void;
  onSectionEdit: (section: string, value: string, partial?: boolean) => void;
  onStreamComplete: () => void;
  onStreamEnd: () => void;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
}

export function ResumeAiAssistant({
  applicationId,
  getResumeData,
  customInstructions,
  onCustomInstructionsChange,
  model,
  onModelChange,
  onBeforeAiEdit,
  onSectionEditing,
  onSectionEdit,
  onStreamComplete,
  onStreamEnd,
  messages,
  onMessagesChange,
}: ResumeAiAssistantProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const nextMessages = [...messages, userMsg];
    onMessagesChange(nextMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingText("");
    onBeforeAiEdit();

    abortRef.current = new AbortController();
    let assistantContent = "";

    try {
      await streamResumeChatRequest({
        applicationId,
        message: text,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
        contentJson: getResumeData(),
        customInstructions: customInstructions.trim() || undefined,
        model,
        signal: abortRef.current.signal,
        onEvent: (event) => {
          if (event.type === "chat_delta") {
            assistantContent += event.content;
            setStreamingText(assistantContent);
          } else if (event.type === "section_editing") {
            onSectionEditing(sectionPathToPreviewId(event.section));
          } else if (event.type === "section_edit") {
            onSectionEdit(event.section, event.value, event.partial);
            onSectionEditing(sectionPathToPreviewId(event.section));
          } else if (event.type === "done") {
            assistantContent = event.assistantMessage || assistantContent;
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        },
      });

      if (assistantContent.trim()) {
        onMessagesChange([
          ...nextMessages,
          { id: `a-${Date.now()}`, role: "assistant", content: assistantContent.trim() },
        ]);
      }
      setStreamingText("");
      onStreamComplete();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        onMessagesChange([
          ...nextMessages,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: err.message || "Something went wrong. Please try again.",
          },
        ]);
      }
      setStreamingText("");
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      onStreamEnd();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 border-b bg-muted/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Brain className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold truncate">AI Assistant</span>
        </div>
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger className="h-8 w-full max-w-[148px] text-xs shrink-0" data-testid="select-ai-model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AI_MODEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground border-b transition-colors">
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", instructionsOpen && "rotate-180")} />
          AI Instructions / prompt
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 py-2 border-b bg-muted/10">
          <Textarea
            value={customInstructions}
            onChange={(e) => onCustomInstructionsChange(e.target.value)}
            placeholder="e.g. Keep bullets concise, emphasize leadership, use UK English…"
            className="min-h-[72px] text-xs resize-none"
            data-testid="textarea-ai-instructions"
          />
        </CollapsibleContent>
      </Collapsible>

      <ScrollArea className="flex-1 px-3 min-h-0">
        <div className="py-3 space-y-3 min-h-[200px]">
          {!messages.length && !streamingText ? (
            <div className="text-center py-8 px-4">
              <Sparkles className="h-8 w-8 text-primary/60 mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Edit your resume in real time</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paste a job description, ask for sharper bullets, or say &ldquo;make my summary more impactful&rdquo;
              </p>
            </div>
          ) : null}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded-xl px-3 py-2 text-sm leading-relaxed max-w-[95%]",
                msg.role === "user"
                  ? "ml-auto bg-primary/15 text-foreground border border-primary/20"
                  : "mr-auto bg-muted/60 text-foreground border border-border/60"
              )}
              data-testid={`chat-message-${msg.role}`}
            >
              {msg.content}
            </div>
          ))}

          {streamingText ? (
            <div className="mr-auto max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed bg-muted/60 border border-border/60">
              {streamingText}
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse align-middle" />
            </div>
          ) : null}

          {isStreaming && !streamingText ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              AI is thinking…
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t bg-muted/10 space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a job description or ask for edits…"
          className="min-h-[80px] text-sm resize-none"
          disabled={isStreaming}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          data-testid="textarea-chat-input"
        />
        <Button
          className="w-full font-semibold"
          onClick={sendMessage}
          disabled={!input.trim() || isStreaming}
          data-testid="button-send-chat"
        >
          {isStreaming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Streaming…
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function loadChatState(applicationId: string) {
  try {
    const raw = sessionStorage.getItem(`resuma-chat-${applicationId}`);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function loadCustomInstructions(applicationId: string) {
  return localStorage.getItem(`resuma-ai-instructions-${applicationId}`) || "";
}

export function saveChatState(applicationId: string, messages: ChatMessage[]) {
  sessionStorage.setItem(`resuma-chat-${applicationId}`, JSON.stringify(messages));
}

export function saveCustomInstructions(applicationId: string, instructions: string) {
  localStorage.setItem(`resuma-ai-instructions-${applicationId}`, instructions);
}

export { DEFAULT_AI_MODEL };
