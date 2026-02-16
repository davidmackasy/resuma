# Resuma - Premium Resume Tailor Web App

## Overview
Resuma lets users upload their master resume/profile once, paste any job description, and automatically generate four tailored documents (resume, cover letter, follow-up email, practice questions) using AI. Built with React + Express + PostgreSQL.

## Recent Changes
- 2026-02-16: Practice Questions (4th Output Tab)
  - Auto-generates 7 interview practice questions with best answers after document generation
  - Uses generated resume + job description as input to isolated GPT prompt
  - Stored in practiceContent JSON column on applykit_applications table
  - Practice tab in application-detail.tsx with collapsible Q&A cards
  - Generates on: initial generate, regenerate all, and single resume regeneration
  - Wrapped in try/catch — practice failure never blocks document generation
  - No changes to existing prompts, credit logic, or authentication
- 2026-02-16: Stripe Subscription Integration ($9.99/month) — Isolated Stripe Account
  - Uses dedicated Resuma Stripe account (NOT Replit connector)
  - Environment secrets: RESUME_STRIPE_SECRET_KEY, RESUME_STRIPE_PUBLISHABLE_KEY, RESUME_STRIPE_WEBHOOK_SECRET, RESUME_STRIPE_PRICE_ID
  - stripeClient.ts: Simple Stripe SDK initialization from env vars, no stripe-replit-sync
  - Webhook endpoint: /api/stripe/webhook with signature verification via RESUME_STRIPE_WEBHOOK_SECRET
  - Added stripe_customer_id, stripe_subscription_id, subscription_status columns to users table
  - Subscription middleware: requireSubscription checks admin status first, then subscription_status (active/trialing)
  - Protected routes: POST /api/applykit/applications, /generate, /regenerate
  - Stripe routes: POST /create-checkout (uses RESUME_STRIPE_PRICE_ID), POST /create-portal, GET /subscription, POST /sync-subscription
  - WebhookHandlers: Verified events only — handles subscription.*, invoice.paid (resets usage), checkout.session.completed
  - Frontend: SubscriptionGate in App.tsx redirects unsubscribed users to /subscribe page
  - subscribe.tsx: Premium subscribe page with feature list and $9.99/month CTA
  - settings.tsx: Shows subscription status, billing date, "Manage Billing" button linking to Stripe Customer Portal
  - use-subscription.ts hook: Queries /api/applykit/subscription for hasAccess, isAdmin, subscriptionStatus
  - Admin bypass: Admins get hasAccess=true automatically, skip all subscription checks
  - Usage limits: 30 applications and 30 regenerations per month
- 2026-02-13: Mobile Native UI
  - Added fixed bottom tab bar for mobile (≤767px) with 5 tabs: Home, New, History, Profile, Settings
  - Created MobileBottomNav component and MobileShell layout in App.tsx
  - Desktop layout completely unchanged (sidebar preserved)
  - useIsMobile hook initializes synchronously to prevent layout flash
  - Safe area support for iOS notch/home indicator
  - Auto-admin bootstrap: OWNER_EMAILS checked on Google login to auto-create admin records
- 2026-02-13: Dev-Only Email/Password Login
  - Added passwordHash and authProvider columns to users table
  - Dev routes (POST /api/auth/dev/register, POST /api/auth/dev/login) only registered when NODE_ENV !== "production"
  - GET /api/auth/dev-status returns { isDev } for frontend conditional rendering
  - Login page shows email/password form + toggle between signup/login in dev mode
  - Passwords hashed with bcrypt (12 rounds), passwordHash stripped from all API responses
  - Production: only Google OAuth, dev routes not registered, complete isolation
- 2026-02-13: Admin Portal
  - 4 new tables: applykit_admins, applykit_user_flags, applykit_user_overrides, applykit_events
  - Admin middleware (isAdminMiddleware) protects /api/applykit/admin/* routes
  - Ban enforcement: banned users blocked from POST/PUT on applications/documents
  - Usage limit bypass: admins + forceUnlimited users skip 15/month caps
  - Event tracking on analysis, generate, regenerate actions
  - Frontend: dashboard with Recharts metrics, users list with search/pagination, user detail with ban/override controls, admin management page
  - Admin routes: GET /admin/me, /admin/metrics, /admin/users, /admin/admins, POST ban/unban/override
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
    admin-dashboard.tsx    - Admin metrics dashboard with Recharts
    admin-users.tsx        - Admin user list with search/pagination
    admin-user-detail.tsx  - User detail with ban/override controls
    admin-admins.tsx       - Admin management page
  components/
    app-sidebar.tsx        - Navigation sidebar using shadcn sidebar (conditional admin link)
    theme-toggle.tsx       - Dark/light mode toggle
  hooks/
    use-admin.ts           - Admin status hook (queries /admin/me)

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
- `applykit_admins` - Admin user records (userId, email, role: owner/admin/support, isActive)
- `applykit_user_flags` - User flags (isBanned, banReason)
- `applykit_user_overrides` - Usage limit overrides (extraApplications, extraRegenerations, forceUnlimited)
- `applykit_events` - Event tracking for admin metrics (eventType, userId, metadata)

## User Preferences
- Monthly quota: 30 applications, 30 regenerations
- Skip PDF rendering for MVP - markdown preview with copy-to-clipboard
- Manual profile entry (no file upload parsing)
- ATS-safe output with strict rules against fabrication
