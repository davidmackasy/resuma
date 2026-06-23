import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { getEffectiveDefaultModel } from "@shared/ai-config";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface ParsedProfile {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  links: { linkedin?: string; portfolio?: string; github?: string };
  summaryBase: string;
  experience: {
    roles: {
      company: string;
      title: string;
      location: string;
      startDate: string;
      endDate: string;
      bullets: string[];
    }[];
  };
  education: {
    items: {
      school: string;
      degree: string;
      field: string;
      year: string;
    }[];
  };
  skills: {
    groups: {
      name: string;
      items: string[];
    }[];
  };
  certifications: {
    items: {
      name: string;
      issuer: string;
      year: string;
    }[];
  };
  warnings: string[];
}

export async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);

  if (fileType === "application/pdf" || filePath.endsWith(".pdf")) {
    const { PDFParse, VerbosityLevel } = await import("pdf-parse");
    const parser = new PDFParse({ verbosity: VerbosityLevel.ERRORS });
    await parser.load(buffer);
    const text = parser.getText();
    return text;
  }

  if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}

export async function parseResumeText(rawText: string): Promise<ParsedProfile> {
  const truncatedText = rawText.substring(0, 8000);

  const systemPrompt = `You are a resume parsing expert. Extract structured data from resume text.

RULES:
- Extract ONLY information explicitly present in the text
- NEVER fabricate or invent any data
- If a field is not found, use empty string "" or empty array []
- For dates, use the format found in the text (e.g., "Jan 2020", "2020", "Present")
- Group skills logically (e.g., "Programming Languages", "Frameworks", "Tools")
- Extract bullet points as-is from the resume, preserving the original wording`;

  const userPrompt = `Parse this resume text into structured JSON:

${truncatedText}

Return a JSON object with these exact keys:
{
  "fullName": "string",
  "title": "string - professional title/headline",
  "location": "string",
  "email": "string",
  "phone": "string",
  "links": {
    "linkedin": "string or empty",
    "portfolio": "string or empty",
    "github": "string or empty"
  },
  "summaryBase": "string - professional summary if present",
  "experience": {
    "roles": [
      {
        "company": "string",
        "title": "string",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "bullets": ["string array of achievements/responsibilities"]
      }
    ]
  },
  "education": {
    "items": [
      {
        "school": "string",
        "degree": "string",
        "field": "string",
        "year": "string"
      }
    ]
  },
  "skills": {
    "groups": [
      {
        "name": "string - group name",
        "items": ["string array of skills"]
      }
    ]
  },
  "certifications": {
    "items": [
      {
        "name": "string",
        "issuer": "string",
        "year": "string"
      }
    ]
  },
  "warnings": ["string array of issues found, e.g. 'Email not found', 'Phone number not detected'"]
}`;

  const response = await openai.chat.completions.create({
    model: getEffectiveDefaultModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "{}";

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse resume. Please try again or create your profile manually.");
  }

  const warnings: string[] = parsed.warnings || [];
  if (!parsed.email) warnings.push("Email address could not be extracted");
  if (!parsed.phone) warnings.push("Phone number could not be extracted");
  if (!parsed.fullName) warnings.push("Full name could not be determined");

  return {
    fullName: parsed.fullName || "",
    title: parsed.title || "",
    location: parsed.location || "",
    email: parsed.email || "",
    phone: parsed.phone || "",
    links: {
      linkedin: parsed.links?.linkedin || "",
      portfolio: parsed.links?.portfolio || "",
      github: parsed.links?.github || "",
    },
    summaryBase: parsed.summaryBase || "",
    experience: {
      roles: (parsed.experience?.roles || []).map((r: any) => ({
        company: r.company || "",
        title: r.title || "",
        location: r.location || "",
        startDate: r.startDate || "",
        endDate: r.endDate || "",
        bullets: Array.isArray(r.bullets) ? r.bullets.filter((b: string) => b.trim()) : [],
      })),
    },
    education: {
      items: (parsed.education?.items || []).map((e: any) => ({
        school: e.school || "",
        degree: e.degree || "",
        field: e.field || "",
        year: e.year || "",
      })),
    },
    skills: {
      groups: (parsed.skills?.groups || []).map((g: any) => ({
        name: g.name || "",
        items: Array.isArray(g.items) ? g.items : [],
      })),
    },
    certifications: {
      items: (parsed.certifications?.items || []).map((c: any) => ({
        name: c.name || "",
        issuer: c.issuer || "",
        year: c.year || "",
      })),
    },
    warnings,
  };
}
