import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Plus, Trash2, Save, User, Briefcase, GraduationCap, Award, Link2 } from "lucide-react";
import type { Profile } from "@shared/schema";

const profileFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  title: z.string().default(""),
  location: z.string().default(""),
  email: z.string().email("Invalid email").or(z.literal("")).default(""),
  phone: z.string().default(""),
  links: z.object({
    linkedin: z.string().default(""),
    portfolio: z.string().default(""),
    github: z.string().default(""),
  }),
  summaryBase: z.string().default(""),
  skills: z.object({
    groups: z.array(z.object({
      name: z.string(),
      items: z.array(z.string()),
    })),
  }),
  experience: z.object({
    roles: z.array(z.object({
      company: z.string(),
      title: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      bullets: z.array(z.string()),
    })),
  }),
  education: z.object({
    items: z.array(z.object({
      school: z.string(),
      degree: z.string(),
      field: z.string(),
      year: z.string(),
    })),
  }),
  certifications: z.object({
    items: z.array(z.object({
      name: z.string(),
      issuer: z.string(),
      year: z.string(),
    })),
  }),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/applykit/profile"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      title: "",
      location: "",
      email: "",
      phone: "",
      links: { linkedin: "", portfolio: "", github: "" },
      summaryBase: "",
      skills: { groups: [] },
      experience: { roles: [] },
      education: { items: [] },
      certifications: { items: [] },
    },
  });

  const skillGroups = useFieldArray({ control: form.control, name: "skills.groups" });
  const experienceRoles = useFieldArray({ control: form.control, name: "experience.roles" });
  const educationItems = useFieldArray({ control: form.control, name: "education.items" });
  const certItems = useFieldArray({ control: form.control, name: "certifications.items" });

  useEffect(() => {
    if (profile) {
      form.reset({
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
      });
    }
  }, [profile, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await apiRequest("PUT", "/api/applykit/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applykit/profile"] });
      toast({ title: "Profile saved", description: "Your profile has been updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold" data-testid="text-profile-title">Your Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">This is your master resume data used for all applications</p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={saveMutation.isPending} data-testid="button-save-profile">
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Personal Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" {...form.register("fullName")} placeholder="John Doe" data-testid="input-full-name" />
              {form.formState.errors.fullName && <p className="text-xs text-destructive mt-1">{form.formState.errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="title">Professional Title</Label>
              <Input id="title" {...form.register("title")} placeholder="Senior Software Engineer" data-testid="input-title" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...form.register("email")} placeholder="john@example.com" data-testid="input-email" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} placeholder="+1 (555) 123-4567" data-testid="input-phone" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...form.register("location")} placeholder="San Francisco, CA" data-testid="input-location" />
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
              <Input {...form.register("links.linkedin")} placeholder="linkedin.com/in/..." data-testid="input-linkedin" />
            </div>
            <div>
              <Label>Portfolio</Label>
              <Input {...form.register("links.portfolio")} placeholder="yoursite.com" data-testid="input-portfolio" />
            </div>
            <div>
              <Label>GitHub</Label>
              <Input {...form.register("links.github")} placeholder="github.com/..." data-testid="input-github" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            {...form.register("summaryBase")}
            placeholder="A brief professional summary..."
            className="mt-2 min-h-[80px]"
            data-testid="input-summary"
          />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium">Experience</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => experienceRoles.append({ company: "", title: "", location: "", startDate: "", endDate: "", bullets: [""] })}
              data-testid="button-add-experience"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Role
            </Button>
          </div>
          {experienceRoles.fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No experience added yet</p>
          )}
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
                  <Button type="button" size="icon" variant="ghost" onClick={() => experienceRoles.remove(index)} data-testid={`button-remove-role-${index}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Separator />
                <BulletEditor
                  bullets={form.watch(`experience.roles.${index}.bullets`) || [""]}
                  onChange={(bullets) => form.setValue(`experience.roles.${index}.bullets`, bullets)}
                  testIdPrefix={`role-${index}`}
                />
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
              data-testid="button-add-education"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          {educationItems.fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No education added yet</p>
          )}
          <div className="space-y-3">
            {educationItems.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="grid sm:grid-cols-4 gap-2 flex-1">
                  <Input {...form.register(`education.items.${index}.school`)} placeholder="School" data-testid={`input-school-${index}`} />
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
              <h2 className="font-medium">Skills</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => skillGroups.append({ name: "", items: [] })}
              data-testid="button-add-skill-group"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Group
            </Button>
          </div>
          {skillGroups.fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No skills added yet</p>
          )}
          <div className="space-y-3">
            {skillGroups.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    {...form.register(`skills.groups.${index}.name`)}
                    placeholder="Group name (e.g., Programming Languages)"
                    data-testid={`input-skill-group-${index}`}
                  />
                  <SkillItemsEditor
                    items={form.watch(`skills.groups.${index}.items`) || []}
                    onChange={(items) => form.setValue(`skills.groups.${index}.items`, items)}
                    testIdPrefix={`skill-group-${index}`}
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
              <Award className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium">Certifications</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => certItems.append({ name: "", issuer: "", year: "" })}
              data-testid="button-add-certification"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          {certItems.fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No certifications added yet</p>
          )}
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
      </form>
    </div>
  );
}

function BulletEditor({ bullets, onChange, testIdPrefix }: { bullets: string[]; onChange: (b: string[]) => void; testIdPrefix: string }) {
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
        <Label className="text-xs text-muted-foreground">Bullet Points</Label>
        <Button type="button" variant="ghost" size="sm" onClick={addBullet} data-testid={`button-add-bullet-${testIdPrefix}`}>
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

function SkillItemsEditor({ items, onChange, testIdPrefix }: { items: string[]; onChange: (s: string[]) => void; testIdPrefix: string }) {
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

import { useState } from "react";
