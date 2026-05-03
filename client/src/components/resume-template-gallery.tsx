import { CheckCircle2 } from "lucide-react";

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  promptModifier: string;
  accentHex: string;
}

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: "modern_minimal",
    name: "Modern Minimal",
    description: "Clean lines and generous whitespace for a contemporary feel.",
    bestFor: "Design, Marketing, Product",
    promptModifier: "Use a clean, minimal layout with clear section separation. Left-align the header with the full name in bold, followed by title and contact in smaller text. Use dash bullets. Prioritize whitespace and readability.",
    accentHex: "#22c55e",
  },
  {
    id: "executive_clean",
    name: "Executive Clean",
    description: "Polished and authoritative. Best for senior leadership roles.",
    bestFor: "C-Suite, Directors, VP",
    promptModifier: "Use an elegant, authoritative layout. Center the header with name in large bold text. Use small-caps section titles. Keep bullet points concise and achievement-focused. Generous line spacing.",
    accentHex: "#1d4ed8",
  },
  {
    id: "tech_product",
    name: "Tech & Product",
    description: "Optimized for technical roles. Skills and stack front and center.",
    bestFor: "Engineering, Data, DevOps",
    promptModifier: "Use a technical, precise layout. Left-align everything. Display skills as grouped categories near the top. Use dash-style bullets with technical specificity. Include GitHub/portfolio links prominently.",
    accentHex: "#7c3aed",
  },
  {
    id: "corporate_classic",
    name: "Corporate Classic",
    description: "Traditional format trusted in enterprise and finance environments.",
    bestFor: "Finance, Law, Consulting",
    promptModifier: "Use a traditional, conservative layout. Center the header. Use double-line section dividers. Formal language. Certifications and education given high prominence. Standard bullet points.",
    accentHex: "#334155",
  },
  {
    id: "creative_edge",
    name: "Creative Edge",
    description: "A modern asymmetric layout with a strong visual accent.",
    bestFor: "Creative, UX, Branding",
    promptModifier: "Use a modern asymmetric layout with a left accent border on sections. Left-align the name in a large, distinctive font. Skills displayed as compact tags. Portfolio link prominently featured.",
    accentHex: "#f59e0b",
  },
  {
    id: "student_starter",
    name: "Student Starter",
    description: "Simple and clear — ideal for new grads and entry-level roles.",
    bestFor: "New Grads, Internships, Entry-Level",
    promptModifier: "Use a clean, simple layout appropriate for entry-level candidates. Place education near the top before experience. Highlight projects, coursework, and transferable skills. No need for many experience entries.",
    accentHex: "#0ea5e9",
  },
  {
    id: "sales_resume",
    name: "Sales & Growth",
    description: "Results-focused with bold metrics and achievement-first bullets.",
    bestFor: "Sales, BizDev, Account Mgmt",
    promptModifier: "Use a bold, results-oriented layout. Lead with quantified achievements in every bullet (revenue, quota attainment, growth %). Strong summary paragraph. Bold company/role titles. Achievement-first writing style.",
    accentHex: "#ef4444",
  },
  {
    id: "simple_ats",
    name: "Simple ATS",
    description: "Bare-bones, keyword-rich, and parseable by any ATS system.",
    bestFor: "High-volume Applications, ATS-heavy",
    promptModifier: "Use the most ATS-compatible plain layout. No tables, no columns, no special characters. Plain bullet points. Standard section names (Summary, Experience, Skills, Education). Keyword density maximized.",
    accentHex: "#6b7280",
  },
];

const SAMPLE = {
  name: "Alex Johnson",
  title: "Senior Product Designer",
  email: "alex@email.com",
  phone: "(555) 123-4567",
  location: "New York, NY",
  linkedin: "linkedin.com/in/alexj",
};

function Line({ w = "full", h = 1, color = "#e5e7eb" }: { w?: string | number; h?: number; color?: string }) {
  const width = typeof w === "number" ? `${w}%` : w === "full" ? "100%" : w;
  return <div style={{ height: h, width, backgroundColor: color, borderRadius: 2, marginBottom: 2 }} />;
}

function SectionLines({ rows = 3, accent = "#e5e7eb" }: { rows?: number; accent?: string }) {
  const widths = [100, 90, 78, 85, 70, 82];
  return (
    <div style={{ marginTop: 4 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: accent, marginRight: 4, flexShrink: 0 }} />
          <Line w={widths[i % widths.length]} h={1} color="#d1d5db" />
        </div>
      ))}
    </div>
  );
}

function ModernMinimalPreview({ accent }: { accent: string }) {
  return (
    <div style={{ background: "#fff", height: "100%", padding: "14px 12px", fontFamily: "sans-serif", color: "#111" }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.3, marginBottom: 1 }}>{SAMPLE.name.toUpperCase()}</div>
      <div style={{ fontSize: 6, color: "#555", marginBottom: 2 }}>{SAMPLE.title}</div>
      <div style={{ fontSize: 5, color: "#888", marginBottom: 6 }}>{SAMPLE.email} · {SAMPLE.phone}</div>
      <div style={{ height: 1.5, background: accent, width: "100%", marginBottom: 8 }} />
      {["SUMMARY", "EXPERIENCE", "SKILLS", "EDUCATION"].map((sec, i) => (
        <div key={sec} style={{ marginBottom: i < 3 ? 8 : 0 }}>
          <div style={{ fontSize: 5.5, fontWeight: 700, letterSpacing: 1, color: "#111", marginBottom: 3, textTransform: "uppercase" }}>{sec}</div>
          <div style={{ height: 0.5, background: "#e5e7eb", marginBottom: 4 }} />
          {sec === "SKILLS" ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {["Figma", "Research", "Prototyping", "Systems"].map(s => (
                <div key={s} style={{ background: `${accent}20`, color: accent, fontSize: 4.5, padding: "1px 4px", borderRadius: 2, fontWeight: 600 }}>{s}</div>
              ))}
            </div>
          ) : (
            <SectionLines rows={sec === "SUMMARY" ? 2 : sec === "EXPERIENCE" ? 3 : 2} accent={accent} />
          )}
        </div>
      ))}
    </div>
  );
}

function ExecutiveCleanPreview({ accent }: { accent: string }) {
  return (
    <div style={{ background: "#fff", height: "100%", padding: "14px 12px", fontFamily: "Georgia, serif", color: "#111" }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 1 }}>{SAMPLE.name}</div>
        <div style={{ fontSize: 6, color: "#555", marginBottom: 2 }}>{SAMPLE.title}</div>
        <div style={{ fontSize: 5, color: "#888" }}>{SAMPLE.email} · {SAMPLE.location}</div>
      </div>
      <div style={{ height: 1, background: accent, marginBottom: 1 }} />
      <div style={{ height: 0.5, background: "#d1d5db", marginBottom: 8 }} />
      {["PROFILE", "EXPERIENCE", "EDUCATION", "SKILLS"].map((sec, i) => (
        <div key={sec} style={{ marginBottom: i < 3 ? 8 : 0 }}>
          <div style={{ fontSize: 5.5, fontWeight: 700, letterSpacing: 2, color: accent, marginBottom: 3, textTransform: "uppercase" }}>{sec}</div>
          <SectionLines rows={sec === "EXPERIENCE" ? 4 : 2} accent={accent} />
        </div>
      ))}
    </div>
  );
}

function TechProductPreview({ accent }: { accent: string }) {
  return (
    <div style={{ background: "#fafafa", height: "100%", padding: "14px 12px", fontFamily: "monospace", color: "#111" }}>
      <div style={{ fontSize: 9, fontWeight: 800, marginBottom: 1 }}>{SAMPLE.name}</div>
      <div style={{ fontSize: 6, color: accent, fontFamily: "monospace", marginBottom: 2 }}>{SAMPLE.title}</div>
      <div style={{ fontSize: 5, color: "#888", marginBottom: 6, fontFamily: "sans-serif" }}>{SAMPLE.github || "github.com/alexj"} · {SAMPLE.linkedin}</div>
      <div style={{ marginBottom: 7 }}>
        <div style={{ fontSize: 5.5, fontWeight: 700, color: accent, fontFamily: "monospace", textTransform: "uppercase", marginBottom: 3 }}>// SKILLS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {["React", "TypeScript", "Python", "AWS", "SQL"].map(s => (
            <div key={s} style={{ background: `${accent}18`, border: `0.5px solid ${accent}40`, color: "#333", fontSize: 4.5, padding: "1px 4px", borderRadius: 2 }}>{s}</div>
          ))}
        </div>
      </div>
      {["// EXPERIENCE", "// EDUCATION"].map((sec, i) => (
        <div key={sec} style={{ marginBottom: i < 1 ? 7 : 0 }}>
          <div style={{ fontSize: 5.5, fontWeight: 700, color: accent, fontFamily: "monospace", marginBottom: 3 }}>{sec}</div>
          <SectionLines rows={sec.includes("EXP") ? 4 : 2} accent={accent} />
        </div>
      ))}
    </div>
  );
}

function CorporateClassicPreview({ accent }: { accent: string }) {
  return (
    <div style={{ background: "#fff", height: "100%", padding: "14px 12px", fontFamily: "Georgia, serif", color: "#111" }}>
      <div style={{ textAlign: "center", paddingBottom: 5, marginBottom: 5, borderBottom: `2px double ${accent}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, marginBottom: 1 }}>{SAMPLE.name}</div>
        <div style={{ fontSize: 5.5, color: "#555", marginBottom: 1 }}>{SAMPLE.title}</div>
        <div style={{ fontSize: 5, color: "#888" }}>{SAMPLE.email} · {SAMPLE.phone} · {SAMPLE.location}</div>
      </div>
      {["PROFESSIONAL SUMMARY", "EXPERIENCE", "EDUCATION", "CERTIFICATIONS"].map((sec, i) => (
        <div key={sec} style={{ marginBottom: i < 3 ? 7 : 0 }}>
          <div style={{ fontSize: 5.5, fontWeight: 700, letterSpacing: 0.8, color: "#111", marginBottom: 2, textAlign: "center", textTransform: "uppercase" }}>{sec}</div>
          <div style={{ height: 0.5, background: "#d1d5db", marginBottom: 4 }} />
          <SectionLines rows={sec.includes("EXP") ? 4 : 2} accent={accent} />
        </div>
      ))}
    </div>
  );
}

function CreativeEdgePreview({ accent }: { accent: string }) {
  return (
    <div style={{ background: "#fff", height: "100%", fontFamily: "sans-serif", color: "#111", display: "flex", flexDirection: "column" }}>
      <div style={{ background: accent, padding: "10px 12px 8px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", marginBottom: 1 }}>{SAMPLE.name}</div>
        <div style={{ fontSize: 6, color: "rgba(255,255,255,0.85)" }}>{SAMPLE.title}</div>
      </div>
      <div style={{ padding: "8px 12px", flex: 1 }}>
        <div style={{ fontSize: 5, color: "#888", marginBottom: 8 }}>{SAMPLE.email} · {SAMPLE.location}</div>
        {["EXPERIENCE", "SKILLS", "EDUCATION"].map((sec, i) => (
          <div key={sec} style={{ marginBottom: i < 2 ? 7 : 0, paddingLeft: 6, borderLeft: `2px solid ${accent}` }}>
            <div style={{ fontSize: 5.5, fontWeight: 700, color: accent, marginBottom: 3, textTransform: "uppercase" }}>{sec}</div>
            {sec === "SKILLS" ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {["Figma", "Sketch", "Research", "Strategy"].map(s => (
                  <div key={s} style={{ background: `${accent}18`, fontSize: 4.5, padding: "1px 4px", borderRadius: 2, color: "#333" }}>{s}</div>
                ))}
              </div>
            ) : (
              <SectionLines rows={sec === "EXPERIENCE" ? 4 : 2} accent={accent} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentStarterPreview({ accent }: { accent: string }) {
  return (
    <div style={{ background: "#fff", height: "100%", padding: "14px 12px", fontFamily: "sans-serif", color: "#111" }}>
      <div style={{ marginBottom: 6, paddingBottom: 5, borderBottom: `1.5px solid ${accent}` }}>
        <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 1 }}>{SAMPLE.name}</div>
        <div style={{ fontSize: 6, color: "#555", marginBottom: 1 }}>Computer Science Student · Class of 2025</div>
        <div style={{ fontSize: 5, color: "#888" }}>{SAMPLE.email} · {SAMPLE.phone}</div>
      </div>
      {["EDUCATION", "PROJECTS", "EXPERIENCE", "SKILLS"].map((sec, i) => (
        <div key={sec} style={{ marginBottom: i < 3 ? 7 : 0 }}>
          <div style={{ fontSize: 5.5, fontWeight: 700, color: accent, marginBottom: 3, textTransform: "uppercase" }}>{sec}</div>
          <div style={{ height: 0.5, background: "#e5e7eb", marginBottom: 3 }} />
          <SectionLines rows={sec === "PROJECTS" ? 4 : 2} accent={accent} />
        </div>
      ))}
    </div>
  );
}

function SalesResumePreview({ accent }: { accent: string }) {
  return (
    <div style={{ background: "#fff", height: "100%", fontFamily: "sans-serif", color: "#111" }}>
      <div style={{ padding: "10px 12px 8px", borderBottom: `3px solid ${accent}` }}>
        <div style={{ fontSize: 10, fontWeight: 900, marginBottom: 1, letterSpacing: -0.3 }}>{SAMPLE.name}</div>
        <div style={{ fontSize: 6, color: accent, fontWeight: 700 }}>SENIOR ACCOUNT EXECUTIVE · $2.4M ARR</div>
      </div>
      <div style={{ padding: "8px 12px" }}>
        <div style={{ fontSize: 5, color: "#888", marginBottom: 7 }}>{SAMPLE.email} · {SAMPLE.phone} · {SAMPLE.location}</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 7 }}>
          {["125% Quota", "$2.4M ARR", "Top 5%"].map(badge => (
            <div key={badge} style={{ background: `${accent}15`, border: `0.5px solid ${accent}40`, color: accent, fontSize: 4.5, padding: "2px 5px", borderRadius: 3, fontWeight: 700 }}>{badge}</div>
          ))}
        </div>
        {["ACHIEVEMENTS", "EXPERIENCE", "EDUCATION"].map((sec, i) => (
          <div key={sec} style={{ marginBottom: i < 2 ? 7 : 0 }}>
            <div style={{ fontSize: 5.5, fontWeight: 800, color: "#111", marginBottom: 3, textTransform: "uppercase" }}>{sec}</div>
            <SectionLines rows={sec === "EXPERIENCE" ? 4 : 2} accent={accent} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleATSPreview({ accent }: { accent: string }) {
  return (
    <div style={{ background: "#fff", height: "100%", padding: "14px 12px", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <div style={{ marginBottom: 7 }}>
        <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 1 }}>{SAMPLE.name}</div>
        <div style={{ fontSize: 5.5, color: "#333", marginBottom: 1 }}>{SAMPLE.title}</div>
        <div style={{ fontSize: 5, color: "#555" }}>{SAMPLE.email} | {SAMPLE.phone} | {SAMPLE.location}</div>
      </div>
      {["SUMMARY", "EXPERIENCE", "SKILLS", "EDUCATION"].map((sec, i) => (
        <div key={sec} style={{ marginBottom: i < 3 ? 7 : 0 }}>
          <div style={{ fontSize: 6, fontWeight: 700, color: "#111", marginBottom: 2, textTransform: "uppercase", borderBottom: "0.5px solid #999", paddingBottom: 1 }}>{sec}</div>
          <SectionLines rows={sec === "EXPERIENCE" ? 4 : sec === "SKILLS" ? 2 : 2} accent="#6b7280" />
        </div>
      ))}
    </div>
  );
}

const PREVIEW_COMPONENTS: Record<string, (props: { accent: string }) => JSX.Element> = {
  modern_minimal: ModernMinimalPreview,
  executive_clean: ExecutiveCleanPreview,
  tech_product: TechProductPreview,
  corporate_classic: CorporateClassicPreview,
  creative_edge: CreativeEdgePreview,
  student_starter: StudentStarterPreview,
  sales_resume: SalesResumePreview,
  simple_ats: SimpleATSPreview,
};

function TemplatePreview({ templateId, accentHex }: { templateId: string; accentHex: string }) {
  const PreviewComp = PREVIEW_COMPONENTS[templateId];
  if (!PreviewComp) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-gray-400 text-xs">Preview</div>
      </div>
    );
  }
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
      <div style={{
        transform: "scale(0.44)",
        transformOrigin: "top left",
        width: "340px",
        height: "440px",
        position: "absolute",
        top: 0,
        left: 0,
      }}>
        <PreviewComp accent={accentHex} />
      </div>
    </div>
  );
}

interface ResumeTemplateGalleryProps {
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function ResumeTemplateGallery({ selectedId, onSelect, isLoading }: ResumeTemplateGalleryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-muted/30 animate-pulse">
            <div className="aspect-[3/4] w-full bg-muted/50 rounded-t-xl" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-2 bg-muted rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {TEMPLATE_CONFIGS.map((tpl) => {
        const isSelected = selectedId === tpl.id;
        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelect(tpl.id)}
            className={`group relative rounded-xl border text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isSelected
                ? "border-primary shadow-md ring-1 ring-primary"
                : "border-border hover:border-primary/40"
            }`}
            data-testid={`button-template-${tpl.id}`}
          >
            {/* Selected badge */}
            {isSelected && (
              <div className="absolute top-2 right-2 z-10">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              </div>
            )}

            {/* Resume preview */}
            <div
              className={`w-full rounded-t-xl overflow-hidden border-b ${isSelected ? "border-primary/30" : "border-border/60"}`}
              style={{ aspectRatio: "3/4", background: "#f9fafb" }}
            >
              <TemplatePreview templateId={tpl.id} accentHex={tpl.accentHex} />
            </div>

            {/* Meta */}
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold leading-tight truncate">{tpl.name}</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{tpl.description}</p>
              <div className="pt-0.5">
                <span className="text-[9px] font-semibold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {tpl.bestFor}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
