import OpenAI from "openai";
import type { Profile } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface GenerationInput {
  profile: Profile;
  jobDescription: string;
  companyName?: string;
  roleTitle?: string;
  jobLocation?: string;
  hiringManager?: string;
  tone: string;
  templateId: string;
}

interface GeneratedDocuments {
  resume: string;
  coverLetter: string;
  followupEmail: string;
  model: string;
  tokensUsed: number;
}

export async function generateDocuments(input: GenerationInput): Promise<GeneratedDocuments> {
  const profileSummary = buildProfileSummary(input.profile);
  const model = "gpt-5-mini";

  const systemPrompt = `You are an expert career consultant and resume writer. You produce ATS-safe, premium-quality documents.

CRITICAL RULES:
- NEVER fabricate companies, dates, degrees, awards, or metrics not present in the profile
- Use ONLY facts from the provided profile data
- If information is missing, omit it gracefully - do not invent
- Keep resume to 1 page content (max 2 for senior roles)
- Use 3-5 bullets per role max
- Use active verbs and measurable outcomes ONLY if present in source
- Remove filler phrases like "results-driven", "dynamic", "passionate"
- Keep tense consistent (past for previous roles, present for current)

TONE: ${input.tone}
${input.companyName ? `COMPANY: ${input.companyName}` : ""}
${input.roleTitle ? `TARGET ROLE: ${input.roleTitle}` : ""}
${input.hiringManager ? `HIRING MANAGER: ${input.hiringManager}` : ""}`;

  const userPrompt = `CANDIDATE PROFILE:
${profileSummary}

JOB DESCRIPTION:
${input.jobDescription.substring(0, 6000)}

Generate THREE documents as a JSON object with these keys:
1. "resume" - A tailored resume in markdown format. Include: name/contact header, professional summary (2-3 lines), relevant experience with tailored bullets, skills section, education. Match keywords from the job description where truthful.
2. "coverLetter" - A cover letter (250-350 words) with: tailored opening referencing company/role, 1-2 proof points aligned to responsibilities, clear closing with call to action.
3. "followupEmail" - A follow-up email (60-120 words) with subject line, professional greeting, brief reminder of application, and professional sign-off.

Return ONLY valid JSON with keys: resume, coverLetter, followupEmail. Each value is a string.`;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const tokensUsed = response.usage?.total_tokens || 0;

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response");
  }

  return {
    resume: parsed.resume || "Generation failed - no resume content",
    coverLetter: parsed.coverLetter || "Generation failed - no cover letter content",
    followupEmail: parsed.followupEmail || "Generation failed - no email content",
    model,
    tokensUsed,
  };
}

function buildProfileSummary(profile: Profile): string {
  const parts: string[] = [];

  parts.push(`Name: ${profile.fullName}`);
  if (profile.title) parts.push(`Title: ${profile.title}`);
  if (profile.email) parts.push(`Email: ${profile.email}`);
  if (profile.phone) parts.push(`Phone: ${profile.phone}`);
  if (profile.location) parts.push(`Location: ${profile.location}`);

  const links = profile.links as any;
  if (links?.linkedin) parts.push(`LinkedIn: ${links.linkedin}`);
  if (links?.portfolio) parts.push(`Portfolio: ${links.portfolio}`);
  if (links?.github) parts.push(`GitHub: ${links.github}`);

  if (profile.summaryBase) parts.push(`\nSummary: ${profile.summaryBase}`);

  const exp = profile.experience as any;
  if (exp?.roles?.length) {
    parts.push("\nExperience:");
    for (const role of exp.roles) {
      parts.push(`  ${role.title} at ${role.company} (${role.startDate} - ${role.endDate}), ${role.location}`);
      for (const bullet of role.bullets || []) {
        if (bullet.trim()) parts.push(`    - ${bullet}`);
      }
    }
  }

  const skills = profile.skills as any;
  if (skills?.groups?.length) {
    parts.push("\nSkills:");
    for (const group of skills.groups) {
      parts.push(`  ${group.name}: ${(group.items || []).join(", ")}`);
    }
  }

  const edu = profile.education as any;
  if (edu?.items?.length) {
    parts.push("\nEducation:");
    for (const item of edu.items) {
      parts.push(`  ${item.degree} in ${item.field}, ${item.school} (${item.year})`);
    }
  }

  const certs = profile.certifications as any;
  if (certs?.items?.length) {
    parts.push("\nCertifications:");
    for (const item of certs.items) {
      parts.push(`  ${item.name} - ${item.issuer} (${item.year})`);
    }
  }

  return parts.join("\n");
}
