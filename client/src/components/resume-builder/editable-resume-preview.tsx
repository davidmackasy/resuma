import { useCallback, useEffect, useRef } from "react";
import type { ResumeJson } from "@shared/resume-utils";
import { sectionPathToPreviewId } from "@shared/resume-utils";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EditableResumePreviewProps {
  data: ResumeJson;
  zoom?: number;
  flashingSections?: Set<string>;
  editingSections?: Set<string>;
  onFieldChange: (path: string, value: string) => void;
}

function EditableField({
  path,
  value,
  className,
  as: Tag = "span",
  multiline,
  flashingSections,
  editingSections,
  onFieldChange,
}: {
  path: string;
  value: string;
  className?: string;
  as?: "span" | "p" | "div";
  multiline?: boolean;
  flashingSections?: Set<string>;
  editingSections?: Set<string>;
  onFieldChange: (path: string, value: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const previewId = sectionPathToPreviewId(path);
  const isFlashing = flashingSections?.has(previewId) || flashingSections?.has(path);
  const isAiEditing = editingSections?.has(path) || editingSections?.has(previewId);

  const handleBlur = useCallback(() => {
    if (!ref.current) return;
    const next = ref.current.innerText.trim();
    if (next !== value) {
      onFieldChange(path, next);
    }
  }, [onFieldChange, path, value]);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerText = value || "";
    }
  }, [value]);

  const sharedProps = {
    contentEditable: true as const,
    suppressContentEditableWarning: true,
    "data-section": previewId,
    "data-field-path": path,
    "data-placeholder": multiline ? "Click to edit…" : undefined,
    onBlur: handleBlur,
    className: cn(
      "outline-none rounded-sm transition-[background-color,box-shadow] duration-base",
      "hover:bg-primary/5 focus:bg-primary/8 focus:ring-1 focus:ring-primary/30",
      "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50",
      isFlashing && "section-edit-flash",
      isAiEditing && "ring-1 ring-primary/40 bg-primary/5",
      className
    ),
  };

  if (Tag === "p") {
    return <p ref={ref as React.RefObject<HTMLParagraphElement>} {...sharedProps} />;
  }
  if (Tag === "div") {
    return <div ref={ref as React.RefObject<HTMLDivElement>} {...sharedProps} />;
  }
  return <span ref={ref as React.RefObject<HTMLSpanElement>} {...sharedProps} />;
}

function SectionTitle({ text }: { text: string }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-foreground/20 pb-1 mb-2">
      {text}
    </h2>
  );
}

export function EditableResumePreview({
  data,
  zoom = 1,
  flashingSections,
  editingSections,
  onFieldChange,
}: EditableResumePreviewProps) {
  if (!data?.header) {
    return <div className="p-6 text-sm text-muted-foreground">No structured data available</div>;
  }

  return (
    <div
      className="origin-top transition-transform duration-base ease-premium mx-auto max-w-full overflow-x-auto"
      style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}
    >
      <div
        className="p-4 sm:p-8 w-full max-w-full sm:max-w-[680px] mx-auto break-words bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-inner min-h-[360px] sm:min-h-[480px] lg:min-h-[640px] rounded-sm"
        data-testid="resume-styled-preview"
      >
        <section data-section="header" className="text-center mb-4 relative">
          {editingSections?.has("header") ? (
            <div className="absolute -top-1 right-0 flex items-center gap-1 text-[10px] text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              AI
            </div>
          ) : null}
          <h1 className="text-xl font-bold tracking-tight">
            <EditableField
              path="header.name"
              value={data.header.name || ""}
              flashingSections={flashingSections}
              editingSections={editingSections}
              onFieldChange={onFieldChange}
            />
          </h1>
          {data.header.title !== undefined ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              <EditableField
                path="header.title"
                value={data.header.title || ""}
                flashingSections={flashingSections}
                editingSections={editingSections}
                onFieldChange={onFieldChange}
              />
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
            {data.header.email !== undefined ? (
              <EditableField path="header.email" value={data.header.email || ""} flashingSections={flashingSections} editingSections={editingSections} onFieldChange={onFieldChange} />
            ) : null}
            {data.header.phone !== undefined ? (
              <EditableField path="header.phone" value={data.header.phone || ""} flashingSections={flashingSections} editingSections={editingSections} onFieldChange={onFieldChange} />
            ) : null}
            {data.header.location !== undefined ? (
              <EditableField path="header.location" value={data.header.location || ""} flashingSections={flashingSections} editingSections={editingSections} onFieldChange={onFieldChange} />
            ) : null}
          </div>
        </section>
        <hr className="border-foreground/20 mb-4" />

        {(data.summary !== undefined || editingSections?.has("summary")) && (
          <section data-section="summary" className="mb-4 relative">
            <SectionTitle text="Professional Summary" />
            <EditableField
              path="summary"
              value={data.summary || ""}
              as="p"
              multiline
              className="text-sm leading-relaxed text-muted-foreground block min-h-[3rem]"
              flashingSections={flashingSections}
              editingSections={editingSections}
              onFieldChange={onFieldChange}
            />
          </section>
        )}

        {data.experience?.length > 0 && (
          <section data-section="experience" className="mb-4">
            <SectionTitle text="Experience" />
            {data.experience.map((role, i) => (
              <div key={i} className="mb-3">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <EditableField
                    path={`experience[${i}].title`}
                    value={role.title || ""}
                    className="text-sm font-semibold"
                    flashingSections={flashingSections}
                    editingSections={editingSections}
                    onFieldChange={onFieldChange}
                  />
                  <span className="text-xs text-muted-foreground shrink-0">
                    {role.startDate} - {role.endDate}
                  </span>
                </div>
                {(role.company || role.location) && (
                  <p className="text-xs text-muted-foreground italic">
                    <EditableField
                      path={`experience[${i}].company`}
                      value={role.company || ""}
                      flashingSections={flashingSections}
                      editingSections={editingSections}
                      onFieldChange={onFieldChange}
                    />
                    {role.location ? (
                      <>
                        {", "}
                        <EditableField
                          path={`experience[${i}].location`}
                          value={role.location || ""}
                          flashingSections={flashingSections}
                          editingSections={editingSections}
                          onFieldChange={onFieldChange}
                        />
                      </>
                    ) : null}
                  </p>
                )}
                {role.bullets?.length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-4 overflow-hidden list-disc">
                    {role.bullets.filter((b) => b.trim()).map((bullet, j) => (
                      <li key={j} className="text-sm leading-relaxed text-muted-foreground break-words">
                        <EditableField
                          path={`experience[${i}].bullets[${j}]`}
                          value={bullet}
                          flashingSections={flashingSections}
                          editingSections={editingSections}
                          onFieldChange={onFieldChange}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {data.skills?.length > 0 && (
          <section data-section="skills" className="mb-4">
            <SectionTitle text="Skills" />
            {data.skills.map((group, i) => (
              <p key={i} className="text-sm leading-relaxed">
                <EditableField
                  path={`skills[${i}].name`}
                  value={group.name || ""}
                  className="font-semibold"
                  flashingSections={flashingSections}
                  editingSections={editingSections}
                  onFieldChange={onFieldChange}
                />
                {": "}
                <EditableField
                  path={`skills[${i}].items`}
                  value={(group.items || []).join(", ")}
                  className="text-muted-foreground"
                  flashingSections={flashingSections}
                  editingSections={editingSections}
                  onFieldChange={onFieldChange}
                />
              </p>
            ))}
          </section>
        )}

        {data.education?.length > 0 && (
          <section data-section="education" className="mb-4">
            <SectionTitle text="Education" />
            {data.education.map((edu, i) => (
              <div key={i} className="mb-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <EditableField
                    path={`education[${i}].degree`}
                    value={[edu.degree, edu.field].filter(Boolean).join(" in ") || edu.school || ""}
                    className="text-sm font-semibold"
                    flashingSections={flashingSections}
                    editingSections={editingSections}
                    onFieldChange={onFieldChange}
                  />
                  <span className="text-xs text-muted-foreground">{edu.year}</span>
                </div>
                {edu.degree && (
                  <EditableField
                    path={`education[${i}].school`}
                    value={edu.school || ""}
                    className="text-xs text-muted-foreground italic block"
                    flashingSections={flashingSections}
                    editingSections={editingSections}
                    onFieldChange={onFieldChange}
                  />
                )}
              </div>
            ))}
          </section>
        )}

        {data.certifications?.length ? (
          <section data-section="certifications" className="mb-4">
            <SectionTitle text="Certifications" />
            {data.certifications.map((cert, i) => (
              <p key={i} className="text-sm">
                <EditableField
                  path={`certifications[${i}].name`}
                  value={cert.name || ""}
                  className="font-semibold"
                  flashingSections={flashingSections}
                  editingSections={editingSections}
                  onFieldChange={onFieldChange}
                />
                <span className="text-muted-foreground">
                  {" "}- {cert.issuer}{cert.year ? ` (${cert.year})` : ""}
                </span>
              </p>
            ))}
          </section>
        ) : null}
      </div>
    </div>
  );
}
