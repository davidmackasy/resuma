import { eq, desc, and, gte, lte, sql, count, like, or } from "drizzle-orm";
import { db } from "./db";
import {
  applykit_profiles,
  applykit_applications,
  applykit_documents,
  applykit_job_analysis,
  applykit_usage,
  applykit_templates,
  applykit_admins,
  applykit_user_flags,
  applykit_user_overrides,
  applykit_events,
  type Profile,
  type InsertProfile,
  type Application,
  type InsertApplication,
  type AppDocument,
  type InsertDocument,
  type JobAnalysis,
  type InsertJobAnalysis,
  type Usage,
  type Template,
  type Admin,
  type UserFlag,
  type UserOverride,
  type AppEvent,
} from "@shared/schema";
import { users } from "@shared/models/auth";

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
  createJobAnalysis(data: InsertJobAnalysis): Promise<JobAnalysis>;
  getJobAnalysis(applicationId: number): Promise<JobAnalysis | undefined>;
  deleteJobAnalysis(applicationId: number): Promise<void>;
  getUsage(userId: string): Promise<Usage | undefined>;
  incrementUsage(userId: string, field: "applicationsGenerated" | "regenerations"): Promise<void>;
  getTemplates(): Promise<Template[]>;
  seedTemplates(): Promise<void>;
  deleteAllUserData(userId: string): Promise<void>;
  isAdmin(userId: string): Promise<boolean>;
  getAdmin(userId: string): Promise<Admin | undefined>;
  getAdmins(): Promise<Admin[]>;
  addAdmin(userId: string, email: string, role: string, createdBy?: string): Promise<Admin>;
  updateAdmin(id: number, data: Partial<{ role: string; isActive: boolean }>): Promise<Admin>;
  getUserFlag(userId: string): Promise<UserFlag | undefined>;
  setUserFlag(userId: string, data: Partial<{ isBanned: boolean; banReason: string | null; bannedBy: string | null; notes: string | null }>): Promise<UserFlag>;
  getUserOverride(userId: string): Promise<UserOverride | undefined>;
  setUserOverride(userId: string, data: Partial<{ extraApplications: number; extraRegenerations: number; forceUnlimited: boolean; overrideExpiresAt: Date | null; updatedBy: string | null }>): Promise<UserOverride>;
  trackEvent(userId: string | null, eventType: string, metadata?: any): Promise<void>;
  getEvents(options: { limit?: number; offset?: number; eventType?: string }): Promise<AppEvent[]>;
  getAllUsers(options: { query?: string; filter?: string; page?: number; limit?: number }): Promise<{ users: any[]; total: number }>;
  getUserDetail(userId: string): Promise<any>;
  getMetrics(days: number): Promise<any>;
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

  async createJobAnalysis(data: InsertJobAnalysis): Promise<JobAnalysis> {
    const [analysis] = await db.insert(applykit_job_analysis).values(data).returning();
    return analysis;
  }

  async getJobAnalysis(applicationId: number): Promise<JobAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(applykit_job_analysis)
      .where(eq(applykit_job_analysis.applicationId, applicationId));
    return analysis;
  }

  async deleteJobAnalysis(applicationId: number): Promise<void> {
    await db.delete(applykit_job_analysis).where(eq(applykit_job_analysis.applicationId, applicationId));
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
      await db.delete(applykit_job_analysis).where(eq(applykit_job_analysis.applicationId, app.id));
    }
    await db.delete(applykit_applications).where(eq(applykit_applications.userId, userId));
    await db.delete(applykit_usage).where(eq(applykit_usage.userId, userId));
    await db.delete(applykit_profiles).where(eq(applykit_profiles.userId, userId));
  }

  async isAdmin(userId: string): Promise<boolean> {
    const [admin] = await db.select().from(applykit_admins)
      .where(and(eq(applykit_admins.userId, userId), eq(applykit_admins.isActive, true)));
    return !!admin;
  }

  async getAdmin(userId: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(applykit_admins)
      .where(eq(applykit_admins.userId, userId));
    return admin;
  }

  async getAdmins(): Promise<Admin[]> {
    return db.select().from(applykit_admins).orderBy(desc(applykit_admins.createdAt));
  }

  async addAdmin(userId: string, email: string, role: string, createdBy?: string): Promise<Admin> {
    const [admin] = await db.insert(applykit_admins)
      .values({ userId, email, role, createdBy: createdBy || null })
      .returning();
    return admin;
  }

  async updateAdmin(id: number, data: Partial<{ role: string; isActive: boolean }>): Promise<Admin> {
    const [admin] = await db.update(applykit_admins).set(data)
      .where(eq(applykit_admins.id, id)).returning();
    return admin;
  }

  async getUserFlag(userId: string): Promise<UserFlag | undefined> {
    const [flag] = await db.select().from(applykit_user_flags)
      .where(eq(applykit_user_flags.userId, userId));
    return flag;
  }

  async setUserFlag(userId: string, data: Partial<{ isBanned: boolean; banReason: string | null; bannedBy: string | null; notes: string | null }>): Promise<UserFlag> {
    const existing = await this.getUserFlag(userId);
    if (existing) {
      const [updated] = await db.update(applykit_user_flags)
        .set({ ...data, updatedAt: new Date(), ...(data.isBanned ? { bannedAt: new Date() } : { bannedAt: null }) })
        .where(eq(applykit_user_flags.userId, userId)).returning();
      return updated;
    }
    const [created] = await db.insert(applykit_user_flags)
      .values({ userId, ...data, ...(data.isBanned ? { bannedAt: new Date() } : {}) } as any)
      .returning();
    return created;
  }

  async getUserOverride(userId: string): Promise<UserOverride | undefined> {
    const [override] = await db.select().from(applykit_user_overrides)
      .where(eq(applykit_user_overrides.userId, userId));
    return override;
  }

  async setUserOverride(userId: string, data: Partial<{ extraApplications: number; extraRegenerations: number; forceUnlimited: boolean; overrideExpiresAt: Date | null; updatedBy: string | null }>): Promise<UserOverride> {
    const existing = await this.getUserOverride(userId);
    if (existing) {
      const [updated] = await db.update(applykit_user_overrides)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(applykit_user_overrides.userId, userId)).returning();
      return updated;
    }
    const [created] = await db.insert(applykit_user_overrides)
      .values({ userId, ...data } as any)
      .returning();
    return created;
  }

  async trackEvent(userId: string | null, eventType: string, metadata?: any): Promise<void> {
    await db.insert(applykit_events).values({
      userId,
      eventType,
      metadata: metadata || {},
    });
  }

  async getEvents(options: { limit?: number; offset?: number; eventType?: string }): Promise<AppEvent[]> {
    let query = db.select().from(applykit_events).orderBy(desc(applykit_events.createdAt));
    if (options.eventType) {
      query = query.where(eq(applykit_events.eventType, options.eventType)) as any;
    }
    return (query as any).limit(options.limit || 50).offset(options.offset || 0);
  }

  async getAllUsers(options: { query?: string; filter?: string; page?: number; limit?: number }): Promise<{ users: any[]; total: number }> {
    const pageSize = options.limit || 20;
    const offset = ((options.page || 1) - 1) * pageSize;

    let whereClause: any = undefined;
    if (options.query) {
      const searchTerm = `%${options.query}%`;
      whereClause = or(
        like(users.email, searchTerm),
        like(users.firstName, searchTerm),
        like(users.lastName, searchTerm)
      );
    }

    const userRows = whereClause
      ? await db.select().from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(pageSize).offset(offset)
      : await db.select().from(users).orderBy(desc(users.createdAt)).limit(pageSize).offset(offset);

    const [totalResult] = whereClause
      ? await db.select({ count: count() }).from(users).where(whereClause)
      : await db.select({ count: count() }).from(users);

    const enriched = await Promise.all(userRows.map(async (u) => {
      const profile = await this.getProfile(u.id);
      const usage = await this.getUsage(u.id);
      const flag = await this.getUserFlag(u.id);
      const override = await this.getUserOverride(u.id);
      const isAdminUser = await this.isAdmin(u.id);
      const appCount = await db.select({ count: count() }).from(applykit_applications).where(eq(applykit_applications.userId, u.id));
      return {
        ...u,
        profileName: profile?.fullName || "",
        profileComplete: profile?.structuredComplete || false,
        usage: usage ? { applicationsGenerated: usage.applicationsGenerated, regenerations: usage.regenerations } : null,
        isBanned: flag?.isBanned || false,
        isAdmin: isAdminUser,
        forceUnlimited: override?.forceUnlimited || false,
        totalApplications: appCount[0]?.count || 0,
      };
    }));

    if (options.filter === "banned") {
      return { users: enriched.filter(u => u.isBanned), total: enriched.filter(u => u.isBanned).length };
    }

    return { users: enriched, total: totalResult.count };
  }

  async getUserDetail(userId: string): Promise<any> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;
    const profile = await this.getProfile(userId);
    const usage = await this.getUsage(userId);
    const flag = await this.getUserFlag(userId);
    const override = await this.getUserOverride(userId);
    const isAdminUser = await this.isAdmin(userId);
    const apps = await db.select().from(applykit_applications)
      .where(eq(applykit_applications.userId, userId))
      .orderBy(desc(applykit_applications.createdAt)).limit(10);
    const [appCount] = await db.select({ count: count() }).from(applykit_applications)
      .where(eq(applykit_applications.userId, userId));
    return {
      ...user,
      profile,
      usage: usage ? { applicationsGenerated: usage.applicationsGenerated, regenerations: usage.regenerations } : null,
      flag,
      override,
      isAdmin: isAdminUser,
      recentApplications: apps,
      totalApplications: appCount?.count || 0,
    };
  }

  async getMetrics(days: number): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [signupsToday] = await db.select({ count: count() }).from(users)
      .where(gte(users.createdAt, today));
    const [signupsWeek] = await db.select({ count: count() }).from(users)
      .where(gte(users.createdAt, new Date(today.getTime() - 7 * 86400000)));

    const [totalApps] = await db.select({ count: count() }).from(applykit_applications);
    const [appsToday] = await db.select({ count: count() }).from(applykit_applications)
      .where(gte(applykit_applications.createdAt, today));
    const [appsWeek] = await db.select({ count: count() }).from(applykit_applications)
      .where(gte(applykit_applications.createdAt, new Date(today.getTime() - 7 * 86400000)));

    const signupsByDay = await db.select({
      date: sql<string>`DATE(${users.createdAt})`,
      count: count(),
    }).from(users)
      .where(gte(users.createdAt, since))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    const appsByDay = await db.select({
      date: sql<string>`DATE(${applykit_applications.createdAt})`,
      count: count(),
    }).from(applykit_applications)
      .where(gte(applykit_applications.createdAt, since))
      .groupBy(sql`DATE(${applykit_applications.createdAt})`)
      .orderBy(sql`DATE(${applykit_applications.createdAt})`);

    const eventsByDay = await db.select({
      date: sql<string>`DATE(${applykit_events.createdAt})`,
      eventType: applykit_events.eventType,
      count: count(),
    }).from(applykit_events)
      .where(gte(applykit_events.createdAt, since))
      .groupBy(sql`DATE(${applykit_events.createdAt})`, applykit_events.eventType)
      .orderBy(sql`DATE(${applykit_events.createdAt})`);

    return {
      totalUsers: totalUsers.count,
      signupsToday: signupsToday.count,
      signupsWeek: signupsWeek.count,
      totalApplications: totalApps.count,
      applicationsToday: appsToday.count,
      applicationsWeek: appsWeek.count,
      signupsByDay,
      applicationsByDay: appsByDay,
      eventsByDay,
    };
  }
}

export const storage = new DatabaseStorage();
