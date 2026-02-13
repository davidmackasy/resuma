import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Sparkles, Loader2, Target, CheckCircle2,
  XCircle, AlertTriangle, TrendingUp, ArrowRight, Lightbulb
} from "lucide-react";
import { Link } from "wouter";
import type { Application, JobAnalysis } from "@shared/schema";

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500/10 border-green-500/30";
  if (score >= 60) return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-red-500/10 border-red-500/30";
}

function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Strong Match";
  if (score >= 55) return "Moderate Match";
  if (score >= 40) return "Partial Match";
  return "Low Match";
}

function getSeverityVariant(severity: string): "default" | "secondary" | "destructive" | "outline" {
  if (severity === "high") return "destructive";
  if (severity === "medium") return "default";
  return "secondary";
}

export default function FitReport() {
  const [, params] = useRoute("/app/applications/:id/fit-report");
  const [, navigate] = useLocation();
  const id = params?.id;
  const { toast } = useToast();
  const [selectedAdditions, setSelectedAdditions] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const { data: application, isLoading: appLoading } = useQuery<Application>({
    queryKey: ["/api/applykit/applications", id],
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery<JobAnalysis>({
    queryKey: ["/api/applykit/applications", id, "analysis"],
    enabled: !!id,
  });

  if (analysis && !initialized) {
    const additions = analysis.suggestedAdditions as any[];
    if (additions?.length > 0) {
      setSelectedAdditions(new Set(additions.map((sa: any) => sa.id)));
      setInitialized(true);
    }
  }

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/applykit/applications/${id}/generate`, {
        selectedAdditions: Array.from(selectedAdditions),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/usage"] });
      toast({ title: "Documents generated!", description: "Your tailored resume, cover letter, and follow-up email are ready." });
      navigate(`/app/applications/${id}`);
    },
    onError: (error) => {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    },
  });

  const toggleAddition = (additionId: string) => {
    setSelectedAdditions(prev => {
      const next = new Set(prev);
      if (next.has(additionId)) {
        next.delete(additionId);
      } else {
        next.add(additionId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const additions = analysis?.suggestedAdditions as any[];
    if (additions) {
      setSelectedAdditions(new Set(additions.map((sa: any) => sa.id)));
    }
  };

  const deselectAll = () => {
    setSelectedAdditions(new Set());
  };

  if (appLoading || analysisLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!application || !analysis) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Analysis not found</p>
          <Link href="/app/applications">
            <Button variant="outline" className="mt-4" data-testid="button-back-history">Back to History</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const matchedSkills = (analysis.matchedSkills as string[]) || [];
  const missingSkills = (analysis.missingSkills as string[]) || [];
  const riskFlags = (analysis.riskFlags as any[]) || [];
  const transferableAngle = (analysis.transferableAngle as any) || { title: "", explanation: "" };
  const suggestedAdditions = (analysis.suggestedAdditions as any[]) || [];
  const jobExtraction = (analysis.jobExtraction as any) || {};

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/app/new">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold" data-testid="text-fit-report-title">
              ATS Fit Report
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {application.roleTitle && application.companyName
                ? `${application.roleTitle} at ${application.companyName}`
                : application.roleTitle || application.companyName || "Job Analysis"}
            </p>
          </div>
        </div>
        <Badge variant={analysis.fitScore >= 60 ? "default" : "secondary"} data-testid="badge-status">
          {application.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className={`p-5 border ${getScoreBg(analysis.fitScore)}`} data-testid="card-fit-score">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">ATS Fit Score</span>
          </div>
          <div className={`text-4xl font-bold ${getScoreColor(analysis.fitScore)}`} data-testid="text-fit-score">
            {analysis.fitScore}
          </div>
          <p className={`text-sm mt-1 ${getScoreColor(analysis.fitScore)}`} data-testid="text-fit-label">
            {getScoreLabel(analysis.fitScore)}
          </p>
        </Card>

        <Card className="p-5" data-testid="card-matched-skills">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium">Matched Skills</span>
          </div>
          <div className="text-2xl font-bold" data-testid="text-matched-count">
            {matchedSkills.length}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {matchedSkills.slice(0, 5).map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs" data-testid={`badge-matched-${i}`}>
                {skill}
              </Badge>
            ))}
            {matchedSkills.length > 5 && (
              <Badge variant="outline" className="text-xs">+{matchedSkills.length - 5}</Badge>
            )}
          </div>
        </Card>

        <Card className="p-5" data-testid="card-missing-skills">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium">Missing Skills</span>
          </div>
          <div className="text-2xl font-bold" data-testid="text-missing-count">
            {missingSkills.length}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {missingSkills.slice(0, 5).map((skill, i) => (
              <Badge key={i} variant="outline" className="text-xs" data-testid={`badge-missing-${i}`}>
                {skill}
              </Badge>
            ))}
            {missingSkills.length > 5 && (
              <Badge variant="outline" className="text-xs">+{missingSkills.length - 5}</Badge>
            )}
          </div>
        </Card>
      </div>

      {riskFlags.length > 0 && (
        <Card className="p-5" data-testid="card-risk-flags">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium">Risk Flags</span>
          </div>
          <div className="space-y-2">
            {riskFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2" data-testid={`risk-flag-${i}`}>
                <Badge variant={getSeverityVariant(flag.severity)} className="text-xs shrink-0 mt-0.5">
                  {flag.severity}
                </Badge>
                <span className="text-sm text-muted-foreground">{flag.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {transferableAngle.title && (
        <Card className="p-5" data-testid="card-transferable-angle">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Transferable Angle</span>
          </div>
          <p className="font-medium text-sm" data-testid="text-angle-title">{transferableAngle.title}</p>
          <p className="text-sm text-muted-foreground mt-1" data-testid="text-angle-explanation">
            {transferableAngle.explanation}
          </p>
        </Card>
      )}

      {jobExtraction.requiredSkills?.length > 0 && (
        <Card className="p-5" data-testid="card-job-details">
          <h3 className="text-sm font-medium mb-3">Job Requirements Breakdown</h3>
          <div className="space-y-3">
            {jobExtraction.seniorityLevel && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-32 shrink-0">Seniority</span>
                <span>{jobExtraction.seniorityLevel}</span>
              </div>
            )}
            {jobExtraction.industry && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-32 shrink-0">Industry</span>
                <span>{jobExtraction.industry}</span>
              </div>
            )}
            {jobExtraction.yearsExperienceRequired && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-32 shrink-0">Experience</span>
                <span>{jobExtraction.yearsExperienceRequired}</span>
              </div>
            )}
            {jobExtraction.requiredSkills?.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Required Skills</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {jobExtraction.requiredSkills.map((skill: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {jobExtraction.preferredSkills?.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Preferred Skills</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {jobExtraction.preferredSkills.map((skill: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {suggestedAdditions.length > 0 && (
        <Card className="p-5" data-testid="card-suggested-improvements">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Suggested Improvements</span>
              <Badge variant="secondary" className="text-xs">{selectedAdditions.size}/{suggestedAdditions.length} selected</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll} data-testid="button-select-all">
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll} data-testid="button-deselect-all">
                Deselect All
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            These bullet upgrades will be applied to your tailored resume. Toggle the ones you want to include.
          </p>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {suggestedAdditions.map((sa: any) => (
                <div
                  key={sa.id}
                  className={`p-3 rounded-md border transition-colors ${
                    selectedAdditions.has(sa.id) ? "border-primary bg-primary/5" : ""
                  }`}
                  data-testid={`improvement-${sa.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs">{sa.targetRole}</Badge>
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-sm">
                          <span className="text-muted-foreground line-through">{sa.originalBullet}</span>
                        </div>
                        <div className="text-sm font-medium flex items-start gap-1.5">
                          <ArrowRight className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                          <span>{sa.improvedBullet}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{sa.reason}</p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedAdditions.has(sa.id)}
                      onCheckedChange={() => toggleAddition(sa.id)}
                      data-testid={`switch-improvement-${sa.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}

      <div className="flex items-center justify-between gap-4 pb-6">
        <p className="text-xs text-muted-foreground">
          Uses 1 application from your monthly quota
        </p>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          data-testid="button-generate"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Documents...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Tailored Application
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
