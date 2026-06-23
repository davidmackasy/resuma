import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  generated: {
    label: "Generated",
    className: "bg-primary/10 text-primary border-primary/25",
  },
  analyzed: {
    label: "Ready to generate",
    className: "bg-accent text-accent-foreground border-primary/20",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/25",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
  },
};

interface ApplicationStatusBadgeProps {
  status: string;
  className?: string;
}

export function ApplicationStatusBadge({ status, className }: ApplicationStatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold px-2 py-0 h-5 border",
        style.className,
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      {style.label}
    </Badge>
  );
}
