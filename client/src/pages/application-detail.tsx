import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Copy, Check, FileText, Mail, MessageSquare,
  Briefcase, MapPin, RefreshCw, Loader2, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import type { Application, AppDocument } from "@shared/schema";
import { format } from "date-fns";

export default function ApplicationDetail() {
  const [, params] = useRoute("/app/applications/:id");
  const id = params?.id;
  const { toast } = useToast();
  const [copiedDoc, setCopiedDoc] = useState<string | null>(null);

  const { data: application, isLoading: appLoading } = useQuery<Application>({
    queryKey: ["/api/applykit/applications", id],
  });

  const { data: documents, isLoading: docsLoading } = useQuery<AppDocument[]>({
    queryKey: ["/api/applykit/applications", id, "documents"],
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/applykit/applications/${id}/regenerate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/applications", id, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/usage"] });
      toast({ title: "Regenerated", description: "Documents have been regenerated successfully." });
    },
    onError: (error) => {
      toast({ title: "Regeneration failed", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = async (text: string, docType: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedDoc(docType);
    toast({ title: "Copied!", description: "Content copied to clipboard." });
    setTimeout(() => setCopiedDoc(null), 2000);
  };

  const resume = documents?.find((d) => d.docType === "resume");
  const coverLetter = documents?.find((d) => d.docType === "cover_letter");
  const followupEmail = documents?.find((d) => d.docType === "followup_email");

  if (appLoading || docsLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Application not found</p>
          <Link href="/app/applications">
            <Button variant="outline" className="mt-4">Back to History</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/app/applications">
            <Button size="icon" variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold" data-testid="text-detail-title">
              {application.roleTitle || "Application"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5 flex-wrap">
              {application.companyName && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {application.companyName}
                </span>
              )}
              {application.jobLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {application.jobLocation}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={application.status === "generated" ? "default" : "secondary"}>
            {application.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
            data-testid="button-regenerate"
          >
            {regenerateMutation.isPending ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
            )}
            Regenerate
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="resume">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="resume" data-testid="tab-resume">
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                Resume
              </TabsTrigger>
              <TabsTrigger value="cover_letter" data-testid="tab-cover-letter">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                Cover Letter
              </TabsTrigger>
              <TabsTrigger value="email" data-testid="tab-email">
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Follow-up Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resume">
              <DocumentPreview
                doc={resume}
                onCopy={(text) => copyToClipboard(text, "resume")}
                isCopied={copiedDoc === "resume"}
              />
            </TabsContent>

            <TabsContent value="cover_letter">
              <DocumentPreview
                doc={coverLetter}
                onCopy={(text) => copyToClipboard(text, "cover_letter")}
                isCopied={copiedDoc === "cover_letter"}
              />
            </TabsContent>

            <TabsContent value="email">
              <DocumentPreview
                doc={followupEmail}
                onCopy={(text) => copyToClipboard(text, "email")}
                isCopied={copiedDoc === "email"}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium text-sm mb-3">Application Details</h3>
            <div className="space-y-2.5 text-sm">
              <DetailRow label="Company" value={application.companyName} />
              <DetailRow label="Role" value={application.roleTitle} />
              <DetailRow label="Location" value={application.jobLocation} />
              <DetailRow label="Tone" value={application.tone} />
              <DetailRow label="Template" value={application.templateId?.replace(/_/g, " ")} />
              <DetailRow
                label="Created"
                value={application.createdAt ? format(new Date(application.createdAt), "MMM d, yyyy") : ""}
              />
            </div>
          </Card>

          {application.jobUrl && (
            <Card className="p-4">
              <h3 className="font-medium text-sm mb-2">Job Posting</h3>
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
                data-testid="link-job-url"
              >
                {application.jobUrl}
              </a>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentPreview({
  doc,
  onCopy,
  isCopied,
}: {
  doc?: AppDocument;
  onCopy: (text: string) => void;
  isCopied: boolean;
}) {
  if (!doc || !doc.contentMd) {
    return (
      <Card className="p-8 text-center mt-4">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No content available</p>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-end gap-2 p-3 border-b">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopy(doc.contentMd || "")}
          data-testid={`button-copy-${doc.docType}`}
        >
          {isCopied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
          {isCopied ? "Copied" : "Copy"}
        </Button>
      </div>
      <ScrollArea className="h-[500px]">
        <div className="p-6 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed" data-testid={`text-preview-${doc.docType}`}>
          {doc.contentMd}
        </div>
      </ScrollArea>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right capitalize">{value}</span>
    </div>
  );
}
