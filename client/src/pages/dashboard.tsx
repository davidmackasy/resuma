import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, ArrowRight, FileText, Clock, Briefcase, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Application, Usage } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: recentApps, isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applykit/applications"],
  });

  const { data: usage, isLoading: usageLoading } = useQuery<Usage>({
    queryKey: ["/api/applykit/usage"],
  });

  const maxApplications = 15;
  const usedApplications = usage?.applicationsGenerated || 0;
  const remaining = maxApplications - usedApplications;
  const usagePercent = Math.min((usedApplications / maxApplications) * 100, 100);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold" data-testid="text-dashboard-title">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your career application hub
          </p>
        </div>
        <Link href="/app/new">
          <Button data-testid="button-new-application">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Applications Used</span>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          {usageLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <p className="text-2xl font-bold" data-testid="text-usage-count">
                {usedApplications}<span className="text-sm font-normal text-muted-foreground"> / {maxApplications}</span>
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {usageLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-bold" data-testid="text-remaining-count">
              {remaining}<span className="text-sm font-normal text-muted-foreground"> this month</span>
            </p>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm text-muted-foreground">Total Created</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          {appsLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-bold" data-testid="text-total-applications">
              {recentApps?.length || 0}
            </p>
          )}
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-serif font-semibold text-lg">Recent Applications</h2>
          <Link href="/app/applications">
            <Button variant="ghost" size="sm" data-testid="link-view-all">
              View all
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {appsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !recentApps?.length ? (
          <Card className="p-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium mb-1">No applications yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first tailored application to get started
            </p>
            <Link href="/app/new">
              <Button data-testid="button-empty-new-application">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Application
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {(recentApps || []).slice(0, 5).map((app) => (
              <Link key={app.id} href={`/app/applications/${app.id}`}>
                <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-application-${app.id}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">
                          {app.roleTitle || "Untitled Role"}
                        </p>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {app.companyName || "Unknown Company"}
                        {app.jobLocation && ` · ${app.jobLocation}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                      {app.createdAt && format(new Date(app.createdAt), "MMM d")}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "generated" ? "default" : status === "failed" ? "destructive" : "secondary";
  return (
    <Badge variant={variant} className="text-xs" data-testid={`badge-status-${status}`}>
      {status}
    </Badge>
  );
}
