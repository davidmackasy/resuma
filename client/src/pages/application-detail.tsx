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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Copy, Check, FileText, Mail, MessageSquare,
  Briefcase, MapPin, RefreshCw, Loader2, ArrowLeft,
  Download, Pencil, X, Save
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

  const regenerateAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/applykit/applications/${id}/regenerate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/applications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/applications", id, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/usage"] });
      toast({ title: "Regenerated", description: "All documents have been regenerated." });
    },
    onError: (error) => {
      toast({ title: "Regeneration failed", description: error.message, variant: "destructive" });
    },
  });

  const regenerateDocMutation = useMutation({
    mutationFn: async (docType: string) => {
      await apiRequest("POST", `/api/applykit/applications/${id}/regenerate`, { docType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/applications", id, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/usage"] });
      toast({ title: "Document regenerated", description: "This document has been refreshed." });
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

  const downloadDoc = async (docId: number, format: "pdf" | "docx", docType: string) => {
    try {
      const response = await fetch(`/api/applykit/documents/${docId}/export?format=${format}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docType.replace(/_/g, "-")}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: `${format.toUpperCase()} file downloaded.` });
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    }
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={regenerateAllMutation.isPending}
                data-testid="button-regenerate-all"
              >
                {regenerateAllMutation.isPending ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                )}
                Regenerate All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerate all documents?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will replace all three documents (resume, cover letter, and follow-up email) with freshly generated versions. Any edits you have made will be lost. This uses 1 regeneration from your monthly quota.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => regenerateAllMutation.mutate()}>Regenerate</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
              <DocumentPanel
                doc={resume}
                docType="resume"
                applicationId={id!}
                onCopy={(text) => copyToClipboard(text, "resume")}
                isCopied={copiedDoc === "resume"}
                onRegenerate={() => regenerateDocMutation.mutate("resume")}
                isRegenerating={regenerateDocMutation.isPending}
                onDownload={(fmt) => resume && downloadDoc(resume.id, fmt, "resume")}
                canExport
              />
            </TabsContent>

            <TabsContent value="cover_letter">
              <DocumentPanel
                doc={coverLetter}
                docType="cover_letter"
                applicationId={id!}
                onCopy={(text) => copyToClipboard(text, "cover_letter")}
                isCopied={copiedDoc === "cover_letter"}
                onRegenerate={() => regenerateDocMutation.mutate("cover_letter")}
                isRegenerating={regenerateDocMutation.isPending}
                onDownload={(fmt) => coverLetter && downloadDoc(coverLetter.id, fmt, "cover_letter")}
                canExport
              />
            </TabsContent>

            <TabsContent value="email">
              <DocumentPanel
                doc={followupEmail}
                docType="followup_email"
                applicationId={id!}
                onCopy={(text) => copyToClipboard(text, "email")}
                isCopied={copiedDoc === "email"}
                onRegenerate={() => regenerateDocMutation.mutate("followup_email")}
                isRegenerating={regenerateDocMutation.isPending}
                canExport={false}
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

function DocumentPanel({
  doc,
  docType,
  applicationId,
  onCopy,
  isCopied,
  onRegenerate,
  isRegenerating,
  onDownload,
  canExport,
}: {
  doc?: AppDocument;
  docType: string;
  applicationId: string;
  onCopy: (text: string) => void;
  isCopied: boolean;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onDownload?: (format: "pdf" | "docx") => void;
  canExport: boolean;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("PUT", `/api/applykit/documents/${doc!.id}`, {
        contentMd: content,
        contentJson: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/applications", applicationId, "documents"] });
      setEditing(false);
      toast({ title: "Saved", description: "Document updated." });
    },
    onError: (error) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  const startEdit = () => {
    setEditContent(doc?.contentMd || "");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditContent("");
  };

  if (!doc || (!doc.contentMd && !doc.contentJson)) {
    return (
      <Card className="p-8 text-center mt-4">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No content available</p>
      </Card>
    );
  }

  const hasStructuredContent = doc.contentJson && typeof doc.contentJson === "object" && Object.keys(doc.contentJson as any).length > 0;

  return (
    <Card className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b">
        <div className="flex items-center gap-1.5">
          {canExport && hasStructuredContent && onDownload ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload("pdf")}
                data-testid={`button-download-pdf-${docType}`}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload("docx")}
                data-testid={`button-download-docx-${docType}`}
              >
                <Download className="mr-1 h-3.5 w-3.5" />
                DOCX
              </Button>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                data-testid={`button-cancel-edit-${docType}`}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => saveMutation.mutate(editContent)}
                disabled={saveMutation.isPending}
                data-testid={`button-save-${docType}`}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1 h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={startEdit}
                data-testid={`button-edit-${docType}`}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(doc.contentMd || "")}
                data-testid={`button-copy-${docType}`}
              >
                {isCopied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
                {isCopied ? "Copied" : "Copy"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isRegenerating}
                    data-testid={`button-regenerate-${docType}`}
                  >
                    {isRegenerating ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-1 h-3.5 w-3.5" />
                    )}
                    Redo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate this document?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will replace the current {docType.replace(/_/g, " ")} with a freshly generated version. Any edits will be lost. This uses 1 regeneration from your monthly quota.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onRegenerate}>Regenerate</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="p-4">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[500px] font-mono text-sm resize-none"
            data-testid={`textarea-edit-${docType}`}
          />
        </div>
      ) : hasStructuredContent && docType === "resume" ? (
        <ScrollArea className="h-[560px]">
          <StyledResumePreview data={doc.contentJson as any} />
        </ScrollArea>
      ) : hasStructuredContent && docType === "cover_letter" ? (
        <ScrollArea className="h-[560px]">
          <StyledCoverLetterPreview data={doc.contentJson as any} />
        </ScrollArea>
      ) : hasStructuredContent && docType === "followup_email" ? (
        <ScrollArea className="h-[560px]">
          <StyledEmailPreview data={doc.contentJson as any} />
        </ScrollArea>
      ) : (
        <ScrollArea className="h-[560px]">
          <div className="p-6 whitespace-pre-wrap font-mono text-sm leading-relaxed" data-testid={`text-preview-${docType}`}>
            {doc.contentMd}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}

function StyledResumePreview({ data }: { data: any }) {
  if (!data?.header) return <div className="p-6 text-sm text-muted-foreground">No structured data available</div>;
  return (
    <div className="p-6 sm:p-8 max-w-[680px] mx-auto" data-testid="resume-styled-preview">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold tracking-tight">{data.header.name}</h1>
        {data.header.title && <p className="text-sm text-muted-foreground mt-0.5">{data.header.title}</p>}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
          {data.header.email && <span>{data.header.email}</span>}
          {data.header.phone && <span>{data.header.phone}</span>}
          {data.header.location && <span>{data.header.location}</span>}
        </div>
        {(data.header.linkedin || data.header.portfolio || data.header.github) && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
            {data.header.linkedin && <span>{data.header.linkedin}</span>}
            {data.header.portfolio && <span>{data.header.portfolio}</span>}
            {data.header.github && <span>{data.header.github}</span>}
          </div>
        )}
      </div>
      <hr className="border-foreground/20 mb-4" />

      {data.summary && (
        <section className="mb-4">
          <SectionTitle text="Professional Summary" />
          <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
        </section>
      )}

      {data.experience?.length > 0 && (
        <section className="mb-4">
          <SectionTitle text="Experience" />
          {data.experience.map((role: any, i: number) => (
            <div key={i} className="mb-3">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="text-sm font-semibold">{role.title}</span>
                <span className="text-xs text-muted-foreground">{role.startDate} - {role.endDate}</span>
              </div>
              {(role.company || role.location) && (
                <p className="text-xs text-muted-foreground italic">
                  {[role.company, role.location].filter(Boolean).join(", ")}
                </p>
              )}
              {role.bullets?.length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-4">
                  {role.bullets.filter((b: string) => b.trim()).map((bullet: string, j: number) => (
                    <li key={j} className="text-sm leading-relaxed list-disc text-muted-foreground">{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="mb-4">
          <SectionTitle text="Skills" />
          {data.skills.map((group: any, i: number) => (
            <p key={i} className="text-sm leading-relaxed">
              <span className="font-semibold">{group.name}:</span>{" "}
              <span className="text-muted-foreground">{group.items?.join(", ")}</span>
            </p>
          ))}
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="mb-4">
          <SectionTitle text="Education" />
          {data.education.map((edu: any, i: number) => (
            <div key={i} className="mb-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="text-sm font-semibold">
                  {[edu.degree, edu.field].filter(Boolean).join(" in ") || edu.school}
                </span>
                <span className="text-xs text-muted-foreground">{edu.year}</span>
              </div>
              {edu.degree && <p className="text-xs text-muted-foreground italic">{edu.school}</p>}
            </div>
          ))}
        </section>
      )}

      {data.certifications?.length > 0 && (
        <section className="mb-4">
          <SectionTitle text="Certifications" />
          {data.certifications.map((cert: any, i: number) => (
            <p key={i} className="text-sm">
              <span className="font-semibold">{cert.name}</span>
              <span className="text-muted-foreground"> - {cert.issuer}{cert.year ? ` (${cert.year})` : ""}</span>
            </p>
          ))}
        </section>
      )}
    </div>
  );
}

function StyledCoverLetterPreview({ data }: { data: any }) {
  if (!data?.senderName && !data?.opening) return <div className="p-6 text-sm text-muted-foreground">No structured data available</div>;
  return (
    <div className="p-6 sm:p-8 max-w-[640px] mx-auto space-y-4" data-testid="cover-letter-styled-preview">
      <div>
        <p className="font-semibold text-sm">{data.senderName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {data.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {(data.recipientName || data.companyName) && (
        <div className="text-sm">
          {data.recipientName && <p>{data.recipientName}</p>}
          {data.recipientTitle && <p className="text-muted-foreground">{data.recipientTitle}</p>}
          {data.companyName && <p>{data.companyName}</p>}
        </div>
      )}

      {data.opening && <p className="text-sm leading-relaxed">{data.opening}</p>}
      {data.body?.map((p: string, i: number) => (
        <p key={i} className="text-sm leading-relaxed">{p}</p>
      ))}
      {data.closing && <p className="text-sm leading-relaxed">{data.closing}</p>}

      <p className="font-semibold text-sm pt-2">{data.senderName}</p>
    </div>
  );
}

function StyledEmailPreview({ data }: { data: any }) {
  if (!data?.subject && !data?.body) return <div className="p-6 text-sm text-muted-foreground">No structured data available</div>;
  return (
    <div className="p-6 sm:p-8 max-w-[640px] mx-auto space-y-3" data-testid="email-styled-preview">
      {data.subject && (
        <div className="pb-3 border-b">
          <span className="text-xs font-medium text-muted-foreground">Subject:</span>
          <p className="text-sm font-semibold mt-0.5">{data.subject}</p>
        </div>
      )}
      {data.greeting && <p className="text-sm">{data.greeting}</p>}
      {data.body && <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.body}</p>}
      {data.signoff && (
        <div className="pt-2">
          <p className="text-sm">{data.signoff}</p>
          {data.senderName && <p className="text-sm font-semibold">{data.senderName}</p>}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-foreground/20 pb-1 mb-2">{text}</h2>
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
