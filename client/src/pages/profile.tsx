import { useState } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Trash2, Save, User, Briefcase, GraduationCap,
  Award, Link2, PenLine, Upload, RefreshCw, Loader2,
  CheckCircle, AlertTriangle, FileText, LogOut, Settings
} from "lucide-react";
import type { Profile } from "@shared/schema";

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/applykit/profile"],
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!profile?.structuredComplete) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif font-bold text-xl mb-2">Set up your career profile</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Upload your resume or create one from scratch to get started with tailored applications.
          </p>
          <Button onClick={() => navigate("/app/profile/setup")} data-testid="button-go-setup">
            Get Started
          </Button>
        </Card>
      </div>
    );
  }

  if (isEditing) {
    return <ProfileEditor profile={profile} onDone={() => setIsEditing(false)} />;
  }

  const exp = profile.experience as any;
  const skills = profile.skills as any;
  const edu = profile.education as any;
  const certs = profile.certifications as any;
  const links = profile.links as any;

  const handleReplaceUpload = async (file: File) => {
    setIsReplacing(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploadProgress(30);
      const res = await fetch("/api/applykit/profile/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      setUploadProgress(80);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/profile"] });
      toast({ title: "Resume replaced", description: "Your profile has been updated with the new resume. Please review and save." });
      setIsEditing(true);
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsReplacing(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold" data-testid="text-profile-title">Career Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Your master resume data used for all applications</p>
        </div>
        <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
          <PenLine className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-lg" data-testid="text-profile-name">{profile.fullName}</h2>
            {profile.title && <p className="text-muted-foreground" data-testid="text-profile-job-title">{profile.title}</p>}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              {profile.location && <span>{profile.location}</span>}
              {profile.email && <span>{profile.email}</span>}
              {profile.phone && <span>{profile.phone}</span>}
            </div>
            {(links?.linkedin || links?.portfolio || links?.github) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {links.linkedin && <Badge variant="secondary">LinkedIn</Badge>}
                {links.portfolio && <Badge variant="secondary">Portfolio</Badge>}
                {links.github && <Badge variant="secondary">GitHub</Badge>}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <Badge variant={profile.structuredComplete ? "default" : "secondary"}>
              {profile.structuredComplete ? "Complete" : "Incomplete"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {profile.resumeInputMethod === "upload" ? "Uploaded" : "Manual"}
              {profile.resumeVersion > 1 && ` · v${profile.resumeVersion}`}
            </p>
          </div>
        </div>
      </Card>

      {profile.summaryBase && (
        <Card className="p-5">
          <h3 className="font-medium text-sm mb-2">Professional Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.summaryBase}</p>
        </Card>
      )}

      {exp?.roles?.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Experience</h3>
            <Badge variant="secondary" className="text-xs">{exp.roles.length}</Badge>
          </div>
          <div className="space-y-4">
            {exp.roles.map((role: any, i: number) => (
              <div key={i} className={i > 0 ? "pt-4 border-t" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{role.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {role.company}{role.location && ` · ${role.location}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {role.startDate} - {role.endDate}
                  </span>
                </div>
                {role.bullets?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {role.bullets.filter((b: string) => b.trim()).map((bullet: string, j: number) => (
                      <li key={j} className="text-sm text-muted-foreground flex gap-2">
                        <span className="shrink-0">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {skills?.groups?.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Skills</h3>
          </div>
          <div className="space-y-3">
            {skills.groups.map((group: any, i: number) => (
              <div key={i}>
                <p className="text-sm font-medium mb-1.5">{group.name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item: string, j: number) => (
                    <Badge key={j} variant="secondary">{item}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {edu?.items?.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Education</h3>
          </div>
          <div className="space-y-2">
            {edu.items.map((item: any, i: number) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{item.degree} in {item.field}</p>
                <p className="text-muted-foreground">{item.school} · {item.year}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {certs?.items?.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Certifications</h3>
          </div>
          <div className="space-y-2">
            {certs.items.map((item: any, i: number) => (
              <div key={i} className="text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground">{item.issuer} · {item.year}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="font-medium text-sm mb-3">Replace Resume</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Upload a new resume to update your profile. Your existing data will be replaced with the parsed content.
        </p>
        <div className="relative">
          <input
            type="file"
            accept=".pdf,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleReplaceUpload(file);
            }}
            disabled={isReplacing}
            data-testid="input-replace-resume"
          />
          <Button variant="outline" disabled={isReplacing}>
            {isReplacing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Upload New Resume
              </>
            )}
          </Button>
        </div>
        {isReplacing && <Progress value={uploadProgress} className="h-1 mt-3" />}
      </Card>

      <div className="md:hidden space-y-3 pt-2 pb-6">
        <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
        <Link href="/app/settings">
          <Button variant="outline" className="w-full justify-start" data-testid="button-profile-settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <a href="/api/logout" className="block">
          <Button
            variant="outline"
            className="w-full border-destructive/30 text-destructive"
            data-testid="button-profile-sign-out"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </a>
      </div>
    </div>
  );
}

function ProfileEditor({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      fullName: profile.fullName || "",
      title: profile.title || "",
      location: profile.location || "",
      email: profile.email || "",
      phone: profile.phone || "",
      links: (profile.links as any) || { linkedin: "", portfolio: "", github: "" },
      summaryBase: profile.summaryBase || "",
      skills: (profile.skills as any) || { groups: [] },
      experience: (profile.experience as any) || { roles: [] },
      education: (profile.education as any) || { items: [] },
      certifications: (profile.certifications as any) || { items: [] },
    },
  });

  const skillGroups = useFieldArray({ control: form.control, name: "skills.groups" });
  const experienceRoles = useFieldArray({ control: form.control, name: "experience.roles" });
  const educationItems = useFieldArray({ control: form.control, name: "education.items" });
  const certItems = useFieldArray({ control: form.control, name: "certifications.items" });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/applykit/profile", {
        ...data,
        structuredComplete: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/profile"] });
      toast({ title: "Profile saved", description: "Your career profile has been updated." });
      onDone();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    },
  });

  const validateAndSave = () => {
    const data = form.getValues();
    const errors: string[] = [];
    if (!data.fullName.trim()) errors.push("Full name is required");
    const validRoles = data.experience.roles.filter((r: any) => r.company?.trim() || r.title?.trim());
    if (validRoles.length === 0) errors.push("At least one work experience is required");
    const validSkillGroups = data.skills.groups.filter((g: any) => g.items?.length > 0);
    if (validSkillGroups.length === 0) errors.push("At least one skill group with skills is required");

    if (errors.length > 0) {
      toast({ title: "Missing required information", description: errors.join(". "), variant: "destructive" });
      return;
    }
    saveMutation.mutate(data);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold" data-testid="text-profile-title">Edit Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Update your career profile information</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onDone} data-testid="button-cancel-edit">Cancel</Button>
          <Button onClick={validateAndSave} disabled={saveMutation.isPending} data-testid="button-save-profile">
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium">Personal Information</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Full Name *</Label>
            <Input {...form.register("fullName")} placeholder="John Doe" data-testid="input-full-name" />
          </div>
          <div>
            <Label>Professional Title</Label>
            <Input {...form.register("title")} placeholder="Senior Software Engineer" data-testid="input-title" />
          </div>
          <div>
            <Label>Email</Label>
            <Input {...form.register("email")} placeholder="john@example.com" data-testid="input-email" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...form.register("phone")} placeholder="+1 (555) 123-4567" data-testid="input-phone" />
          </div>
          <div className="sm:col-span-2">
            <Label>Location</Label>
            <Input {...form.register("location")} placeholder="San Francisco, CA" data-testid="input-location" />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium">Links</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><Label>LinkedIn</Label><Input {...form.register("links.linkedin")} placeholder="linkedin.com/in/..." /></div>
          <div><Label>Portfolio</Label><Input {...form.register("links.portfolio")} placeholder="yoursite.com" /></div>
          <div><Label>GitHub</Label><Input {...form.register("links.github")} placeholder="github.com/..." /></div>
        </div>
      </Card>

      <Card className="p-5">
        <Label>Professional Summary</Label>
        <Textarea {...form.register("summaryBase")} placeholder="A brief professional summary..." className="mt-2 min-h-[80px]" />
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Experience *</h2>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => experienceRoles.append({ company: "", title: "", location: "", startDate: "", endDate: "", bullets: [""] })} data-testid="button-add-experience">
            <Plus className="mr-1 h-3.5 w-3.5" />Add Role
          </Button>
        </div>
        <div className="space-y-4">
          {experienceRoles.fields.map((field, index) => (
            <div key={field.id} className="border rounded-md p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="grid sm:grid-cols-2 gap-3 flex-1">
                  <Input {...form.register(`experience.roles.${index}.title`)} placeholder="Job Title" data-testid={`input-role-title-${index}`} />
                  <Input {...form.register(`experience.roles.${index}.company`)} placeholder="Company" data-testid={`input-role-company-${index}`} />
                  <Input {...form.register(`experience.roles.${index}.location`)} placeholder="Location" />
                  <div className="flex gap-2">
                    <Input {...form.register(`experience.roles.${index}.startDate`)} placeholder="Start" />
                    <Input {...form.register(`experience.roles.${index}.endDate`)} placeholder="End" />
                  </div>
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={() => experienceRoles.remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Separator />
              <EditorBullets
                bullets={form.watch(`experience.roles.${index}.bullets`) || [""]}
                onChange={(bullets) => form.setValue(`experience.roles.${index}.bullets`, bullets)}
                prefix={`role-${index}`}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Skills *</h2>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => skillGroups.append({ name: "", items: [] })} data-testid="button-add-skill-group">
            <Plus className="mr-1 h-3.5 w-3.5" />Add Group
          </Button>
        </div>
        <div className="space-y-3">
          {skillGroups.fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input {...form.register(`skills.groups.${index}.name`)} placeholder="Group name (e.g., Programming Languages)" data-testid={`input-skill-group-${index}`} />
                <EditorSkills
                  items={form.watch(`skills.groups.${index}.items`) || []}
                  onChange={(items) => form.setValue(`skills.groups.${index}.items`, items)}
                  prefix={`skill-group-${index}`}
                />
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => skillGroups.remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Education</h2>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => educationItems.append({ school: "", degree: "", field: "", year: "" })} data-testid="button-add-education">
            <Plus className="mr-1 h-3.5 w-3.5" />Add
          </Button>
        </div>
        <div className="space-y-3">
          {educationItems.fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="grid sm:grid-cols-4 gap-2 flex-1">
                <Input {...form.register(`education.items.${index}.school`)} placeholder="School" />
                <Input {...form.register(`education.items.${index}.degree`)} placeholder="Degree" />
                <Input {...form.register(`education.items.${index}.field`)} placeholder="Field" />
                <Input {...form.register(`education.items.${index}.year`)} placeholder="Year" />
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => educationItems.remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Certifications</h2>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => certItems.append({ name: "", issuer: "", year: "" })} data-testid="button-add-certification">
            <Plus className="mr-1 h-3.5 w-3.5" />Add
          </Button>
        </div>
        <div className="space-y-3">
          {certItems.fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="grid sm:grid-cols-3 gap-2 flex-1">
                <Input {...form.register(`certifications.items.${index}.name`)} placeholder="Certification Name" />
                <Input {...form.register(`certifications.items.${index}.issuer`)} placeholder="Issuer" />
                <Input {...form.register(`certifications.items.${index}.year`)} placeholder="Year" />
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => certItems.remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function EditorBullets({ bullets, onChange, prefix }: { bullets: string[]; onChange: (b: string[]) => void; prefix: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">Bullet Points</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...bullets, ""])}>
          <Plus className="mr-1 h-3 w-3" />Add
        </Button>
      </div>
      {bullets.map((bullet, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-muted-foreground text-xs mt-2.5 shrink-0">•</span>
          <Input value={bullet} onChange={(e) => { const u = [...bullets]; u[i] = e.target.value; onChange(u); }} placeholder="Achievement or responsibility..." className="flex-1" />
          {bullets.length > 1 && (
            <Button type="button" size="icon" variant="ghost" onClick={() => onChange(bullets.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function EditorSkills({ items, onChange, prefix }: { items: string[]; onChange: (s: string[]) => void; prefix: string }) {
  const [inputVal, setInputVal] = useState("");
  const addItem = () => { if (inputVal.trim()) { onChange([...items, inputVal.trim()]); setInputVal(""); } };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            {item}<span className="ml-1 opacity-50">&times;</span>
          </Badge>
        ))}
      </div>
      <Input
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
        placeholder="Type a skill and press Enter"
      />
    </div>
  );
}
