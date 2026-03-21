import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, FileText, Briefcase, ChevronRight } from "lucide-react";
import type { Application } from "@shared/schema";
import { format } from "date-fns";

export default function ApplicationsPage() {
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applykit/applications"],
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold" data-testid="text-history-title">Application History</h1>
          <p className="text-sm text-muted-foreground">
            All your generated application packages in one place
          </p>
        </div>
        <Link href="/app/new">
          <Button className="font-semibold" data-testid="button-new-from-history">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-[72px] w-full" />
          ))}
        </div>
      ) : !applications?.length ? (
        <Card className="p-12 sm:p-16 text-center border-dashed space-y-4">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto">
            <Briefcase className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1.5">No applications yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Start by pasting a job description to generate your first tailored application package
            </p>
          </div>
          <Link href="/app/new">
            <Button className="font-semibold" data-testid="button-empty-create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Application
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={app.status === "analyzed" ? `/app/applications/${app.id}/fit-report` : `/app/applications/${app.id}`}
            >
              <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-history-${app.id}`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">
                        {app.roleTitle || "Untitled Role"}
                      </p>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {app.companyName || "Unknown Company"}
                      {app.jobLocation && ` · ${app.jobLocation}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    <span className="hidden sm:inline">{app.createdAt && format(new Date(app.createdAt), "MMM d, yyyy")}</span>
                    <span className="sm:hidden">{app.createdAt && format(new Date(app.createdAt), "MMM d")}</span>
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    generated: { label: "Generated", className: "bg-primary/10 text-primary border-primary/20" },
    analyzed: { label: "Ready to generate", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20" },
    draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  };
  const style = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.className}`}>
      {style.label}
    </span>
  );
}
