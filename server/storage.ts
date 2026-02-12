import { eq, desc, and, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  applykit_profiles,
  applykit_applications,
  applykit_documents,
  applykit_usage,
  applykit_templates,
  type Profile,
  type InsertProfile,
  type Application,
  type InsertApplication,
  type AppDocument,
  type InsertDocument,
  type Usage,
  type Template,
} from "@shared/schema";

export interface IStorage {
  getProfile(userId: string): Promise<Profile | undefined>;
  upsertProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile>;
  getApplications(userId: string): Promise<Application[]>;
  getApplication(id: number, userId: string): Promise<Application | undefined>;
  createApplication(data: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<void>;
  getDocuments(applicationId: number): Promise<AppDocument[]>;
  getDocument(id: number): Promise<AppDocument | undefined>;
  getDocumentByType(applicationId: number, docType: string): Promise<AppDocument | undefined>;
  createDocument(data: InsertDocument): Promise<AppDocument>;
  updateDocument(id: number, data: Partial<{ contentMd: string; contentJson: any }>): Promise<AppDocument>;
  deleteDocumentsByApplication(applicationId: number): Promise<void>;
  deleteDocumentByType(applicationId: number, docType: string): Promise<void>;
  getUsage(userId: string): Promise<Usage | undefined>;
  incrementUsage(userId: string, field: "applicationsGenerated" | "regenerations"): Promise<void>;
  getTemplates(): Promise<Template[]>;
  seedTemplates(): Promise<void>;
  deleteAllUserData(userId: string): Promise<void>;
}

class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(applykit_profiles).where(eq(applykit_profiles.userId, userId));
    return profile;
  }

  async upsertProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile> {
    const existing = await this.getProfile(userId);
    if (existing) {
      const [updated] = await db
        .update(applykit_profiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(applykit_profiles.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(applykit_profiles)
      .values({ ...data, userId } as any)
      .returning();
    return created;
  }

  async getApplications(userId: string): Promise<Application[]> {
    return db
      .select()
      .from(applykit_applications)
      .where(eq(applykit_applications.userId, userId))
      .orderBy(desc(applykit_applications.createdAt));
  }

  async getApplication(id: number, userId: string): Promise<Application | undefined> {
    const [app] = await db
      .select()
      .from(applykit_applications)
      .where(and(eq(applykit_applications.id, id), eq(applykit_applications.userId, userId)));
    return app;
  }

  async createApplication(data: InsertApplication): Promise<Application> {
    const [app] = await db.insert(applykit_applications).values(data).returning();
    return app;
  }

  async updateApplicationStatus(id: number, status: string): Promise<void> {
    await db
      .update(applykit_applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applykit_applications.id, id));
  }

  async getDocuments(applicationId: number): Promise<AppDocument[]> {
    return db
      .select()
      .from(applykit_documents)
      .where(eq(applykit_documents.applicationId, applicationId));
  }

  async getDocument(id: number): Promise<AppDocument | undefined> {
    const [doc] = await db
      .select()
      .from(applykit_documents)
      .where(eq(applykit_documents.id, id));
    return doc;
  }

  async getDocumentByType(applicationId: number, docType: string): Promise<AppDocument | undefined> {
    const [doc] = await db
      .select()
      .from(applykit_documents)
      .where(and(eq(applykit_documents.applicationId, applicationId), eq(applykit_documents.docType, docType)));
    return doc;
  }

  async createDocument(data: InsertDocument): Promise<AppDocument> {
    const [doc] = await db.insert(applykit_documents).values(data).returning();
    return doc;
  }

  async updateDocument(id: number, data: Partial<{ contentMd: string; contentJson: any }>): Promise<AppDocument> {
    const [doc] = await db
      .update(applykit_documents)
      .set(data)
      .where(eq(applykit_documents.id, id))
      .returning();
    return doc;
  }

  async deleteDocumentsByApplication(applicationId: number): Promise<void> {
    await db.delete(applykit_documents).where(eq(applykit_documents.applicationId, applicationId));
  }

  async deleteDocumentByType(applicationId: number, docType: string): Promise<void> {
    await db.delete(applykit_documents).where(
      and(eq(applykit_documents.applicationId, applicationId), eq(applykit_documents.docType, docType))
    );
  }

  async getUsage(userId: string): Promise<Usage | undefined> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    const [usage] = await db
      .select()
      .from(applykit_usage)
      .where(
        and(
          eq(applykit_usage.userId, userId),
          eq(applykit_usage.periodStart, periodStart)
        )
      );

    if (!usage) {
      const [created] = await db
        .insert(applykit_usage)
        .values({
          userId,
          periodStart,
          periodEnd,
          applicationsGenerated: 0,
          regenerations: 0,
        })
        .returning();
      return created;
    }
    return usage;
  }

  async incrementUsage(userId: string, field: "applicationsGenerated" | "regenerations"): Promise<void> {
    const usage = await this.getUsage(userId);
    if (!usage) return;
    await db
      .update(applykit_usage)
      .set({ [field]: (usage[field] || 0) + 1 })
      .where(eq(applykit_usage.id, usage.id));
  }

  async getTemplates(): Promise<Template[]> {
    return db.select().from(applykit_templates).where(eq(applykit_templates.isActive, true));
  }

  async seedTemplates(): Promise<void> {
    const templates = [
      {
        id: "modern_minimal",
        name: "Modern Minimal",
        description: "Clean lines, ample whitespace, contemporary feel",
        config: { fontFamily: "Inter", headerStyle: "bold-left", spacing: "relaxed", bulletStyle: "dash" },
        isActive: true,
      },
      {
        id: "professional_corporate",
        name: "Professional Corporate",
        description: "Traditional layout suited for enterprise roles",
        config: { fontFamily: "Merriweather", headerStyle: "centered", spacing: "compact", bulletStyle: "bullet" },
        isActive: true,
      },
      {
        id: "tech_product",
        name: "Tech & Product",
        description: "Optimized for technical and product roles",
        config: { fontFamily: "JetBrains Mono", headerStyle: "bold-left", spacing: "normal", bulletStyle: "dash" },
        isActive: true,
      },
      {
        id: "executive_clean",
        name: "Executive Clean",
        description: "Polished layout for senior leadership positions",
        config: { fontFamily: "Playfair Display", headerStyle: "elegant", spacing: "generous", bulletStyle: "bullet" },
        isActive: true,
      },
    ];

    for (const tpl of templates) {
      const existing = await db.select().from(applykit_templates).where(eq(applykit_templates.id, tpl.id));
      if (existing.length === 0) {
        await db.insert(applykit_templates).values(tpl);
      }
    }
  }

  async deleteAllUserData(userId: string): Promise<void> {
    const apps = await db
      .select()
      .from(applykit_applications)
      .where(eq(applykit_applications.userId, userId));
    for (const app of apps) {
      await db.delete(applykit_documents).where(eq(applykit_documents.applicationId, app.id));
    }
    await db.delete(applykit_applications).where(eq(applykit_applications.userId, userId));
    await db.delete(applykit_usage).where(eq(applykit_usage.userId, userId));
    await db.delete(applykit_profiles).where(eq(applykit_profiles.userId, userId));
  }
}

export const storage = new DatabaseStorage();
