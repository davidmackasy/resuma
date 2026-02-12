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
import { Sparkles, ChevronDown, FileText, Loader2, AlertCircle } from "lucide-react";
import type { Profile, Template } from "@shared/schema";

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "confident", label: "Confident" },
  { value: "warm", label: "Warm" },
  { value: "direct", label: "Direct" },
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

  const { data: templates, isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ["/api/applykit/templates"],
  });

  const generateMutation = useMutation({
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
      toast({ title: "Application generated!", description: "Your tailored documents are ready." });
      navigate(`/app/applications/${data.id}`);
    },
    onError: (error) => {
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    },
  });

  const hasProfile = profile && profile.fullName && profile.structuredComplete;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold" data-testid="text-new-app-title">New Application</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a job description to generate a tailored resume, cover letter, and follow-up email
        </p>
      </div>

      {profileLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !hasProfile ? (
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Career profile required</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your career profile setup before generating applications.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate("/app/profile/setup")}
                data-testid="button-go-to-profile"
              >
                Set up career profile
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="space-y-4">
          <div>
            <Label htmlFor="jobDescription">Job Description *</Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="mt-1.5 min-h-[200px]"
              data-testid="input-job-description"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {jobDescription.length > 0 ? `${jobDescription.length} characters` : "Paste the complete job posting for best results"}
            </p>
          </div>

          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between" data-testid="button-toggle-details">
                Optional details
                <ChevronDown className={`h-4 w-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Company Name</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" data-testid="input-company-name" />
                </div>
                <div>
                  <Label>Role Title</Label>
                  <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Senior Engineer" data-testid="input-role-title" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} placeholder="San Francisco, CA" />
                </div>
                <div>
                  <Label>Job URL</Label>
                  <Input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="sm:col-span-2">
                  <Label>Hiring Manager</Label>
                  <Input value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} placeholder="Name of hiring manager (optional)" />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-medium mb-4">Template</h2>
        {templatesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(templates || []).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplateId(tpl.id)}
                className={`p-3 rounded-md border text-left transition-colors toggle-elevate ${
                  templateId === tpl.id ? "toggle-elevated border-primary" : ""
                }`}
                data-testid={`button-template-${tpl.id}`}
              >
                <FileText className="h-5 w-5 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium leading-tight">{tpl.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tpl.description}</p>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="font-medium mb-4">Tone</h2>
        <div className="flex flex-wrap gap-2">
          {toneOptions.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTone(t.value)}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors toggle-elevate ${
                tone === t.value ? "toggle-elevated border-primary" : ""
              }`}
              data-testid={`button-tone-${t.value}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Uses 1 application from your monthly quota
        </p>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={!jobDescription.trim() || !hasProfile || generateMutation.isPending}
          data-testid="button-generate"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Application
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
