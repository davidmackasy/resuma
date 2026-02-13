import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { analyzeJob, generateFromAnalysis, generateDocuments, generateSingleDocument } from "./generation";
import { generateResumePdf, generateCoverLetterPdf } from "./export-pdf";
import { generateResumeDocx, generateCoverLetterDocx } from "./export-docx";
import { extractTextFromFile, parseResumeText } from "./resume-parser";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads", "resumes");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are supported"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/applykit/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.json({
          userId,
          fullName: "",
          title: "",
          location: "",
          email: "",
          phone: "",
          links: {},
          summaryBase: "",
          skills: { groups: [] },
          experience: { roles: [] },
          education: { items: [] },
          certifications: { items: [] },
          resumeInputMethod: null,
          resumeFileUrl: null,
          resumeFileType: null,
          resumeVersion: 0,
          structuredComplete: false,
        });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/applykit/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = req.body;
      const profile = await storage.upsertProfile(userId, data);
      res.json(profile);
    } catch (error) {
      console.error("Error saving profile:", error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  app.post("/api/applykit/profile/upload", isAuthenticated, upload.single("resume"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const rawText = await extractTextFromFile(file.path, file.mimetype);

      if (!rawText || rawText.trim().length < 50) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          message: "Could not extract enough text from this file. Please try a different file or create your profile manually.",
        });
      }

      const parsed = await parseResumeText(rawText);

      const existing = await storage.getProfile(userId);
      const nextVersion = existing ? (existing.resumeVersion || 0) + 1 : 1;

      const profile = await storage.upsertProfile(userId, {
        fullName: parsed.fullName,
        title: parsed.title,
        location: parsed.location,
        email: parsed.email,
        phone: parsed.phone,
        links: parsed.links,
        summaryBase: parsed.summaryBase,
        skills: parsed.skills,
        experience: parsed.experience,
        education: parsed.education,
        certifications: parsed.certifications,
        resumeInputMethod: "upload",
        resumeFileUrl: file.path,
        resumeFileType: file.mimetype,
        resumeVersion: nextVersion,
        structuredComplete: false,
      });

      res.json({
        profile,
        warnings: parsed.warnings,
        rawTextLength: rawText.length,
      });
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      if (req.file?.path) {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
      res.status(500).json({ message: error.message || "Failed to process resume" });
    }
  });

  app.get("/api/applykit/templates", async (_req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/applykit/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/applykit/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const application = await storage.getApplication(id, userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.get("/api/applykit/applications/:id/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const application = await storage.getApplication(id, userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      const documents = await storage.getDocuments(id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/applykit/applications/:id/analysis", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const application = await storage.getApplication(id, userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      const analysis = await storage.getJobAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "No analysis found for this application" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });

  app.post("/api/applykit/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { jobDescription, companyName, roleTitle, jobLocation, jobUrl, hiringManager, tone, templateId } = req.body;

      if (!jobDescription?.trim()) {
        return res.status(400).json({ message: "Job description is required" });
      }

      const profile = await storage.getProfile(userId);
      if (!profile || !profile.fullName || !profile.structuredComplete) {
        return res.status(400).json({ message: "Please complete your career profile setup first" });
      }

      const usage = await storage.getUsage(userId);
      if (usage && usage.applicationsGenerated >= 15) {
        return res.status(403).json({ message: "Monthly application limit reached (15/15)" });
      }

      const application = await storage.createApplication({
        userId,
        jobDescription,
        companyName: companyName || "",
        roleTitle: roleTitle || "",
        jobLocation: jobLocation || "",
        jobUrl: jobUrl || "",
        hiringManager: hiringManager || "",
        tone: tone || "professional",
        templateId: templateId || "modern_minimal",
        status: "draft",
      });

      try {
        const analysisResult = await analyzeJob(profile, jobDescription);

        await storage.createJobAnalysis({
          applicationId: application.id,
          userId,
          jobDescription,
          fitScore: analysisResult.fitAnalysis.fitScore,
          matchedSkills: analysisResult.fitAnalysis.matchedSkills,
          missingSkills: analysisResult.fitAnalysis.missingSkills,
          riskFlags: analysisResult.fitAnalysis.riskFlags,
          transferableAngle: analysisResult.fitAnalysis.transferableAngle,
          suggestedAdditions: analysisResult.fitAnalysis.suggestedAdditions,
          jobExtraction: analysisResult.jobExtraction,
        });

        await storage.updateApplicationStatus(application.id, "analyzed");

        res.json({ id: application.id, status: "analyzed" });
      } catch (analysisError) {
        console.error("Analysis error:", analysisError);
        await storage.updateApplicationStatus(application.id, "failed");
        res.status(500).json({ message: "Job analysis failed. Please try again." });
      }
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.post("/api/applykit/applications/:id/generate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);

      const application = await storage.getApplication(id, userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(400).json({ message: "Profile not found" });
      }

      const analysis = await storage.getJobAnalysis(id);
      if (!analysis) {
        return res.status(400).json({ message: "No job analysis found. Please analyze the job first." });
      }

      const { selectedAdditions } = req.body;

      try {
        const generated = await generateFromAnalysis({
          profile,
          jobDescription: application.jobDescription,
          companyName: application.companyName || undefined,
          roleTitle: application.roleTitle || undefined,
          jobLocation: application.jobLocation || undefined,
          hiringManager: application.hiringManager || undefined,
          tone: application.tone,
          templateId: application.templateId,
          jobExtraction: analysis.jobExtraction as any,
          fitAnalysis: {
            fitScore: analysis.fitScore,
            matchedSkills: analysis.matchedSkills as string[],
            missingSkills: analysis.missingSkills as string[],
            riskFlags: analysis.riskFlags as any[],
            transferableAngle: analysis.transferableAngle as any,
            suggestedAdditions: analysis.suggestedAdditions as any[],
          },
          selectedAdditions: selectedAdditions || [],
        });

        await storage.deleteDocumentsByApplication(id);

        await Promise.all([
          storage.createDocument({
            applicationId: id,
            userId,
            docType: "resume",
            contentMd: generated.resume.md,
            contentJson: generated.resume.json,
            tokensUsed: Math.floor(generated.tokensUsed / 3),
            model: generated.model,
          }),
          storage.createDocument({
            applicationId: id,
            userId,
            docType: "cover_letter",
            contentMd: generated.coverLetter.md,
            contentJson: generated.coverLetter.json,
            tokensUsed: Math.floor(generated.tokensUsed / 3),
            model: generated.model,
          }),
          storage.createDocument({
            applicationId: id,
            userId,
            docType: "followup_email",
            contentMd: generated.followupEmail.md,
            contentJson: generated.followupEmail.json,
            tokensUsed: Math.floor(generated.tokensUsed / 3),
            model: generated.model,
          }),
        ]);

        await storage.updateApplicationStatus(id, "generated");
        await storage.incrementUsage(userId, "applicationsGenerated");

        res.json({ id, status: "generated" });
      } catch (genError) {
        console.error("Generation error:", genError);
        res.status(500).json({ message: "Document generation failed. Please try again." });
      }
    } catch (error) {
      console.error("Error generating from analysis:", error);
      res.status(500).json({ message: "Failed to generate documents" });
    }
  });

  app.post("/api/applykit/applications/:id/regenerate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);

      const application = await storage.getApplication(id, userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const usage = await storage.getUsage(userId);
      if (usage && usage.regenerations >= 15) {
        return res.status(403).json({ message: "Monthly regeneration limit reached (15/15)" });
      }

      const profile = await storage.getProfile(userId);
      if (!profile) {
        return res.status(400).json({ message: "Profile not found" });
      }

      const docType = req.body?.docType;
      const genInput = {
        profile,
        jobDescription: application.jobDescription,
        companyName: application.companyName || undefined,
        roleTitle: application.roleTitle || undefined,
        jobLocation: application.jobLocation || undefined,
        hiringManager: application.hiringManager || undefined,
        tone: application.tone,
        templateId: application.templateId,
      };

      if (docType && ["resume", "cover_letter", "followup_email"].includes(docType)) {
        await storage.deleteDocumentByType(id, docType);
        const result = await generateSingleDocument(genInput, docType as any);
        await storage.createDocument({
          applicationId: id,
          userId,
          docType,
          contentMd: result.md,
          contentJson: result.json,
          tokensUsed: result.tokensUsed,
          model: result.model,
        });
      } else {
        await storage.deleteDocumentsByApplication(id);
        const generated = await generateDocuments(genInput);
        await Promise.all([
          storage.createDocument({
            applicationId: id,
            userId,
            docType: "resume",
            contentMd: generated.resume.md,
            contentJson: generated.resume.json,
            tokensUsed: Math.floor(generated.tokensUsed / 3),
            model: generated.model,
          }),
          storage.createDocument({
            applicationId: id,
            userId,
            docType: "cover_letter",
            contentMd: generated.coverLetter.md,
            contentJson: generated.coverLetter.json,
            tokensUsed: Math.floor(generated.tokensUsed / 3),
            model: generated.model,
          }),
          storage.createDocument({
            applicationId: id,
            userId,
            docType: "followup_email",
            contentMd: generated.followupEmail.md,
            contentJson: generated.followupEmail.json,
            tokensUsed: Math.floor(generated.tokensUsed / 3),
            model: generated.model,
          }),
        ]);
      }

      await storage.updateApplicationStatus(id, "generated");
      await storage.incrementUsage(userId, "regenerations");

      res.json({ success: true });
    } catch (error) {
      console.error("Error regenerating:", error);
      res.status(500).json({ message: "Regeneration failed" });
    }
  });

  app.put("/api/applykit/documents/:docId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const docId = parseInt(req.params.docId);
      const { contentJson, contentMd } = req.body;

      const doc = await storage.getDocument(docId);
      if (!doc || doc.userId !== userId) {
        return res.status(404).json({ message: "Document not found" });
      }

      const updates: any = {};
      if (contentJson !== undefined) updates.contentJson = contentJson;
      if (contentMd !== undefined) updates.contentMd = contentMd;

      const updated = await storage.updateDocument(docId, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.get("/api/applykit/documents/:docId/export", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const docId = parseInt(req.params.docId);
      const format = req.query.format as string;

      if (!["pdf", "docx"].includes(format)) {
        return res.status(400).json({ message: "Format must be pdf or docx" });
      }

      const doc = await storage.getDocument(docId);
      if (!doc || doc.userId !== userId) {
        return res.status(404).json({ message: "Document not found" });
      }

      const contentJson = doc.contentJson as any;
      if (!contentJson || Object.keys(contentJson).length === 0) {
        return res.status(400).json({ message: "Document has no structured content for export" });
      }

      let buffer: Buffer;
      let filename: string;

      if (doc.docType === "resume") {
        if (format === "pdf") {
          buffer = await generateResumePdf(contentJson);
          filename = "resume.pdf";
        } else {
          buffer = await generateResumeDocx(contentJson);
          filename = "resume.docx";
        }
      } else if (doc.docType === "cover_letter") {
        if (format === "pdf") {
          buffer = await generateCoverLetterPdf(contentJson);
          filename = "cover-letter.pdf";
        } else {
          buffer = await generateCoverLetterDocx(contentJson);
          filename = "cover-letter.docx";
        }
      } else {
        return res.status(400).json({ message: "Export only available for resume and cover letter" });
      }

      const contentType = format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting document:", error);
      res.status(500).json({ message: "Export failed" });
    }
  });

  app.get("/api/applykit/usage", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const usage = await storage.getUsage(userId);
      res.json(usage || { applicationsGenerated: 0, regenerations: 0 });
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  app.delete("/api/applykit/data", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteAllUserData(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting data:", error);
      res.status(500).json({ message: "Failed to delete data" });
    }
  });

  await storage.seedTemplates();

  return httpServer;
}
