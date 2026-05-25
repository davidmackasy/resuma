import OpenAI from "openai";
import type { Profile } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const MODEL = "gpt-5-mini";

export interface JobExtraction {
  jobCategory: string;
  industry: string;
  seniorityLevel: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  certificationsRequired: string[];
  yearsExperienceRequired: string;
  keywords: string[];
}

export interface FitAnalysis {
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  riskFlags: { type: string; severity: string; message: string }[];
  transferableAngle: { title: string; explanation: string };
  suggestedAdditions: {
    id: string;
    type: string;
    targetRole: string;
    originalBullet: string;
    improvedBullet: string;
    reason: string;
  }[];
}

export interface AnalysisResult {
  jobExtraction: JobExtraction;
  fitAnalysis: FitAnalysis;
  tokensUsed: number;
}

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

export interface CoverLetterJson {
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  date: string;
  opening: string;
  body: string[];
  closing: string;
  senderName: string;
}

export interface EmailJson {
  subject: string;
  greeting: string;
  body: string;
  signoff: string;
  senderName: string;
}

export interface GeneratedDocuments {
  resume: { md: string; json: ResumeJson };
  coverLetter: { md: string; json: CoverLetterJson };
  followupEmail: { md: string; json: EmailJson };
  model: string;
  tokensUsed: number;
}

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

interface AnalysisGenerationInput extends GenerationInput {
  jobExtraction: JobExtraction;
  fitAnalysis: FitAnalysis;
  selectedAdditions: string[];
}

export async function analyzeJob(profile: Profile, jobDescription: string): Promise<AnalysisResult> {
  let totalTokens = 0;

  const extractionResponse = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are an ATS job analyzer. Extract structured job requirements from the provided job description. Return strict JSON only.`,
      },
      {
        role: "user",
        content: `Extract the key requirements from this job description:\n\n${jobDescription.substring(0, 6000)}\n\nReturn JSON with these exact keys:\n{\n  "jobCategory": "",\n  "industry": "",\n  "seniorityLevel": "",\n  "requiredSkills": [],\n  "preferredSkills": [],\n  "responsibilities": [],\n  "certificationsRequired": [],\n  "yearsExperienceRequired": "",\n  "keywords": []\n}`,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2000,
  });

  totalTokens += extractionResponse.usage?.total_tokens || 0;
  let jobExtraction: JobExtraction;
  try {
    jobExtraction = JSON.parse(extractionResponse.choices[0]?.message?.content || "{}") as JobExtraction;
  } catch {
    jobExtraction = {
      jobCategory: "", industry: "", seniorityLevel: "",
      requiredSkills: [], preferredSkills: [], responsibilities: [],
      certificationsRequired: [], yearsExperienceRequired: "", keywords: [],
    };
  }

  const profileSummary = buildProfileSummary(profile);

  const fitResponse = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are a career strategist and ATS evaluator. Compare the structured job requirements with the candidate profile. Do not invent experience. Only use provided profile data. Return strict JSON.`,
      },
      {
        role: "user",
        content: `JOB REQUIREMENTS:\n${JSON.stringify(jobExtraction, null, 2)}\n\nCANDIDATE PROFILE:\n${profileSummary}\n\nAnalyze the fit between this candidate and the job. Return JSON with these exact keys:\n{\n  "fitScore": 0-100,\n  "matchedSkills": ["skill1", "skill2"],\n  "missingSkills": ["skill1", "skill2"],\n  "riskFlags": [{"type": "experience_gap|skill_gap|overqualified|location|certification", "severity": "high|medium|low", "message": "explanation"}],\n  "transferableAngle": {"title": "angle title", "explanation": "how to position transferable skills"},\n  "suggestedAdditions": [{"id": "unique_id", "type": "bullet_upgrade", "targetRole": "role name from profile", "originalBullet": "current bullet text", "improvedBullet": "rewritten bullet aligned with job", "reason": "why this improves fit"}]\n}\n\nRules:\n- fitScore: 0-100 based on overall match\n- Only suggest improvements based on EXISTING profile data, never fabricate\n- Suggest bullet rewrites that better highlight relevant aspects of actual experience\n- Each suggestedAddition must have a unique "id" (use format "sa_1", "sa_2", etc.)\n- Limit to 3-6 best suggested improvements\n- Be honest about gaps; don't inflate the score`,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 3000,
  });

  totalTokens += fitResponse.usage?.total_tokens || 0;
  let fitAnalysis: FitAnalysis;
  try {
    const parsed = JSON.parse(fitResponse.choices[0]?.message?.content || "{}");
    fitAnalysis = {
      fitScore: parsed.fitScore || 0,
      matchedSkills: parsed.matchedSkills || [],
      missingSkills: parsed.missingSkills || [],
      riskFlags: parsed.riskFlags || [],
      transferableAngle: parsed.transferableAngle || { title: "", explanation: "" },
      suggestedAdditions: (parsed.suggestedAdditions || []).map((sa: any, i: number) => ({
        id: sa.id || `sa_${i + 1}`,
        type: sa.type || "bullet_upgrade",
        targetRole: sa.targetRole || "",
        originalBullet: sa.originalBullet || "",
        improvedBullet: sa.improvedBullet || "",
        reason: sa.reason || "",
      })),
    };
  } catch {
    fitAnalysis = {
      fitScore: 0,
      matchedSkills: [],
      missingSkills: [],
      riskFlags: [],
      transferableAngle: { title: "", explanation: "" },
      suggestedAdditions: [],
    };
  }

  return { jobExtraction, fitAnalysis, tokensUsed: totalTokens };
}

export async function generateFromAnalysis(input: AnalysisGenerationInput): Promise<GeneratedDocuments> {
  const profileSummary = buildProfileSummary(input.profile);

  const selectedImprovements = input.fitAnalysis.suggestedAdditions
    .filter(sa => input.selectedAdditions.includes(sa.id));

  const improvementsText = selectedImprovements.length > 0
    ? `\n\nSELECTED BULLET IMPROVEMENTS (apply these rewrites in the resume):\n${selectedImprovements.map(sa => `- Role "${sa.targetRole}": Replace "${sa.originalBullet}" with "${sa.improvedBullet}"`).join("\n")}`
    : "";

  const systemPrompt = `You are a professional resume writer and career coach. Generate a tailored resume, cover letter, and follow-up email using the candidate profile, job analysis, and selected improvements. Do not fabricate experience. Exclude irrelevant roles. Return structured JSON.

CRITICAL RULES:
- NEVER fabricate companies, dates, degrees, awards, or metrics not present in the profile
- Use ONLY facts from the provided profile data
- If information is missing, omit it gracefully - do not invent
- Keep resume to 1 page content (max 2 for senior roles)
- Use active verbs and measurable outcomes ONLY if present in source
- Remove filler phrases like "results-driven", "dynamic", "passionate"
- NEVER modify the candidate's master profile - all tailoring applies to output only

RESUME TITLE RULES (HIGHEST PRIORITY):
- The resume title (header.title) MUST reflect the TARGET JOB, NOT the candidate's previous job title
- Ask yourself: "What role is this resume targeting?" and use that as the title
- If the candidate has direct experience matching the job → use the exact or very close job title
- If the candidate has transferable experience → create a bridge title combining the target role with their background (e.g. "Window & Door Installation Assistant", "Construction & Site Support Worker")
- NEVER use a previous job title that does not match or relate to the target role
- The title MUST include at least one major keyword from the job title or job description
- Wrong: "Customer Service Representative" for a window installer job
- Right: "Window & Door Installation Assistant" or "Construction & Installation Support Worker"

RESUME SUMMARY RULES (HIGHEST PRIORITY):
- Sentence 1: Name the target role/job type and lead with the most relevant skills from the JOB DESCRIPTION
- Sentence 2: Connect matching or transferable skills from the candidate's actual experience to the job requirements
- Sentence 3: Mention reliability, safety, teamwork, or quality — whatever the job description emphasizes
- Sentence 4 (optional): End with seeking to contribute to [company] in [target role area]
- Do NOT open the summary with the candidate's old job title (e.g. do not start "Customer service professional..." for a construction job)
- Use careful bridging language if experience is transferable but not direct (e.g. "installation-focused candidate", "construction-adjacent experience")
- The summary MUST mention at least 2-4 specific skills or responsibilities from the job description

INTELLIGENT RELEVANCE FILTERING:
- Include ONLY the top 2-4 most relevant roles in the resume
- For each included role, select only the 3-5 most relevant bullets
- Apply selected bullet upgrades where specified
- Exclude completely irrelevant roles
- If no roles are highly relevant, include most recent roles and emphasize transferable skills
- Always include at least 1 role minimum
- Reorder skills to prioritize those mentioned in the job description

TONE: ${input.tone}
${input.templateId ? `RESUME TEMPLATE STYLE: ${input.templateId.replace(/_/g, " ")}. Tailor the resume content structure and section ordering to match this template style while keeping it ATS-friendly.` : ""}
${input.companyName ? `COMPANY: ${input.companyName}` : ""}
${input.roleTitle ? `TARGET ROLE: ${input.roleTitle} — the resume title and summary MUST be aligned to this role` : ""}
${input.hiringManager ? `HIRING MANAGER: ${input.hiringManager}` : ""}`;

  const userPrompt = `CANDIDATE PROFILE:
${profileSummary}

JOB EXTRACTION:
${JSON.stringify(input.jobExtraction, null, 2)}

TRANSFERABLE ANGLE:
${input.fitAnalysis.transferableAngle.title}: ${input.fitAnalysis.transferableAngle.explanation}
${improvementsText}

Generate THREE documents as a JSON object with these exact keys:

1. "resume" - Object with:
   - "md": Full tailored resume in markdown
   - "json": { "header": { name, title, email, phone, location, linkedin?, portfolio?, github? }, "summary": string, "experience": [{ title, company, location, startDate, endDate, bullets: string[], relevanceScore: number 0-100 }], "skills": [{ name, items: string[] }], "education": [{ school, degree, field, year }], "certifications": [{ name, issuer, year }] }

2. "coverLetter" - Object with:
   - "md": Full cover letter in markdown (250-350 words)
   - "json": { recipientName, recipientTitle, companyName, date, opening, body: string[], closing, senderName }

3. "followupEmail" - Object with:
   - "md": Follow-up email in markdown (60-120 words) with subject line
   - "json": { subject, greeting, body, signoff, senderName }

COVER LETTER RULES:
- Reference company and role specifically
- Align with the transferable angle
- Use selected improvements naturally
- Professional ${input.tone} tone

Return ONLY valid JSON with keys: resume, coverLetter, followupEmail.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 6000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const tokensUsed = response.usage?.total_tokens || 0;

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response");
  }

  const resumeData = parsed.resume || {};
  const coverLetterData = parsed.coverLetter || {};
  const emailData = parsed.followupEmail || {};

  return {
    resume: {
      md: resumeData.md || "Generation failed - no resume content",
      json: resumeData.json || buildFallbackResumeJson(input.profile),
    },
    coverLetter: {
      md: coverLetterData.md || "Generation failed - no cover letter content",
      json: coverLetterData.json || { recipientName: "", recipientTitle: "", companyName: input.companyName || "", date: new Date().toLocaleDateString(), opening: "", body: [], closing: "", senderName: input.profile.fullName },
    },
    followupEmail: {
      md: emailData.md || "Generation failed - no email content",
      json: emailData.json || { subject: "", greeting: "", body: "", signoff: "", senderName: input.profile.fullName },
    },
    model: MODEL,
    tokensUsed,
  };
}

export async function generateDocuments(input: GenerationInput): Promise<GeneratedDocuments> {
  const profileSummary = buildProfileSummary(input.profile);

  const systemPrompt = `You are an expert career consultant and resume writer. You produce ATS-safe, premium-quality documents.

CRITICAL RULES:
- NEVER fabricate companies, dates, degrees, awards, or metrics not present in the profile
- Use ONLY facts from the provided profile data
- If information is missing, omit it gracefully - do not invent
- Keep resume to 1 page content (max 2 for senior roles)
- Use active verbs and measurable outcomes ONLY if present in source
- Remove filler phrases like "results-driven", "dynamic", "passionate"
- Keep tense consistent (past for previous roles, present for current)
- NEVER modify the candidate's master profile - all tailoring applies to output only

RESUME TITLE RULES (HIGHEST PRIORITY):
- The resume title (header.title) MUST reflect the TARGET JOB, NOT the candidate's previous job title
- Ask yourself: "What role is this resume targeting?" and use that as the title
- If the candidate has direct experience matching the job → use the exact or very close job title
- If the candidate has transferable experience → create a bridge title combining the target role with their background
- NEVER use a previous job title that does not match or relate to the target role
- The title MUST include at least one major keyword from the job title or job description
- Example wrong: "Customer Service Representative" for a window installer job
- Example right: "Window & Door Installation Assistant" or "Construction & Site Support Worker"

RESUME SUMMARY RULES (HIGHEST PRIORITY):
- Sentence 1: Name the target role/job type and lead with the most relevant skills from the JOB DESCRIPTION
- Sentence 2: Connect matching or transferable skills from the candidate's actual experience to the job requirements
- Sentence 3: Mention reliability, safety, teamwork, or quality — whatever the job description emphasizes
- Do NOT open the summary with the candidate's old job title if it doesn't match the target role
- Use careful bridging language if experience is transferable but not direct
- The summary MUST mention at least 2-4 specific skills or responsibilities from the job description

INTELLIGENT RELEVANCE FILTERING:
- Analyze the job description to identify: required skills, industry, responsibilities, keywords, seniority level
- Score each experience role for relevance to this specific job
- Include ONLY the top 2-4 most relevant roles in the resume
- For each included role, select only the 3-5 most relevant bullets
- Rewrite bullets for clarity and alignment with the job, but NEVER fabricate achievements
- Exclude completely irrelevant roles
- If no roles are highly relevant, include the most recent roles and rewrite the summary to emphasize transferable skills
- Always include at least 1 role minimum
- Reorder skills to prioritize those mentioned in the job description

TONE: ${input.tone}
${input.companyName ? `COMPANY: ${input.companyName}` : ""}
${input.roleTitle ? `TARGET ROLE: ${input.roleTitle} — the resume title and summary MUST be aligned to this role` : ""}
${input.hiringManager ? `HIRING MANAGER: ${input.hiringManager}` : ""}`;

  const userPrompt = `CANDIDATE PROFILE:
${profileSummary}

JOB DESCRIPTION:
${input.jobDescription.substring(0, 6000)}

Generate THREE documents as a JSON object with these exact keys:

1. "resume" - Object with:
   - "md": Full tailored resume in markdown (name/contact header, summary, filtered experience with tailored bullets, skills, education)
   - "json": Structured resume object with keys:
     - "header": { name, title, email, phone, location, linkedin?, portfolio?, github? }
     - "summary": string (2-3 line professional summary tailored to job)
     - "experience": array of { title, company, location, startDate, endDate, bullets: string[], relevanceScore: number 0-100 }
     - "skills": array of { name, items: string[] } (reordered by relevance)
     - "education": array of { school, degree, field, year }
     - "certifications": array of { name, issuer, year } (if any)

2. "coverLetter" - Object with:
   - "md": Full cover letter in markdown (250-350 words)
   - "json": { recipientName, recipientTitle, companyName, date, opening, body: string[], closing, senderName }

3. "followupEmail" - Object with:
   - "md": Follow-up email in markdown (60-120 words) with subject line
   - "json": { subject, greeting, body, signoff, senderName }

Return ONLY valid JSON with keys: resume, coverLetter, followupEmail.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 6000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const tokensUsed = response.usage?.total_tokens || 0;

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response");
  }

  const resumeData = parsed.resume || {};
  const coverLetterData = parsed.coverLetter || {};
  const emailData = parsed.followupEmail || {};

  return {
    resume: {
      md: resumeData.md || "Generation failed - no resume content",
      json: resumeData.json || buildFallbackResumeJson(input.profile),
    },
    coverLetter: {
      md: coverLetterData.md || "Generation failed - no cover letter content",
      json: coverLetterData.json || { recipientName: "", recipientTitle: "", companyName: input.companyName || "", date: new Date().toLocaleDateString(), opening: "", body: [], closing: "", senderName: input.profile.fullName },
    },
    followupEmail: {
      md: emailData.md || "Generation failed - no email content",
      json: emailData.json || { subject: "", greeting: "", body: "", signoff: "", senderName: input.profile.fullName },
    },
    model: MODEL,
    tokensUsed,
  };
}

export async function generateSingleDocument(
  input: GenerationInput,
  docType: "resume" | "cover_letter" | "followup_email"
): Promise<{ md: string; json: any; model: string; tokensUsed: number }> {
  const profileSummary = buildProfileSummary(input.profile);

  const docPrompts: Record<string, string> = {
    resume: `Generate a tailored resume as JSON with keys:
- "md": Full resume in markdown format
- "json": Structured resume with { header: { name, title, email, phone, location, linkedin?, portfolio?, github? }, summary: string, experience: [{ title, company, location, startDate, endDate, bullets: string[], relevanceScore: number }], skills: [{ name, items: string[] }], education: [{ school, degree, field, year }], certifications: [{ name, issuer, year }] }

RESUME TITLE: The header.title MUST match the target job, not the candidate's previous title. If experience is transferable, create a bridge title using keywords from the job description.
RESUME SUMMARY: Must open by naming the target role type, then connect transferable skills to the job's requirements. Do NOT reuse the candidate's old job title in the summary opening.
RELEVANCE FILTERING: Analyze job description, include only top 2-4 most relevant roles with 3-5 best bullets each. Exclude irrelevant experience. Reorder skills by relevance.`,
    cover_letter: `Generate a cover letter (250-350 words) as JSON with keys:
- "md": Full cover letter in markdown
- "json": { recipientName, recipientTitle, companyName, date, opening, body: string[], closing, senderName }`,
    followup_email: `Generate a follow-up email (60-120 words) as JSON with keys:
- "md": Email with subject line in markdown
- "json": { subject, greeting, body, signoff, senderName }`,
  };

  const systemPrompt = `You are an expert career consultant. Produce ATS-safe, premium-quality documents.
CRITICAL: NEVER fabricate facts. Use ONLY data from the profile. NEVER modify the master profile.
TONE: ${input.tone}
${input.companyName ? `COMPANY: ${input.companyName}` : ""}
${input.roleTitle ? `TARGET ROLE: ${input.roleTitle}` : ""}
${input.hiringManager ? `HIRING MANAGER: ${input.hiringManager}` : ""}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `CANDIDATE PROFILE:\n${profileSummary}\n\nJOB DESCRIPTION:\n${input.jobDescription.substring(0, 6000)}\n\n${docPrompts[docType]}\n\nReturn ONLY valid JSON.` },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4000,
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
    md: parsed.md || "",
    json: parsed.json || parsed,
    model: MODEL,
    tokensUsed,
  };
}

export interface PracticeContent {
  questions: { question: string; bestAnswer: string }[];
}

export async function generatePracticeQuestions(
  resumeContent: string,
  jobDescription: string,
  roleTitle?: string,
  companyName?: string,
): Promise<PracticeContent> {
  const systemPrompt = `You are the hiring manager for this specific role.

Based on the job description and the candidate's updated resume:

Ask the 7 hardest interview questions relevant to this role.

For each question, write the best possible answer the candidate should give based strictly on their resume.

Make answers realistic, confident, and specific to their background.

Do not invent experience not present in the resume.

Keep answers structured and professional.

Return JSON format:

{
  "questions": [
    {
      "question": "",
      "bestAnswer": ""
    }
  ]
}`;

  const userPrompt = `CANDIDATE'S UPDATED RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription.substring(0, 6000)}
${roleTitle ? `\nJOB TITLE: ${roleTitle}` : ""}
${companyName ? `\nCOMPANY: ${companyName}` : ""}

Generate the 7 hardest interview questions and best answers.`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);

  return {
    questions: (parsed.questions || []).map((q: any) => ({
      question: q.question || "",
      bestAnswer: q.bestAnswer || "",
    })),
  };
}

function buildFallbackResumeJson(profile: Profile): ResumeJson {
  const links = profile.links as any || {};
  const exp = profile.experience as any || { roles: [] };
  const skills = profile.skills as any || { groups: [] };
  const edu = profile.education as any || { items: [] };
  const certs = profile.certifications as any || { items: [] };

  return {
    header: {
      name: profile.fullName,
      title: profile.title || "",
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      linkedin: links.linkedin,
      portfolio: links.portfolio,
      github: links.github,
    },
    summary: profile.summaryBase || "",
    experience: (exp.roles || []).map((r: any) => ({
      title: r.title,
      company: r.company,
      location: r.location,
      startDate: r.startDate,
      endDate: r.endDate,
      bullets: r.bullets || [],
    })),
    skills: (skills.groups || []).map((g: any) => ({ name: g.name, items: g.items || [] })),
    education: edu.items || [],
    certifications: certs.items?.length ? certs.items : undefined,
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
