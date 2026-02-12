import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { generateDocuments } from "./generation";

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

  app.post("/api/applykit/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { jobDescription, companyName, roleTitle, jobLocation, jobUrl, hiringManager, tone, templateId } = req.body;

      if (!jobDescription?.trim()) {
        return res.status(400).json({ message: "Job description is required" });
      }

      const profile = await storage.getProfile(userId);
      if (!profile || !profile.fullName) {
        return res.status(400).json({ message: "Please set up your profile first" });
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
        const generated = await generateDocuments({
          profile,
          jobDescription,
          companyName,
          roleTitle,
          jobLocation,
          hiringManager,
          tone: tone || "professional",
          templateId: templateId || "modern_minimal",
        });

        await Promise.all([
          storage.createDocument({
            applicationId: application.id,
            userId,
            docType: "resume",
            contentMd: generated.resume,
            contentJson: {},
            tokensUsed: Math.floor(generated.tokensUsed / 3),
            model: generated.model,
          }),
          storage.createDocument({
            applicationId: application.id,
            userId,
            docType: "cover_letter",
            contentMd: generated.coverLetter,
            contentJson: {},
            tokensUsed: Math.floor(generated.tokensUsed / 3),
            model: generated.model,
          }),
          storage.createDocument({
            applicationId: application.id,
            userId,
            docType: "followup_email",
            contentMd: generated.followupEmail,
            contentJson: {},
            tokensUsed: Math.floor(generated.tokensUsed / 3),
            model: generated.model,
          }),
        ]);

        await storage.updateApplicationStatus(application.id, "generated");
        await storage.incrementUsage(userId, "applicationsGenerated");

        res.json({ id: application.id, status: "generated" });
      } catch (genError) {
        console.error("Generation error:", genError);
        await storage.updateApplicationStatus(application.id, "failed");
        res.status(500).json({ message: "Document generation failed. Please try again." });
      }
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
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

      await storage.deleteDocumentsByApplication(id);

      const generated = await generateDocuments({
        profile,
        jobDescription: application.jobDescription,
        companyName: application.companyName || undefined,
        roleTitle: application.roleTitle || undefined,
        jobLocation: application.jobLocation || undefined,
        hiringManager: application.hiringManager || undefined,
        tone: application.tone,
        templateId: application.templateId,
      });

      await Promise.all([
        storage.createDocument({
          applicationId: id,
          userId,
          docType: "resume",
          contentMd: generated.resume,
          contentJson: {},
          tokensUsed: Math.floor(generated.tokensUsed / 3),
          model: generated.model,
        }),
        storage.createDocument({
          applicationId: id,
          userId,
          docType: "cover_letter",
          contentMd: generated.coverLetter,
          contentJson: {},
          tokensUsed: Math.floor(generated.tokensUsed / 3),
          model: generated.model,
        }),
        storage.createDocument({
          applicationId: id,
          userId,
          docType: "followup_email",
          contentMd: generated.followupEmail,
          contentJson: {},
          tokensUsed: Math.floor(generated.tokensUsed / 3),
          model: generated.model,
        }),
      ]);

      await storage.updateApplicationStatus(id, "generated");
      await storage.incrementUsage(userId, "regenerations");

      res.json({ success: true });
    } catch (error) {
      console.error("Error regenerating:", error);
      res.status(500).json({ message: "Regeneration failed" });
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
