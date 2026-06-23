import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "p-8 sm:p-12 text-center border-dashed border-border/80 space-y-4",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center mx-auto">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </Card>
  );
}
