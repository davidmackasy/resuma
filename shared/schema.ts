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

export const applykit_documents = pgTable("applykit_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applykit_applications.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  docType: text("doc_type").notNull(),
  contentMd: text("content_md").default(""),
  contentJson: jsonb("content_json").default({}),
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

export type Profile = typeof applykit_profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Application = typeof applykit_applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type AppDocument = typeof applykit_documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Usage = typeof applykit_usage.$inferSelect;
export type Template = typeof applykit_templates.$inferSelect;
