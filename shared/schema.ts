export * from "./models/auth";

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, serial, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export const applykit_profiles = pgTable("applykit_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  fullName: text("full_name").notNull().default(""),
  title: text("title").default(""),
  location: text("location").default(""),
  email: text("email").default(""),
  phone: text("phone").default(""),
  links: jsonb("links").$type<{ linkedin?: string; portfolio?: string; github?: string }>().default({}),
  summaryBase: text("summary_base").default(""),
  skills: jsonb("skills").$type<{ groups: { name: string; items: string[] }[] }>().default({ groups: [] }),
  experience: jsonb("experience").$type<{ roles: { company: string; title: string; location: string; startDate: string; endDate: string; bullets: string[] }[] }>().default({ roles: [] }),
  education: jsonb("education").$type<{ items: { school: string; degree: string; field: string; year: string }[] }>().default({ items: [] }),
  certifications: jsonb("certifications").$type<{ items: { name: string; issuer: string; year: string }[] }>().default({ items: [] }),
  resumeInputMethod: text("resume_input_method").default("manual"),
  resumeFileUrl: text("resume_file_url"),
  resumeFileType: text("resume_file_type"),
  resumeVersion: integer("resume_version").notNull().default(1),
  structuredComplete: boolean("structured_complete").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applykit_applications = pgTable("applykit_applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  companyName: text("company_name").default(""),
  roleTitle: text("role_title").default(""),
  jobLocation: text("job_location").default(""),
  jobUrl: text("job_url").default(""),
  hiringManager: text("hiring_manager").default(""),
  jobDescription: text("job_description").notNull(),
  tone: text("tone").notNull().default("professional"),
  templateId: text("template_id").notNull().default("modern_minimal"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applykit_job_analysis = pgTable("applykit_job_analysis", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applykit_applications.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  jobDescription: text("job_description").notNull(),
  fitScore: integer("fit_score").notNull().default(0),
  matchedSkills: jsonb("matched_skills").$type<string[]>().default([]),
  missingSkills: jsonb("missing_skills").$type<string[]>().default([]),
  riskFlags: jsonb("risk_flags").$type<{ type: string; severity: string; message: string }[]>().default([]),
  transferableAngle: jsonb("transferable_angle").$type<{ title: string; explanation: string }>().default({ title: "", explanation: "" }),
  suggestedAdditions: jsonb("suggested_additions").$type<{
    id: string;
    type: string;
    targetRole: string;
    originalBullet: string;
    improvedBullet: string;
    reason: string;
  }[]>().default([]),
  jobExtraction: jsonb("job_extraction").$type<{
    jobCategory: string;
    industry: string;
    seniorityLevel: string;
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    certificationsRequired: string[];
    yearsExperienceRequired: string;
    keywords: string[];
  }>().default({
    jobCategory: "",
    industry: "",
    seniorityLevel: "",
    requiredSkills: [],
    preferredSkills: [],
    responsibilities: [],
    certificationsRequired: [],
    yearsExperienceRequired: "",
    keywords: [],
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applykit_documents = pgTable("applykit_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applykit_applications.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  docType: text("doc_type").notNull(),
  contentMd: text("content_md").default(""),
  contentJson: jsonb("content_json").default({}),
  pdfUrl: text("pdf_url"),
  docxUrl: text("docx_url"),
  relevanceSummary: text("relevance_summary"),
  tokensUsed: integer("tokens_used").default(0),
  model: text("model").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applykit_usage = pgTable("applykit_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  applicationsGenerated: integer("applications_generated").notNull().default(0),
  regenerations: integer("regenerations").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applykit_templates = pgTable("applykit_templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  config: jsonb("config").default({}),
  isActive: boolean("is_active").notNull().default(true),
});

export const applykit_admins = pgTable("applykit_admins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by"),
});

export const applykit_user_flags = pgTable("applykit_user_flags", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  isBanned: boolean("is_banned").notNull().default(false),
  banReason: text("ban_reason"),
  bannedAt: timestamp("banned_at"),
  bannedBy: varchar("banned_by"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const applykit_user_overrides = pgTable("applykit_user_overrides", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  extraApplications: integer("extra_applications").notNull().default(0),
  extraRegenerations: integer("extra_regenerations").notNull().default(0),
  forceUnlimited: boolean("force_unlimited").notNull().default(false),
  overrideExpiresAt: timestamp("override_expires_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

export const applykit_events = pgTable("applykit_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  eventType: text("event_type").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(applykit_profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applykit_applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(applykit_documents).omit({
  id: true,
  createdAt: true,
});

export const insertJobAnalysisSchema = createInsertSchema(applykit_job_analysis).omit({
  id: true,
  createdAt: true,
});

export type Profile = typeof applykit_profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Application = typeof applykit_applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type AppDocument = typeof applykit_documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type JobAnalysis = typeof applykit_job_analysis.$inferSelect;
export type InsertJobAnalysis = z.infer<typeof insertJobAnalysisSchema>;
export type Usage = typeof applykit_usage.$inferSelect;
export type Template = typeof applykit_templates.$inferSelect;
export type Admin = typeof applykit_admins.$inferSelect;
export type UserFlag = typeof applykit_user_flags.$inferSelect;
export type UserOverride = typeof applykit_user_overrides.$inferSelect;
export type AppEvent = typeof applykit_events.$inferSelect;
