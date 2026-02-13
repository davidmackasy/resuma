import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Upload, PenLine, ArrowLeft, ArrowRight, Save, Loader2,
  Plus, Trash2, AlertTriangle, CheckCircle, User, Briefcase,
  GraduationCap, Award, Link2, FileText
} from "lucide-react";
import type { Profile } from "@shared/schema";

type Step = "choose" | "edit" | "confirm";

interface ProfileFormData {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  links: { linkedin: string; portfolio: string; github: string };
  summaryBase: string;
  skills: { groups: { name: string; items: string[] }[] };
  experience: { roles: { company: string; title: string; location: string; startDate: string; endDate: string; bullets: string[] }[] };
  education: { items: { school: string; degree: string; field: string; year: string }[] };
  certifications: { items: { name: string; issuer: string; year: string }[] };
}

const emptyFormData: ProfileFormData = {
  fullName: "", title: "", location: "", email: "", phone: "",
  links: { linkedin: "", portfolio: "", github: "" },
  summaryBase: "",
  skills: { groups: [] },
  experience: { roles: [] },
  education: { items: [] },
  certifications: { items: [] },
};

export default function ProfileSetup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("choose");
  const [method, setMethod] = useState<"upload" | "manual" | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: existingProfile } = useQuery<Profile>({
    queryKey: ["/api/applykit/profile"],
  });

  useEffect(() => {
    if (existingProfile?.structuredComplete) {
      navigate("/app/profile");
    }
  }, [existingProfile, navigate]);

  const form = useForm<ProfileFormData>({ defaultValues: emptyFormData });

  const skillGroups = useFieldArray({ control: form.control, name: "skills.groups" });
  const experienceRoles = useFieldArray({ control: form.control, name: "experience.roles" });
  const educationItems = useFieldArray({ control: form.control, name: "education.items" });
  const certItems = useFieldArray({ control: form.control, name: "certifications.items" });

  const handleUpload = useCallback(async (file: File) => {
    const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx");
    if (!isDocx) {
      toast({ title: "Unsupported File Format", description: "We currently accept resumes in DOCX format only. Please upload a .docx file to continue." });
      return;
    }

    setIsUploading(true);
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

      const data = await res.json();
      setUploadProgress(100);

      const p = data.profile;
      form.reset({
        fullName: p.fullName || "",
        title: p.title || "",
        location: p.location || "",
        email: p.email || "",
        phone: p.phone || "",
        links: p.links || { linkedin: "", portfolio: "", github: "" },
        summaryBase: p.summaryBase || "",
        skills: p.skills || { groups: [] },
        experience: p.experience || { roles: [] },
        education: p.education || { items: [] },
        certifications: p.certifications || { items: [] },
      });

      setWarnings(data.warnings || []);
      setMethod("upload");
      setStep("edit");

      toast({ title: "Resume parsed", description: "Review and edit the extracted data below." });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [form, toast]);

  const handleManual = () => {
    setMethod("manual");
    form.reset({
      ...emptyFormData,
      experience: { roles: [{ company: "", title: "", location: "", startDate: "", endDate: "", bullets: [""] }] },
      skills: { groups: [{ name: "Skills", items: [] }] },
    });
    setStep("edit");
  };

  const saveMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await apiRequest("PUT", "/api/applykit/profile", {
        ...data,
        resumeInputMethod: method,
        structuredComplete: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/profile"] });
      toast({ title: "Profile saved", description: "Your career profile is ready. You can now generate applications." });
      navigate("/app");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    },
  });

  const validateAndSave = () => {
    const data = form.getValues();
    const errors: string[] = [];

    if (!data.fullName.trim()) errors.push("Full name is required");
    const validRoles = data.experience.roles.filter(r => r.company.trim() || r.title.trim());
    if (validRoles.length === 0) errors.push("At least one work experience is required");
    const hasValidBullet = validRoles.some(r => r.bullets.some(b => b.trim()));
    if (validRoles.length > 0 && !hasValidBullet) errors.push("At least one bullet point is required in your experience");
    const validSkillGroups = data.skills.groups.filter(g => g.items.length > 0);
    if (validSkillGroups.length === 0) errors.push("At least one skill group with skills is required");

    if (errors.length > 0) {
      toast({ title: "Missing required information", description: errors.join(". "), variant: "destructive" });
      return;
    }

    saveMutation.mutate(data);
  };

  const stepNumber = step === "choose" ? 1 : step === "edit" ? 2 : 3;
  const progressPercent = (stepNumber / 3) * 100;

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          {step !== "choose" && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setStep(step === "edit" ? "choose" : "edit")}
              data-testid="button-setup-back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-bold" data-testid="text-setup-title">
              Set up your career profile
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "choose" && "Upload your resume or create one from scratch. This will be used to tailor your applications automatically."}
              {step === "edit" && "Review and edit your profile information. Make sure everything is accurate."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          {["Choose method", "Edit profile", "Save"].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                i + 1 <= stepNumber ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i + 1 < stepNumber ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${i + 1 <= stepNumber ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
            </div>
          ))}
        </div>
        <Progress value={progressPercent} className="h-1" />
      </div>

      {step === "choose" && <ChooseMethodStep onUpload={handleUpload} onManual={handleManual} isUploading={isUploading} uploadProgress={uploadProgress} />}
      {step === "edit" && (
        <EditProfileStep
          form={form}
          warnings={warnings}
          method={method}
          skillGroups={skillGroups}
          experienceRoles={experienceRoles}
          educationItems={educationItems}
          certItems={certItems}
          onSave={validateAndSave}
          isSaving={saveMutation.isPending}
        />
      )}
    </div>
  );
}

function ChooseMethodStep({
  onUpload,
  onManual,
  isUploading,
  uploadProgress,
}: {
  onUpload: (file: File) => void;
  onManual: () => void;
  isUploading: boolean;
  uploadProgress: number;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Card className="p-6 hover-elevate cursor-pointer relative" data-testid="card-upload-resume">
        <input
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          disabled={isUploading}
          data-testid="input-file-upload"
        />
        <div className="text-center">
          <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {isUploading ? (
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
            ) : (
              <Upload className="h-7 w-7 text-primary" />
            )}
          </div>
          <h3 className="font-medium text-lg mb-2">Upload Resume</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Upload a DOCX file. We'll extract your information automatically.
          </p>
          {isUploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-2">
                {uploadProgress < 30 ? "Uploading..." : uploadProgress < 80 ? "Parsing resume with AI..." : "Almost done..."}
              </p>
            </div>
          )}
          {!isUploading && (
            <Badge variant="secondary">DOCX Only</Badge>
          )}
        </div>
      </Card>

      <Card
        className="p-6 hover-elevate cursor-pointer"
        onClick={onManual}
        data-testid="card-create-manual"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <PenLine className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-medium text-lg mb-2">Create from Scratch</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Build your career profile step by step using our structured form.
          </p>
          <Badge variant="secondary">Manual Entry</Badge>
        </div>
      </Card>
    </div>
  );
}

function EditProfileStep({
  form,
  warnings,
  method,
  skillGroups,
  experienceRoles,
  educationItems,
  certItems,
  onSave,
  isSaving,
}: {
  form: any;
  warnings: string[];
  method: "upload" | "manual" | null;
  skillGroups: any;
  experienceRoles: any;
  educationItems: any;
  certItems: any;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="space-y-6">
      {warnings.length > 0 && (
        <Card className="p-4 border-orange-500/30 bg-orange-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Some information couldn't be extracted</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-0.5">
                {warnings.map((w, i) => (
                  <li key={i}>- {w}</li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-2">Please review and fill in the missing details below.</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium">Personal Information</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" {...form.register("fullName")} placeholder="John Doe" data-testid="input-setup-full-name" />
          </div>
          <div>
            <Label htmlFor="title">Professional Title</Label>
            <Input id="title" {...form.register("title")} placeholder="Senior Software Engineer" data-testid="input-setup-title" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...form.register("email")} placeholder="john@example.com" data-testid="input-setup-email" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} placeholder="+1 (555) 123-4567" data-testid="input-setup-phone" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...form.register("location")} placeholder="San Francisco, CA" data-testid="input-setup-location" />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium">Links</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label>LinkedIn</Label>
            <Input {...form.register("links.linkedin")} placeholder="linkedin.com/in/..." data-testid="input-setup-linkedin" />
          </div>
          <div>
            <Label>Portfolio</Label>
            <Input {...form.register("links.portfolio")} placeholder="yoursite.com" />
          </div>
          <div>
            <Label>GitHub</Label>
            <Input {...form.register("links.github")} placeholder="github.com/..." />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          {...form.register("summaryBase")}
          placeholder="A brief professional summary highlighting your key strengths and career focus..."
          className="mt-2 min-h-[80px]"
          data-testid="input-setup-summary"
        />
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Experience *</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => experienceRoles.append({ company: "", title: "", location: "", startDate: "", endDate: "", bullets: [""] })}
            data-testid="button-setup-add-experience"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Role
          </Button>
        </div>
        {experienceRoles.fields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Add at least one work experience</p>
        )}
        <div className="space-y-4">
          {experienceRoles.fields.map((field: any, index: number) => (
            <div key={field.id} className="border rounded-md p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="grid sm:grid-cols-2 gap-3 flex-1">
                  <Input {...form.register(`experience.roles.${index}.title`)} placeholder="Job Title" data-testid={`input-setup-role-title-${index}`} />
                  <Input {...form.register(`experience.roles.${index}.company`)} placeholder="Company" data-testid={`input-setup-role-company-${index}`} />
                  <Input {...form.register(`experience.roles.${index}.location`)} placeholder="Location" />
                  <div className="flex gap-2">
                    <Input {...form.register(`experience.roles.${index}.startDate`)} placeholder="Start" data-testid={`input-setup-role-start-${index}`} />
                    <Input {...form.register(`experience.roles.${index}.endDate`)} placeholder="End" data-testid={`input-setup-role-end-${index}`} />
                  </div>
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={() => experienceRoles.remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Separator />
              <SetupBulletEditor
                bullets={form.watch(`experience.roles.${index}.bullets`) || [""]}
                onChange={(bullets: string[]) => form.setValue(`experience.roles.${index}.bullets`, bullets)}
                testIdPrefix={`setup-role-${index}`}
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => skillGroups.append({ name: "", items: [] })}
            data-testid="button-setup-add-skill-group"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Group
          </Button>
        </div>
        {skillGroups.fields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Add at least one skill group</p>
        )}
        <div className="space-y-3">
          {skillGroups.fields.map((field: any, index: number) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  {...form.register(`skills.groups.${index}.name`)}
                  placeholder="Group name (e.g., Programming Languages)"
                  data-testid={`input-setup-skill-group-${index}`}
                />
                <SetupSkillItemsEditor
                  items={form.watch(`skills.groups.${index}.items`) || []}
                  onChange={(items: string[]) => form.setValue(`skills.groups.${index}.items`, items)}
                  testIdPrefix={`setup-skill-group-${index}`}
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => educationItems.append({ school: "", degree: "", field: "", year: "" })}
            data-testid="button-setup-add-education"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {educationItems.fields.map((field: any, index: number) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="grid sm:grid-cols-4 gap-2 flex-1">
                <Input {...form.register(`education.items.${index}.school`)} placeholder="School" data-testid={`input-setup-school-${index}`} />
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => certItems.append({ name: "", issuer: "", year: "" })}
            data-testid="button-setup-add-certification"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
        <div className="space-y-3">
          {certItems.fields.map((field: any, index: number) => (
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

      <div className="flex items-center justify-between gap-4 pb-8 sticky bottom-0 bg-background pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Required: name, at least 1 experience with bullets, at least 1 skill group
        </p>
        <Button onClick={onSave} disabled={isSaving} data-testid="button-save-career-profile">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Career Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SetupBulletEditor({ bullets, onChange, testIdPrefix }: { bullets: string[]; onChange: (b: string[]) => void; testIdPrefix: string }) {
  const addBullet = () => onChange([...bullets, ""]);
  const removeBullet = (i: number) => onChange(bullets.filter((_, idx) => idx !== i));
  const updateBullet = (i: number, val: string) => {
    const updated = [...bullets];
    updated[i] = val;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">Bullet Points *</Label>
        <Button type="button" variant="ghost" size="sm" onClick={addBullet}>
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>
      {bullets.map((bullet, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-muted-foreground text-xs mt-2.5 shrink-0">•</span>
          <Input
            value={bullet}
            onChange={(e) => updateBullet(i, e.target.value)}
            placeholder="Achievement or responsibility..."
            className="flex-1"
            data-testid={`input-bullet-${testIdPrefix}-${i}`}
          />
          {bullets.length > 1 && (
            <Button type="button" size="icon" variant="ghost" onClick={() => removeBullet(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function SetupSkillItemsEditor({ items, onChange, testIdPrefix }: { items: string[]; onChange: (s: string[]) => void; testIdPrefix: string }) {
  const [inputVal, setInputVal] = useState("");

  const addItem = () => {
    if (inputVal.trim()) {
      onChange([...items, inputVal.trim()]);
      setInputVal("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
            {item}
            <span className="ml-1 opacity-50">&times;</span>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
          placeholder="Type a skill and press Enter"
          className="flex-1"
          data-testid={`input-skill-${testIdPrefix}`}
        />
      </div>
    </div>
  );
}
