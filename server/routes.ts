import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { analyzeJob, generateFromAnalysis, generateDocuments, generateSingleDocument, generatePracticeQuestions } from "./generation";
import { generateResumePdf, generateCoverLetterPdf } from "./export-pdf";
import { generateResumeDocx, generateCoverLetterDocx } from "./export-docx";
import { extractTextFromFile, parseResumeText } from "./resume-parser";
import { getStripeClient, getStripePublishableKey, getStripePriceId } from "./stripeClient";
import { authStorage } from "./replit_integrations/auth/storage";
import { sql } from "drizzle-orm";
import { db } from "./db";
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

  const checkBan: any = async (req: any, res: any, next: any) => {
    const userId = req.user?.claims?.sub;
    if (userId) {
      const flag = await storage.getUserFlag(userId);
      if (flag?.isBanned) {
        return res.status(403).json({ message: "Account disabled", banned: true });
      }
    }
    return next();
  };

  const requireSubscription: any = async (req: any, res: any, next: any) => {
    const userId = req.user?.claims?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const isAdminUser = await storage.isAdmin(userId);
    if (isAdminUser) return next();

    const user = await authStorage.getUser(userId);
    if (user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing") {
      return next();
    }
    return res.status(403).json({ code: "SUBSCRIPTION_REQUIRED", message: "Active subscription required" });
  };

  app.get("/api/applykit/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      const isAdminUser = await storage.isAdmin(userId);

      if (isAdminUser) {
        return res.json({
          isAdmin: true,
          subscriptionStatus: "active",
          hasAccess: true,
        });
      }

      let subscription = null;
      if (user?.stripeSubscriptionId) {
        try {
          const stripe = getStripeClient();
          const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          subscription = {
            id: sub.id,
            status: sub.status,
            current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (sub as any).cancel_at_period_end,
          };
        } catch (e) {
          console.error("Error fetching subscription from Stripe:", e);
        }
      }

      res.json({
        isAdmin: false,
        subscriptionStatus: user?.subscriptionStatus || null,
        stripeCustomerId: user?.stripeCustomerId || null,
        hasAccess: user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing",
        subscription,
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.get("/api/stripe/publishable-key", async (_req, res) => {
    try {
      const key = getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Error getting publishable key:", error);
      res.status(500).json({ message: "Failed to get Stripe key" });
    }
  });

  app.post("/api/applykit/create-checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const isAdminUser = await storage.isAdmin(userId);
      if (isAdminUser) {
        return res.status(400).json({ message: "Admins do not need a subscription" });
      }

      const stripe = getStripeClient();
      const priceId = getStripePriceId();

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        await db.execute(
          sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${userId}`
        );
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${baseUrl}/app?subscription=success`,
        cancel_url: `${baseUrl}/subscribe?cancelled=true`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/applykit/create-portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No billing account found" });
      }

      const stripe = getStripeClient();
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/app/settings`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal:", error);
      res.status(500).json({ message: "Failed to create billing portal" });
    }
  });

  app.post("/api/stripe/sync-subscription", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      if (!user?.stripeCustomerId) {
        return res.json({ subscriptionStatus: null });
      }

      const stripe = getStripeClient();
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'all',
        limit: 1,
      });

      const sub = subscriptions.data[0];
      if (sub) {
        await db.execute(
          sql`UPDATE users SET stripe_subscription_id = ${sub.id}, subscription_status = ${sub.status}, updated_at = NOW() WHERE id = ${userId}`
        );
        return res.json({ subscriptionStatus: sub.status });
      }

      return res.json({ subscriptionStatus: null });
    } catch (error) {
      console.error("Error syncing subscription:", error);
      res.status(500).json({ message: "Failed to sync subscription" });
    }
  });

  app.get("/api/applykit/profile", isAuthenticated, checkBan, async (req: any, res) => {
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

  app.put("/api/applykit/profile", isAuthenticated, checkBan, async (req: any, res) => {
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

      if (file.mimetype !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          code: "INVALID_FILE_FORMAT",
          message: "Only DOCX files are supported.",
        });
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

  app.post("/api/applykit/applications", isAuthenticated, checkBan, requireSubscription, async (req: any, res) => {
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
      const isAdminUser = await storage.isAdmin(userId);
      const override = await storage.getUserOverride(userId);
      const isUnlimited = isAdminUser || (override?.forceUnlimited && (!override.overrideExpiresAt || override.overrideExpiresAt > new Date()));
      const appLimit = 30 + (override?.extraApplications || 0);
      if (!isUnlimited && usage && usage.applicationsGenerated >= appLimit) {
        return res.status(403).json({ message: `Monthly application limit reached (${appLimit}/${appLimit})` });
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
        await storage.trackEvent(userId, "analysis", { applicationId: application.id });

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

  app.post("/api/applykit/applications/:id/generate", isAuthenticated, checkBan, requireSubscription, async (req: any, res) => {
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
        await storage.trackEvent(userId, "generate", { applicationId: id });

        try {
          if (generated.resume.md && generated.resume.md !== "Generation failed - no resume content") {
            const practice = await generatePracticeQuestions(
              generated.resume.md,
              application.jobDescription,
              application.roleTitle || undefined,
              application.companyName || undefined,
            );
            await storage.updateApplicationPracticeContent(id, practice);
          }
        } catch (practiceError) {
          console.error("Practice generation failed (non-blocking):", practiceError);
        }

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

  app.post("/api/applykit/applications/:id/regenerate", isAuthenticated, checkBan, requireSubscription, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);

      const application = await storage.getApplication(id, userId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const usage = await storage.getUsage(userId);
      const isAdminUser = await storage.isAdmin(userId);
      const override = await storage.getUserOverride(userId);
      const isUnlimited = isAdminUser || (override?.forceUnlimited && (!override.overrideExpiresAt || override.overrideExpiresAt > new Date()));
      const regenLimit = 30 + (override?.extraRegenerations || 0);
      if (!isUnlimited && usage && usage.regenerations >= regenLimit) {
        return res.status(403).json({ message: `Monthly regeneration limit reached (${regenLimit}/${regenLimit})` });
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

        if (docType === "resume") {
          try {
            if (result.md) {
              const practice = await generatePracticeQuestions(
                result.md,
                application.jobDescription,
                application.roleTitle || undefined,
                application.companyName || undefined,
              );
              await storage.updateApplicationPracticeContent(id, practice);
            }
          } catch (practiceError) {
            console.error("Practice regeneration failed (non-blocking):", practiceError);
          }
        }
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

        try {
          if (generated.resume.md && generated.resume.md !== "Generation failed - no resume content") {
            const practice = await generatePracticeQuestions(
              generated.resume.md,
              application.jobDescription,
              application.roleTitle || undefined,
              application.companyName || undefined,
            );
            await storage.updateApplicationPracticeContent(id, practice);
          }
        } catch (practiceError) {
          console.error("Practice regeneration failed (non-blocking):", practiceError);
        }
      }

      await storage.updateApplicationStatus(id, "generated");
      await storage.incrementUsage(userId, "regenerations");
      await storage.trackEvent(userId, "regenerate", { applicationId: id });

      res.json({ success: true });
    } catch (error) {
      console.error("Error regenerating:", error);
      res.status(500).json({ message: "Regeneration failed" });
    }
  });

  app.put("/api/applykit/documents/:docId", isAuthenticated, checkBan, async (req: any, res) => {
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

  const isAdminMiddleware: any = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.claims.sub;
    const admin = await storage.isAdmin(userId);
    if (!admin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };

  app.get("/api/applykit/admin/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.getAdmin(userId);
      res.json({ isAdmin: !!admin?.isActive, role: admin?.role || null });
    } catch (error) {
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  app.get("/api/applykit/admin/metrics", isAdminMiddleware, async (req: any, res) => {
    try {
      const days = parseInt(req.query.days as string) || 14;
      const metrics = await storage.getMetrics(days);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/applykit/admin/users", isAdminMiddleware, async (req: any, res) => {
    try {
      const { query, filter, page, limit } = req.query;
      const result = await storage.getAllUsers({
        query: query as string,
        filter: filter as string,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/applykit/admin/users/:userId", isAdminMiddleware, async (req: any, res) => {
    try {
      const detail = await storage.getUserDetail(req.params.userId);
      if (!detail) return res.status(404).json({ message: "User not found" });
      res.json(detail);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      res.status(500).json({ message: "Failed to fetch user detail" });
    }
  });

  app.post("/api/applykit/admin/users/:userId/override", isAdminMiddleware, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const { extraApplications, extraRegenerations, forceUnlimited, overrideExpiresAt } = req.body;
      const override = await storage.setUserOverride(req.params.userId, {
        extraApplications: extraApplications || 0,
        extraRegenerations: extraRegenerations || 0,
        forceUnlimited: forceUnlimited || false,
        overrideExpiresAt: overrideExpiresAt ? new Date(overrideExpiresAt) : null,
        updatedBy: adminUserId,
      });
      await storage.trackEvent(adminUserId, "admin_override", { targetUserId: req.params.userId, ...req.body });
      res.json(override);
    } catch (error) {
      console.error("Error setting override:", error);
      res.status(500).json({ message: "Failed to set override" });
    }
  });

  app.post("/api/applykit/admin/users/:userId/ban", isAdminMiddleware, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const { reason } = req.body;
      const flag = await storage.setUserFlag(req.params.userId, {
        isBanned: true,
        banReason: reason || "Banned by admin",
        bannedBy: adminUserId,
      });
      await storage.trackEvent(adminUserId, "admin_ban", { targetUserId: req.params.userId, reason });
      res.json(flag);
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.post("/api/applykit/admin/users/:userId/unban", isAdminMiddleware, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const flag = await storage.setUserFlag(req.params.userId, {
        isBanned: false,
        banReason: null,
        bannedBy: null,
      });
      await storage.trackEvent(adminUserId, "admin_unban", { targetUserId: req.params.userId });
      res.json(flag);
    } catch (error) {
      console.error("Error unbanning user:", error);
      res.status(500).json({ message: "Failed to unban user" });
    }
  });

  app.get("/api/applykit/admin/admins", isAdminMiddleware, async (_req: any, res) => {
    try {
      const admins = await storage.getAdmins();
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  app.post("/api/applykit/admin/admins", isAdminMiddleware, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const currentAdmin = await storage.getAdmin(adminUserId);
      if (!currentAdmin || currentAdmin.role !== "owner") {
        return res.status(403).json({ message: "Only owners can add admins" });
      }
      const { email, role } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const { users: foundUsers } = await storage.getAllUsers({ query: email, limit: 1 });
      const targetUser = foundUsers.find((u: any) => u.email === email);
      if (!targetUser) return res.status(404).json({ message: "User must sign up first" });

      const admin = await storage.addAdmin(targetUser.id, email, role || "admin", adminUserId);
      await storage.trackEvent(adminUserId, "admin_add", { targetEmail: email, role: role || "admin" });
      res.json(admin);
    } catch (error) {
      console.error("Error adding admin:", error);
      res.status(500).json({ message: "Failed to add admin" });
    }
  });

  app.patch("/api/applykit/admin/admins/:adminId", isAdminMiddleware, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const currentAdmin = await storage.getAdmin(adminUserId);
      if (!currentAdmin || currentAdmin.role !== "owner") {
        return res.status(403).json({ message: "Only owners can modify admins" });
      }
      const adminId = parseInt(req.params.adminId);
      const { role, isActive } = req.body;
      const updated = await storage.updateAdmin(adminId, { role, isActive });
      res.json(updated);
    } catch (error) {
      console.error("Error updating admin:", error);
      res.status(500).json({ message: "Failed to update admin" });
    }
  });

  app.get("/api/applykit/admin/events", isAdminMiddleware, async (req: any, res) => {
    try {
      const { eventType, limit, offset } = req.query;
      const events = await storage.getEvents({
        eventType: eventType as string,
        limit: parseInt(limit as string) || 50,
        offset: parseInt(offset as string) || 0,
      });
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  await storage.seedTemplates();

  return httpServer;
}
