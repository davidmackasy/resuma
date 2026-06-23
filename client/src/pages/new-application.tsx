import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { ResumeTemplateGallery } from "@/components/resume-template-gallery";
import { PageHeader } from "@/components/page-header";
import type { Profile } from "@shared/schema";

const toneOptions = [
  { value: "professional", label: "Professional", desc: "Polished & formal" },
  { value: "confident", label: "Confident", desc: "Bold & direct" },
  { value: "warm", label: "Warm", desc: "Friendly & approachable" },
  { value: "direct", label: "Direct", desc: "Concise & clear" },
];

export default function NewApplication() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [tone, setTone] = useState("professional");
  const [templateId, setTemplateId] = useState("modern_minimal");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/applykit/profile"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/applykit/applications", {
        jobDescription,
        companyName,
        roleTitle,
        jobLocation,
        jobUrl,
        hiringManager,
        tone,
        templateId,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/usage"] });
      navigate(`/app/applications/${data.id}/fit-report`);
    },
    onError: (error) => {
      toast({ title: "Analysis failed", description: error.message, variant: "destructive" });
    },
  });

  const hasProfile = profile && profile.fullName && profile.structuredComplete;
  const charCount = jobDescription.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 pb-10">
      <PageHeader
        title="New Application"
        description="Paste a job description to analyze fit and generate your tailored application package"
        titleTestId="text-new-app-title"
      />

      {profileLoading ? (
        <Skeleton className="h-[88px] w-full rounded-xl" />
      ) : !hasProfile ? (
        <Card className="p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-sm">Career profile required</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Complete your career profile before generating applications.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={() => navigate("/app/profile/setup")}
                data-testid="button-go-to-profile"
              >
                Set up career profile
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Job Description */}
      <Card className="p-5 space-y-4 border-border/80">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-semibold text-sm">Job Description</h2>
          <span className="text-xs text-destructive font-medium">Required</span>
        </div>

        <div>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here — the more detail, the better your results..."
            className="min-h-[220px] resize-y text-sm"
            data-testid="input-job-description"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {charCount > 0
                ? `${charCount.toLocaleString()} characters · Paste the complete job posting for best results`
                : "Include requirements, responsibilities, and qualifications"}
            </p>
            {charCount > 0 && (
              <span className={`text-xs font-medium ${charCount >= 200 ? "text-primary" : "text-muted-foreground"}`}>
                {charCount >= 200 ? "✓ Good length" : `${200 - charCount} more recommended`}
              </span>
            )}
          </div>
        </div>

        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              data-testid="button-toggle-details"
            >
              <ChevronDown className={`h-4 w-4 transition-transform shrink-0 ${detailsOpen ? "rotate-180" : ""}`} />
              Optional details (company, role, hiring manager)
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Company Name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" data-testid="input-company-name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Role Title</Label>
                <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Senior Engineer" data-testid="input-role-title" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Location</Label>
                <Input value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} placeholder="San Francisco, CA" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Job URL</Label>
                <Input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Hiring Manager</Label>
                <Input value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} placeholder="Name of hiring manager (optional)" />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Resume Template Gallery */}
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-base mb-0.5">Choose your resume style</h2>
          <p className="text-sm text-muted-foreground">
            Pick a layout that matches your role. Every template is clean, professional, and ATS-friendly.{" "}
            <span className="text-muted-foreground/60">You can change this later before downloading.</span>
          </p>
        </div>
        <ResumeTemplateGallery
          selectedId={templateId}
          onSelect={setTemplateId}
        />
      </div>

      {/* Tone selection */}
      <Card className="p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-sm mb-0.5">Writing Tone</h2>
          <p className="text-xs text-muted-foreground">How you want your documents to sound</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {toneOptions.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTone(t.value)}
              className={`relative p-3 rounded-lg border text-left transition-all duration-base ease-premium toggle-elevate ${
                tone === t.value
                  ? "toggle-elevated border-primary bg-primary/5"
                  : "hover:border-foreground/20"
              }`}
              data-testid={`button-tone-${t.value}`}
            >
              {tone === t.value && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[8px] text-primary-foreground font-bold">✓</span>
                </div>
              )}
              <p className="text-xs font-semibold">{t.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-6">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground">
            Analyzes job fit first, then generates all 4 documents
          </p>
          <p className="text-xs text-muted-foreground">
            Takes ~30 seconds · Uses 1 of your 30 monthly applications
          </p>
        </div>
        <Button
          size="lg"
          className="font-semibold w-full sm:w-auto"
          onClick={() => analyzeMutation.mutate()}
          disabled={!jobDescription.trim() || !hasProfile || analyzeMutation.isPending}
          data-testid="button-analyze"
        >
          {analyzeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing job fit...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Job Fit
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
