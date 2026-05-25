import { Check, Sparkles, Briefcase, Code2, Building2, Palette, GraduationCap, TrendingUp, Shield } from "lucide-react";

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  promptModifier: string;
  accentHex: string;
  tags: string[];
  structure: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: "modern_minimal",
    name: "Modern Minimal",
    description: "Clean layout with strong spacing and clear section structure. Great for a contemporary feel.",
    bestFor: "Design, Marketing, Product",
    tags: ["Design", "Marketing", "Product", "General"],
    structure: "Name · Summary · Experience · Skills",
    icon: Sparkles,
    promptModifier: "Use a clean, minimal layout with clear section separation. Left-align the header with the full name in bold, followed by title and contact in smaller text. Use dash bullets. Prioritize whitespace and readability.",
    accentHex: "#22c55e",
  },
  {
    id: "executive_clean",
    name: "Executive Clean",
    description: "Polished and authoritative format built for senior professionals and leadership roles.",
    bestFor: "C-Suite, Directors, VP",
    tags: ["Managers", "Directors", "Executives", "VP"],
    structure: "Name · Profile · Experience · Education",
    icon: Briefcase,
    promptModifier: "Use an elegant, authoritative layout. Center the header with name in large bold text. Use small-caps section titles. Keep bullet points concise and achievement-focused. Generous line spacing.",
    accentHex: "#1d4ed8",
  },
  {
    id: "tech_product",
    name: "Tech Focus",
    description: "Skill-first resume built for technical roles. Stack and tools displayed front and center.",
    bestFor: "Engineering, Data, DevOps",
    tags: ["Software", "Data", "Engineering", "DevOps"],
    structure: "Name · Skills · Experience · Education",
    icon: Code2,
    promptModifier: "Use a technical, precise layout. Left-align everything. Display skills as grouped categories near the top. Use dash-style bullets with technical specificity. Include GitHub/portfolio links prominently.",
    accentHex: "#7c3aed",
  },
  {
    id: "corporate_classic",
    name: "Professional Classic",
    description: "Traditional format built for corporate and office environments. Trusted by hiring managers.",
    bestFor: "Finance, Law, Consulting",
    tags: ["Finance", "Admin", "Law", "Consulting"],
    structure: "Name · Summary · Experience · Certifications",
    icon: Building2,
    promptModifier: "Use a traditional, conservative layout. Center the header. Use double-line section dividers. Formal language. Certifications and education given high prominence. Standard bullet points.",
    accentHex: "#334155",
  },
  {
    id: "creative_edge",
    name: "Creative Professional",
    description: "Clean creative layout with a strong visual accent that still stays fully ATS-friendly.",
    bestFor: "Creative, UX, Branding",
    tags: ["Creators", "Designers", "Content", "Brand"],
    structure: "Name · Experience · Skills · Portfolio",
    icon: Palette,
    promptModifier: "Use a modern asymmetric layout with a left accent border on sections. Left-align the name in a large, distinctive font. Skills displayed as compact tags. Portfolio link prominently featured.",
    accentHex: "#f59e0b",
  },
  {
    id: "student_starter",
    name: "Student Starter",
    description: "Simple and clear layout ideal for students, interns, and entry-level applicants.",
    bestFor: "New Grads, Internships, Entry-Level",
    tags: ["Students", "Internships", "New Grads", "Part-time"],
    structure: "Name · Education · Projects · Experience",
    icon: GraduationCap,
    promptModifier: "Use a clean, simple layout appropriate for entry-level candidates. Place education near the top before experience. Highlight projects, coursework, and transferable skills. No need for many experience entries.",
    accentHex: "#0ea5e9",
  },
  {
    id: "sales_resume",
    name: "Sales & Growth",
    description: "Results-focused layout leading with metrics, quota attainment, and revenue impact.",
    bestFor: "Sales, BizDev, Account Mgmt",
    tags: ["Sales", "Growth", "Customer Success", "BizDev"],
    structure: "Name · Achievements · Experience · Skills",
    icon: TrendingUp,
    promptModifier: "Use a bold, results-oriented layout. Lead with quantified achievements in every bullet (revenue, quota attainment, growth %). Strong summary paragraph. Bold company/role titles. Achievement-first writing style.",
    accentHex: "#ef4444",
  },
  {
    id: "simple_ats",
    name: "Simple ATS",
    description: "Bare-bones, keyword-rich structure that is parseable by any ATS system or job portal.",
    bestFor: "High-volume Applications, ATS-heavy",
    tags: ["High-volume", "ATS Systems", "General Jobs"],
    structure: "Name · Summary · Experience · Skills",
    icon: Shield,
    promptModifier: "Use the most ATS-compatible plain layout. No tables, no columns, no special characters. Plain bullet points. Standard section names (Summary, Experience, Skills, Education). Keyword density maximized.",
    accentHex: "#6b7280",
  },
];

const ACCENT_COLORS: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  modern_minimal:   { bg: "rgba(34,197,94,0.08)",  text: "#22c55e", border: "rgba(34,197,94,0.25)",  iconBg: "rgba(34,197,94,0.12)" },
  executive_clean:  { bg: "rgba(29,78,216,0.08)",  text: "#3b82f6", border: "rgba(29,78,216,0.25)",  iconBg: "rgba(29,78,216,0.12)" },
  tech_product:     { bg: "rgba(124,58,237,0.08)", text: "#a78bfa", border: "rgba(124,58,237,0.25)", iconBg: "rgba(124,58,237,0.12)" },
  corporate_classic:{ bg: "rgba(51,65,85,0.12)",   text: "#94a3b8", border: "rgba(100,116,139,0.3)", iconBg: "rgba(51,65,85,0.2)" },
  creative_edge:    { bg: "rgba(245,158,11,0.08)", text: "#fbbf24", border: "rgba(245,158,11,0.25)", iconBg: "rgba(245,158,11,0.12)" },
  student_starter:  { bg: "rgba(14,165,233,0.08)", text: "#38bdf8", border: "rgba(14,165,233,0.25)", iconBg: "rgba(14,165,233,0.12)" },
  sales_resume:     { bg: "rgba(239,68,68,0.08)",  text: "#f87171", border: "rgba(239,68,68,0.25)",  iconBg: "rgba(239,68,68,0.12)" },
  simple_ats:       { bg: "rgba(107,114,128,0.08)",text: "#9ca3af", border: "rgba(107,114,128,0.25)",iconBg: "rgba(107,114,128,0.12)" },
};

interface ResumeTemplateGalleryProps {
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export function ResumeTemplateGallery({ selectedId, onSelect, isLoading }: ResumeTemplateGalleryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card animate-pulse h-44" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {TEMPLATE_CONFIGS.map((tpl) => {
        const isSelected = selectedId === tpl.id;
        const colors = ACCENT_COLORS[tpl.id] ?? ACCENT_COLORS.simple_ats;
        const Icon = tpl.icon;

        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onSelect(tpl.id)}
            data-testid={`button-template-${tpl.id}`}
            className={`group relative text-left rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
              ${isSelected
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-card hover:border-border/80 hover:bg-card/80 hover:shadow-md hover:-translate-y-0.5"
              }`}
          >
            {/* Selected badge */}
            {isSelected && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                <Check className="h-2.5 w-2.5" />
                Selected
              </div>
            )}

            <div className="p-4 flex flex-col gap-3 h-full">
              {/* Icon + ATS badge row */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: colors.iconBg }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color: colors.text, width: 18, height: 18 }} />
                </div>
                <span className="text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-md mt-0.5"
                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                  ATS-friendly
                </span>
              </div>

              {/* Title + description */}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold leading-tight text-foreground">{tpl.name}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{tpl.description}</p>
              </div>

              {/* Structure preview line */}
              <div
                className="text-[9px] font-mono tracking-tight rounded-md px-2 py-1.5 leading-tight"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                {tpl.structure}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {tpl.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{
                      background: isSelected ? "rgba(var(--primary-rgb, 59 130 246) / 0.12)" : "rgba(255,255,255,0.05)",
                      color: isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
