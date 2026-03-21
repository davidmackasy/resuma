import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, ArrowRight, FileText, Clock, Briefcase, TrendingUp, Sparkles } from "lucide-react";
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

  const maxApplications = 30;
  const usedApplications = usage?.applicationsGenerated || 0;
  const remaining = maxApplications - usedApplications;
  const usagePercent = Math.min((usedApplications / maxApplications) * 100, 100);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold leading-tight" data-testid="text-dashboard-title">
            {greeting()}{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Your career application hub — let's land that job.
          </p>
        </div>
        <Link href="/app/new">
          <Button size="lg" className="font-semibold" data-testid="button-new-application">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Monthly Usage</span>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          {usageLoading ? (
            <Skeleton className="h-8 w-20 mb-2" />
          ) : (
            <>
              <p className="text-2xl font-bold" data-testid="text-usage-count">
                {usedApplications}
                <span className="text-sm font-normal text-muted-foreground"> / {maxApplications}</span>
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Applications this month</p>
            </>
          )}
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Remaining</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {usageLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <p className="text-2xl font-bold text-primary" data-testid="text-remaining-count">{remaining}</p>
              <p className="text-xs text-muted-foreground mt-1.5">Left this month</p>
            </>
          )}
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">Total Created</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          {appsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <p className="text-2xl font-bold" data-testid="text-total-applications">
                {recentApps?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">All time</p>
            </>
          )}
        </Card>
      </div>

      {/* Quick action if no apps */}
      {!appsLoading && !recentApps?.length && (
        <Card className="p-6 sm:p-8 border-dashed text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">Start your first application</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Paste a job description and get a tailored resume, cover letter, follow-up email, and interview prep in seconds.
            </p>
          </div>
          <Link href="/app/new">
            <Button data-testid="button-empty-new-application" className="font-semibold">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Application
            </Button>
          </Link>
        </Card>
      )}

      {/* Recent Applications */}
      {(appsLoading || (recentApps && recentApps.length > 0)) && (
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-serif font-semibold text-lg">Recent Applications</h2>
            <Link href="/app/applications">
              <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="link-view-all">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {appsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[72px] w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {(recentApps || []).slice(0, 5).map((app) => (
                <Link key={app.id} href={`/app/applications/${app.id}`}>
                  <Card className="p-4 hover-elevate cursor-pointer" data-testid={`card-application-${app.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
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
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        {app.createdAt && format(new Date(app.createdAt), "MMM d")}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
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
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.className}`} data-testid={`badge-status-${status}`}>
      {style.label}
    </span>
  );
}
