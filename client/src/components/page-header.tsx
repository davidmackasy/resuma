import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  titleTestId?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
  titleTestId,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <h1
          className="text-2xl sm:text-3xl font-serif font-bold leading-tight tracking-tight"
          data-testid={titleTestId}
        >
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
        ) : null}
      </div>
      {action ? <div className="w-full sm:w-auto shrink-0 [&_button]:w-full sm:[&_button]:w-auto">{action}</div> : null}
    </div>
  );
}
