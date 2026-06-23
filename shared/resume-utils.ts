export interface ResumeJson {
  header: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
    github?: string;
  };
  summary: string;
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
    relevanceScore?: number;
  }[];
  skills: { name: string; items: string[] }[];
  education: { school: string; degree: string; field: string; year: string }[];
  certifications?: { name: string; issuer: string; year: string }[];
}

/** Parse paths like summary, header.title, experience[0].bullets[1] */
export function parseSectionPath(path: string): (string | number)[] {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .map((seg) => (/^\d+$/.test(seg) ? parseInt(seg, 10) : seg));
}

export function getByPath(obj: unknown, path: string): unknown {
  const keys = parseSectionPath(path);
  let cur: unknown = obj;
  for (const key of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string | number, unknown>)[key];
  }
  return cur;
}

export function setByPath<T>(obj: T, path: string, value: unknown): T {
  const keys = parseSectionPath(path);
  const clone = structuredClone(obj) as Record<string, unknown>;
  let cur: Record<string, unknown> = clone;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    if (cur[key as string] === undefined || cur[key as string] === null) {
      cur[key as string] = typeof nextKey === "number" ? [] : {};
    }
    cur = cur[key as string] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  cur[lastKey as string] = value;
  return clone as T;
}

export function resumeJsonToMarkdown(data: ResumeJson): string {
  const lines: string[] = [];
  const h = data.header;
  if (h?.name) {
    lines.push(`# ${h.name}`);
    if (h.title) lines.push(`**${h.title}**`);
    const contact = [h.email, h.phone, h.location].filter(Boolean).join(" | ");
    if (contact) lines.push(contact);
    const links = [h.linkedin, h.portfolio, h.github].filter(Boolean).join(" | ");
    if (links) lines.push(links);
    lines.push("");
  }

  if (data.summary) {
    lines.push("## Professional Summary");
    lines.push(data.summary);
    lines.push("");
  }

  if (data.experience?.length) {
    lines.push("## Experience");
    for (const role of data.experience) {
      lines.push(`### ${role.title}${role.company ? ` — ${role.company}` : ""}`);
      if (role.location || role.startDate) {
        lines.push(`${[role.location, `${role.startDate} - ${role.endDate}`].filter(Boolean).join(" · ")}`);
      }
      for (const bullet of role.bullets || []) {
        if (bullet.trim()) lines.push(`- ${bullet}`);
      }
      lines.push("");
    }
  }

  if (data.skills?.length) {
    lines.push("## Skills");
    for (const group of data.skills) {
      lines.push(`**${group.name}:** ${(group.items || []).join(", ")}`);
    }
    lines.push("");
  }

  if (data.education?.length) {
    lines.push("## Education");
    for (const edu of data.education) {
      lines.push(
        `- ${[edu.degree, edu.field].filter(Boolean).join(" in ") || edu.school}${edu.year ? ` (${edu.year})` : ""}${edu.degree ? ` — ${edu.school}` : ""}`
      );
    }
    lines.push("");
  }

  if (data.certifications?.length) {
    lines.push("## Certifications");
    for (const cert of data.certifications) {
      lines.push(`- ${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ""}${cert.year ? ` (${cert.year})` : ""}`);
    }
  }

  return lines.join("\n").trim();
}

/** Map a section path to a top-level preview section id for animations */
export function sectionPathToPreviewId(path: string): string {
  if (path === "summary" || path.startsWith("summary.")) return "summary";
  if (path.startsWith("header")) return "header";
  if (path.startsWith("experience")) return "experience";
  if (path.startsWith("skills")) return "skills";
  if (path.startsWith("education")) return "education";
  if (path.startsWith("certifications")) return "certifications";
  return path.split(/[.[]/)[0] || path;
}

export type ResumeChatEvent =
  | { type: "chat_delta"; content: string }
  | { type: "section_editing"; section: string }
  | { type: "section_edit"; section: string; value: string; partial?: boolean }
  | { type: "done"; assistantMessage: string; tokensUsed?: number }
  | { type: "error"; message: string };
