import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, FileText, Briefcase } from "lucide-react";
import type { Application } from "@shared/schema";
import { format } from "date-fns";

export default function ApplicationsPage() {
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applykit/applications"],
  });

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold" data-testid="text-history-title">Application History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your generated applications in one place
          </p>
        </div>
        <Link href="/app/new">
          <Button data-testid="button-new-from-history">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !applications?.length ? (
        <Card className="p-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-lg mb-2">No applications yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Start by pasting a job description to generate your first tailored application package
          </p>
          <Link href="/app/new">
            <Button data-testid="button-empty-create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Application
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/app/applications/${app.id}`}>
              <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-history-${app.id}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="font-medium truncate">
                        {app.roleTitle || "Untitled Role"}
                      </p>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1 ml-6">
                      {app.companyName || "Unknown Company"}
                      {app.jobLocation && ` · ${app.jobLocation}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    {app.createdAt && format(new Date(app.createdAt), "MMM d, yyyy")}
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
  const variant = status === "generated" ? "default" : status === "failed" ? "destructive" : "secondary";
  return <Badge variant={variant} className="text-xs">{status}</Badge>;
}
