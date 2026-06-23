import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, ArrowRight, FileText, Clock, Briefcase, TrendingUp, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Application, Usage } from "@shared/schema";
import { format } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ApplicationStatusBadge } from "@/components/application-status-badge";

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
      <PageHeader
        title={`${greeting()}${user?.firstName ? `, ${user.firstName}` : ""}`}
        description="Your career application hub — let's land that job."
        titleTestId="text-dashboard-title"
        action={
          <Link href="/app/new">
            <Button size="lg" className="font-semibold shadow-[0_0_24px_hsl(var(--primary)/0.2)]" data-testid="button-new-application">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 col-span-2 sm:col-span-1 transition-shadow duration-base hover:shadow-elevation">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-caption font-medium">Monthly Usage</span>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          {usageLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight" data-testid="text-usage-count">
                {usedApplications}
                <span className="text-sm font-normal text-muted-foreground"> / {maxApplications}</span>
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-premium"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-caption mt-1.5">Applications this month</p>
            </>
          )}
        </Card>

        <Card className="p-4 sm:p-5 transition-shadow duration-base hover:shadow-elevation">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-caption font-medium">Remaining</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {usageLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <p className="text-2xl font-bold text-primary tracking-tight" data-testid="text-remaining-count">
                {remaining}
              </p>
              <p className="text-caption mt-1.5">Left this month</p>
            </>
          )}
        </Card>

        <Card className="p-4 sm:p-5 transition-shadow duration-base hover:shadow-elevation">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-caption font-medium">Total Created</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          {appsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight" data-testid="text-total-applications">
                {recentApps?.length || 0}
              </p>
              <p className="text-caption mt-1.5">All time</p>
            </>
          )}
        </Card>
      </div>

      {!appsLoading && !recentApps?.length ? (
        <EmptyState
          icon={Sparkles}
          title="Start your first application"
          description="Paste a job description and get a tailored resume, cover letter, follow-up email, and interview prep in seconds."
          action={
            <Link href="/app/new">
              <Button data-testid="button-empty-new-application" className="font-semibold">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create First Application
              </Button>
            </Link>
          }
        />
      ) : null}

      {appsLoading || (recentApps && recentApps.length > 0) ? (
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-serif font-semibold text-lg tracking-tight">Recent Applications</h2>
            <Link href="/app/applications">
              <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="link-view-all">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {appsLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[76px] w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {(recentApps || []).slice(0, 5).map((app) => (
                <Link key={app.id} href={`/app/applications/${app.id}`}>
                  <Card
                    className="p-4 hover-elevate cursor-pointer transition-shadow duration-base border-border/80"
                    data-testid={`card-application-${app.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0 ring-1 ring-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">
                            {app.roleTitle || "Untitled Role"}
                          </p>
                          <ApplicationStatusBadge status={app.status} />
                        </div>
                        <p className="text-caption truncate mt-0.5">
                          {app.companyName || "Unknown Company"}
                          {app.jobLocation && ` · ${app.jobLocation}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-caption shrink-0">
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
      ) : null}
    </div>
  );
}
