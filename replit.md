# ApplyKit - Premium Resume Tailor Web App

## Overview
ApplyKit lets users upload their master resume/profile once, paste any job description, and automatically generate three tailored documents (resume, cover letter, follow-up email) using AI. Built with React + Express + PostgreSQL.

## Recent Changes
- 2026-02-13: Replaced Replit Auth with Google OAuth
  - Swapped Passport.js strategy from Replit OIDC to passport-google-oauth20
  - Kept session infrastructure (express-session + PostgreSQL store)
  - Removed openid-client and memoizee dependencies
  - Auth routes preserved: /api/login, /api/callback, /api/logout, /api/auth/user
  - User session maintains claims.sub pattern for backward compatibility
  - Secrets needed: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET
- 2026-02-13: ATS Fit Report with Gap Fixer
  - 3-stage AI pipeline: job extraction → fit scoring → document generation from analysis
  - New applykit_job_analysis table storing fitScore, matchedSkills, missingSkills, riskFlags, transferableAngle, suggestedAdditions, jobExtraction
  - Application flow: draft → analyzed → generated (user reviews ATS report before generating)
  - fit-report.tsx: ATS score display, matched/missing skills, risk flags, transferable angle, toggleable bullet improvements
  - POST /applications creates app + runs analysis; POST /applications/:id/generate creates docs with selected improvements
  - Profile protection: AI never modifies master profile, all tailoring applies to output only
- 2026-02-12: Added Professional Resume Export Integration
  - PDF export via pdfkit, DOCX export via docx package
  - Structured JSON output from AI generation (ResumeJson, CoverLetterJson, EmailJson)
  - Intelligent job relevance filtering in generation prompts
  - Per-document regeneration with confirmation dialogs
  - Document inline editing (markdown) and save
  - Styled resume/cover letter/email preview using contentJson
  - Download buttons (PDF/DOCX) on resume and cover letter tabs
- 2026-02-12: Initial build - full frontend and backend, auth integration, AI generation pipeline, database schema

## Architecture
- **Frontend**: React + Vite, wouter routing, TanStack Query, shadcn/ui components, Tailwind CSS
- **Backend**: Express.js with session-based auth (Google OAuth via Passport.js), RESTful API
- **Database**: PostgreSQL via Drizzle ORM
- **AI**: OpenAI (via Replit AI Integrations) for document generation using gpt-5-mini

## Project Structure
```
client/src/
  App.tsx                  - Root router (Landing vs AppShell based on auth)
  pages/
    landing.tsx            - Public landing page
    dashboard.tsx          - User dashboard with usage stats
    profile.tsx            - Profile editor (experience, skills, education)
    new-application.tsx    - Job description input + "Analyze Job Fit" form
    fit-report.tsx         - ATS fit report with score, skills, risk flags, toggleable improvements
    applications.tsx       - Application history list (links analyzed apps to fit report)
    application-detail.tsx - Document preview with tabs (resume/cover letter/email)
    settings.tsx           - Account settings & danger zone
  components/
    app-sidebar.tsx        - Navigation sidebar using shadcn sidebar
    theme-toggle.tsx       - Dark/light mode toggle

server/
  routes.ts               - All API endpoints under /api/applykit/*
  storage.ts              - Database CRUD via Drizzle ORM
  generation.ts           - OpenAI document generation pipeline
  replit_integrations/    - Auth and AI integration modules

shared/
  schema.ts               - Drizzle schema + Zod types for all tables
```

## Key API Routes
- `GET/PUT /api/applykit/profile` - User profile CRUD
- `GET/POST /api/applykit/applications` - Application list/create (POST also runs job analysis)
- `GET /api/applykit/applications/:id` - Single application
- `GET /api/applykit/applications/:id/analysis` - Job fit analysis for application
- `POST /api/applykit/applications/:id/generate` - Generate documents from analysis with selected improvements
- `GET /api/applykit/applications/:id/documents` - Documents for application
- `POST /api/applykit/applications/:id/regenerate` - Regenerate all or single doc (optional docType body param)
- `PUT /api/applykit/documents/:docId` - Update document content (contentMd, contentJson)
- `GET /api/applykit/documents/:docId/export?format=pdf|docx` - Download PDF/DOCX
- `GET /api/applykit/usage` - Monthly usage stats
- `DELETE /api/applykit/data` - Delete all user data
- `GET /api/applykit/templates` - List resume templates

## Database Tables
- `applykit_profiles` - User resume data (JSON fields for experience, skills, etc.)
- `applykit_applications` - Job applications with job description, settings (status: draft → analyzed → generated)
- `applykit_job_analysis` - ATS fit analysis (fitScore, matchedSkills, missingSkills, riskFlags, transferableAngle, suggestedAdditions, jobExtraction)
- `applykit_documents` - Generated documents (resume, cover_letter, followup_email) with relevanceSummary
- `applykit_usage` - Monthly usage tracking (15 apps, 15 regenerations)
- `applykit_templates` - Resume template configurations

## User Preferences
- Monthly quota: 15 applications, 15 regenerations
- Skip PDF rendering for MVP - markdown preview with copy-to-clipboard
- Manual profile entry (no file upload parsing)
- ATS-safe output with strict rules against fabrication
