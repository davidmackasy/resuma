import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import type { JobAnalysis } from "@shared/schema";

function scoreColor(score: number) {
  if (score >= 80) return "text-primary";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export function ResumeAnalyticsPanel({ applicationId }: { applicationId: string }) {
  const { data: analysis, isLoading, isError } = useQuery<JobAnalysis>({
    queryKey: ["/api/applykit/applications", applicationId, "analysis"],
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-1">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <Card className="p-5 text-center border-dashed m-1">
        <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium mb-1">No analytics yet</p>
        <p className="text-xs text-muted-foreground mb-3">
          Run job fit analysis when creating an application to see your ATS score here.
        </p>
      </Card>
    );
  }

  const matched = (analysis.matchedSkills as string[]) || [];
  const missing = (analysis.missingSkills as string[]) || [];

  return (
    <div className="space-y-3 p-1 overflow-y-auto max-h-[560px]">
      <Card className="p-4 border-border/80">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">ATS Fit Score</span>
        </div>
        <p className={`text-3xl font-bold ${scoreColor(analysis.fitScore)}`}>{analysis.fitScore}</p>
        <p className="text-xs text-muted-foreground mt-1">Based on your career database vs. this job</p>
      </Card>

      <Card className="p-4 border-border/80 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Matched ({matched.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {matched.slice(0, 8).map((skill) => (
              <Badge key={skill} variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Gaps ({missing.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {missing.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="outline" className="text-[10px]">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <Link href={`/app/applications/${applicationId}/fit-report`}>
        <Button variant="outline" size="sm" className="w-full">
          Full fit report
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}
