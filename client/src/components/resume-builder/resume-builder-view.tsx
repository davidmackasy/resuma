import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, Check, Download, RefreshCw, Loader2 } from "lucide-react";
import type { AppDocument } from "@shared/schema";
import type { ResumeJson } from "@shared/resume-utils";
import {
  resumeJsonToMarkdown,
  sectionPathToPreviewId,
  setByPath,
} from "@shared/resume-utils";
import { useResumeEditor } from "@/hooks/use-resume-editor";
import { EditableResumePreview } from "./editable-resume-preview";
import {
  ResumeEditorToolbar,
  execFormatCommand,
} from "./resume-editor-toolbar";
import {
  ResumeAiAssistant,
  loadChatState,
  loadCustomInstructions,
  saveChatState,
  saveCustomInstructions,
  DEFAULT_AI_MODEL,
  type ChatMessage,
} from "./resume-ai-assistant";
import { ResumeAnalyticsPanel } from "./resume-analytics-panel";
import { cn } from "@/lib/utils";

function applySectionToResume(resume: ResumeJson, section: string, value: string): ResumeJson {
  let parsed: unknown = value;
  if (/^skills\[\d+\]\.items$/.test(section)) {
    parsed = value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  const bulletsMatch = section.match(/^experience\[(\d+)\]\.bullets$/);
  if (bulletsMatch) {
    parsed = value.split("\n").map((s) => s.replace(/^[-•]\s*/, "").trim()).filter(Boolean);
  }
  return setByPath(resume, section, parsed);
}

interface ResumeBuilderViewProps {
  doc: AppDocument;
  applicationId: string;
  onCopy: (text: string) => void;
  isCopied: boolean;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onDownload: (format: "pdf" | "docx") => void;
}

export function ResumeBuilderView({
  doc,
  applicationId,
  onCopy,
  isCopied,
  onRegenerate,
  isRegenerating,
  onDownload,
}: ResumeBuilderViewProps) {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const liveResumeRef = useRef<ResumeJson>(structuredClone(doc.contentJson as ResumeJson));
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flashingSections, setFlashingSections] = useState<Set<string>>(new Set());
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatState(applicationId));
  const [customInstructions, setCustomInstructions] = useState(() =>
    loadCustomInstructions(applicationId)
  );
  const [model, setModel] = useState<string>(DEFAULT_AI_MODEL);
  const [mobilePane, setMobilePane] = useState<"preview" | "assistant" | "analytics">("preview");
  const [sideTab, setSideTab] = useState<"assistant" | "analytics">("assistant");

  const initialJson = doc.contentJson as ResumeJson;
  const editor = useResumeEditor(initialJson);
  const docSyncKey = `${doc.id}:${JSON.stringify(doc.contentJson)}`;

  useEffect(() => {
    const serverData = structuredClone(doc.contentJson as ResumeJson);
    liveResumeRef.current = serverData;
    editor.resetFromServer(serverData);
  }, [docSyncKey]);

  useEffect(() => {
    liveResumeRef.current = editor.resumeData;
  }, [editor.resumeData]);

  useEffect(() => {
    saveChatState(applicationId, messages);
  }, [applicationId, messages]);

  useEffect(() => {
    saveCustomInstructions(applicationId, customInstructions);
  }, [applicationId, customInstructions]);

  const saveMutation = useMutation({
    mutationFn: async (payload: { contentJson: ResumeJson; contentMd: string }) => {
      await apiRequest("PUT", `/api/applykit/documents/${doc.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/applykit/applications", applicationId, "documents"],
      });
    },
    onError: (error: Error) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  const persistResume = useCallback(
    (data: ResumeJson) => {
      saveMutation.mutate({
        contentJson: data,
        contentMd: resumeJsonToMarkdown(data),
      });
    },
    [saveMutation]
  );

  const flashSection = useCallback((sectionId: string) => {
    setFlashingSections((prev) => new Set(prev).add(sectionId));
    window.setTimeout(() => {
      setFlashingSections((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    }, 1100);
  }, []);

  const handleFieldChange = useCallback(
    (path: string, value: string) => {
      const next = applySectionToResume(editor.resumeData, path, value);
      liveResumeRef.current = next;
      editor.replaceData(next, true);
      persistResume(next);
    },
    [editor, persistResume]
  );

  const handleBeforeAiEdit = useCallback(() => {
    editor.pushUndo(liveResumeRef.current);
    setIsAiStreaming(true);
  }, [editor]);

  const handleSectionEditing = useCallback((sectionId: string) => {
    setEditingSections((prev) => new Set(prev).add(sectionId));
  }, []);

  const handleSectionEdit = useCallback(
    (section: string, value: string, partial?: boolean) => {
      const previewId = sectionPathToPreviewId(section);
      liveResumeRef.current = applySectionToResume(liveResumeRef.current, section, value);
      editor.applySectionEdit(section, value, false);
      if (!partial) {
        flashSection(previewId);
      }
    },
    [editor, flashSection]
  );

  const handleStreamEnd = useCallback(() => {
    setIsAiStreaming(false);
    setEditingSections(new Set());
  }, []);

  const handleStreamComplete = useCallback(() => {
    editor.replaceData(liveResumeRef.current, false);
    persistResume(liveResumeRef.current);
    toast({ title: "Resume updated", description: "AI edits have been applied." });
  }, [editor, persistResume, toast]);

  const handleFormat = useCallback((command: string, value?: string) => {
    execFormatCommand(command, value);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!previewRef.current) return;
    if (!document.fullscreenElement) {
      previewRef.current.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  return (
    <div className="mt-4 min-w-0">
      <div className="flex lg:hidden gap-1 mb-3 p-1 rounded-lg border border-border/60 bg-muted/20">
        {(
          [
            { id: "preview" as const, label: "Preview" },
            { id: "assistant" as const, label: "AI Chat" },
            { id: "analytics" as const, label: "Analytics" },
          ] as const
        ).map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={mobilePane === tab.id ? "default" : "ghost"}
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => {
              setMobilePane(tab.id);
              if (tab.id === "assistant" || tab.id === "analytics") {
                setSideTab(tab.id);
              }
            }}
            data-testid={`button-mobile-pane-${tab.id}`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4 min-w-0">
      <Card
        className={cn(
          "lg:col-span-2 overflow-hidden border-border/80 flex flex-col min-h-[min(480px,72dvh)] lg:min-h-[640px]",
          mobilePane === "preview" ? "hidden lg:flex" : "flex",
        )}
      >
        <Tabs
          value={sideTab}
          onValueChange={(v) => setSideTab(v as "assistant" | "analytics")}
          className="flex flex-col flex-1 min-h-0"
        >
          <TabsList className="w-full justify-start rounded-none border-b bg-muted/20 h-10 px-2 hidden lg:flex">
            <TabsTrigger value="assistant" className="text-xs" data-testid="tab-ai-assistant">
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs" data-testid="tab-analytics">
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="assistant" className="flex-1 mt-0 min-h-0 data-[state=inactive]:hidden">
            <ResumeAiAssistant
              applicationId={applicationId}
              getResumeData={() => liveResumeRef.current}
              customInstructions={customInstructions}
              onCustomInstructionsChange={setCustomInstructions}
              model={model}
              onModelChange={setModel}
              onBeforeAiEdit={handleBeforeAiEdit}
              onSectionEditing={handleSectionEditing}
              onSectionEdit={handleSectionEdit}
              onStreamComplete={handleStreamComplete}
              onStreamEnd={handleStreamEnd}
              messages={messages}
              onMessagesChange={setMessages}
            />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0 flex-1 data-[state=inactive]:hidden">
            <ResumeAnalyticsPanel applicationId={applicationId} />
          </TabsContent>
        </Tabs>
      </Card>

      <Card
        ref={previewRef}
        className={cn(
          "lg:col-span-3 overflow-hidden border-border/80 flex flex-col min-h-[min(480px,72dvh)] lg:min-h-[640px]",
          mobilePane !== "preview" ? "hidden lg:flex" : "flex",
          isFullscreen && "bg-background",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b bg-muted/20">
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-background/50 p-0.5 max-w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={() => onDownload("pdf")} data-testid="button-download-pdf-resume">
                  <Download className="mr-1 h-3.5 w-3.5" />
                  PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-5" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={() => onDownload("docx")} data-testid="button-download-docx-resume">
                  <Download className="mr-1 h-3.5 w-3.5" />
                  DOCX
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download DOCX</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-5" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2.5" onClick={() => onCopy(resumeJsonToMarkdown(editor.resumeData))} data-testid="button-copy-resume">
                  {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isCopied ? "Copied!" : "Copy markdown"}</TooltipContent>
            </Tooltip>
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2.5" disabled={isRegenerating} data-testid="button-regenerate-resume">
                      {isRegenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Regenerate resume</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerate resume?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This replaces the resume with a fresh AI version. Your edits will be lost. Uses 1 regeneration credit.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onRegenerate}>Regenerate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {saveMutation.isPending ? (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </span>
          ) : null}
        </div>

        <ResumeEditorToolbar
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          zoom={zoom}
          isFullscreen={isFullscreen}
          isAiEditing={isAiStreaming || editingSections.size > 0}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onZoomIn={() => setZoom((z) => Math.min(1.3, +(z + 0.1).toFixed(1)))}
          onZoomOut={() => setZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
          onToggleFullscreen={toggleFullscreen}
          onFormat={handleFormat}
        />

        <ScrollArea className="flex-1 bg-muted/30">
          <EditableResumePreview
            data={editor.resumeData}
            zoom={zoom}
            flashingSections={flashingSections}
            editingSections={editingSections}
            onFieldChange={handleFieldChange}
          />
        </ScrollArea>
      </Card>
      </div>
    </div>
  );
}
