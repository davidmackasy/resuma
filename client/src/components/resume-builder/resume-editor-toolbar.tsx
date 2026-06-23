import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeEditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  zoom: number;
  isFullscreen: boolean;
  isAiEditing?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  onFormat: (command: string, value?: string) => void;
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", active && "bg-accent text-accent-foreground")}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function ResumeEditorToolbar({
  canUndo,
  canRedo,
  zoom,
  isFullscreen,
  isAiEditing,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onFormat,
}: ResumeEditorToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between px-3 py-2 border-b bg-muted/20">
      <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-background/50 p-0.5 overflow-x-auto max-w-full">
        <div className="hidden sm:flex items-center gap-0.5">
        <ToolbarButton label="Bold" onClick={() => onFormat("bold")}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => onFormat("italic")}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Underline" onClick={() => onFormat("underline")}>
          <Underline className="h-3.5 w-3.5" />
        </ToolbarButton>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        <ToolbarButton label="Bullet list" onClick={() => onFormat("insertUnorderedList")}>
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Align left" onClick={() => onFormat("justifyLeft")}>
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Align center" onClick={() => onFormat("justifyCenter")}>
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <Separator orientation="vertical" className="h-5 mx-0.5" />
        </div>
        <ToolbarButton label="Undo" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Redo" onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
        {isAiEditing ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary animate-pulse">
            AI is editing…
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            Ready
          </span>
        )}
        <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-background/50 p-0.5">
          <ToolbarButton label="Zoom out" onClick={onZoomOut} disabled={zoom <= 0.7}>
            <ZoomOut className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="text-[11px] font-medium text-muted-foreground w-10 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <ToolbarButton label="Zoom in" onClick={onZoomIn} disabled={zoom >= 1.3}>
            <ZoomIn className="h-3.5 w-3.5" />
          </ToolbarButton>
          <Separator orientation="vertical" className="h-5 mx-0.5" />
          <ToolbarButton
            label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </ToolbarButton>
        </div>
      </div>
    </div>
  );
}

export function execFormatCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}
