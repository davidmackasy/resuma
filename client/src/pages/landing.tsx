import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText, Sparkles, Download, ArrowRight, Zap, Shield, Target,
  CheckCircle2, Star, Clock, Users, TrendingUp, Mail, MessageSquare,
  ChevronRight, BookOpen, Brain, BarChart3
} from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Tailored Resume",
    desc: "Your resume rewritten for each job, emphasizing the most relevant skills and experience.",
    badge: "ATS optimized",
  },
  {
    icon: MessageSquare,
    title: "Cover Letter",
    desc: "A compelling, personalized cover letter that speaks directly to the job requirements.",
    badge: "Job-specific",
  },
  {
    icon: Mail,
    title: "Follow-up Email",
    desc: "A professional follow-up email ready to send after your application.",
    badge: "Ready to send",
  },
  {
    icon: BookOpen,
    title: "Interview Prep",
    desc: "Seven likely interview questions with model answers tailored to the role.",
    badge: "AI-generated",
  },
  {
    icon: Target,
    title: "ATS Fit Report",
    desc: "See exactly how well your profile matches the job before you generate documents.",
    badge: "Gap analysis",
  },
  {
    icon: TrendingUp,
    title: "Smart Gap Fixer",
    desc: "AI identifies missing skills and suggests how to bridge them ethically.",
    badge: "Career boost",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Build your profile",
    desc: "Enter your experience, skills, and education once. Resuma keeps everything structured and ready.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Paste the job description",
    desc: "Copy any job posting. Our AI extracts key requirements, scores your fit, and identifies gaps.",
    icon: Target,
  },
  {
    step: "03",
    title: "Review your ATS report",
    desc: "See your match score, matched skills, missing skills, and risk flags before committing.",
    icon: Shield,
  },
  {
    step: "04",
    title: "Download your package",
    desc: "Get a tailored resume, cover letter, follow-up email, and interview prep in seconds.",
    icon: Download,
  },
];

const TESTIMONIALS = [
  {
    name: "Priya K.",
    role: "Software Engineer",
    quote: "I went from getting zero callbacks to three interviews in two weeks. The tailored resumes are night and day.",
    stars: 5,
  },
  {
    name: "Marcus D.",
    role: "Product Manager",
    quote: "The ATS fit report alone is worth it. I finally understood why my applications weren't landing.",
    stars: 5,
  },
  {
    name: "Aisha T.",
    role: "Marketing Lead",
    quote: "Getting a tailored cover letter and follow-up email in the same pass saves me hours per application.",
    stars: 5,
  },
];

function ProductMockup() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto">
      {/* Glow / gradient backdrop */}
      <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-violet-500/10 blur-2xl pointer-events-none" />

      {/* Main document card */}
      <div className="relative bg-white dark:bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden">
        {/* Document header */}
        <div className="bg-muted/40 px-5 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Alex Johnson</p>
                <p className="text-[10px] text-muted-foreground">Senior Product Designer</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-primary/15 text-primary px-2 py-1 rounded-full">92% ATS fit</span>
          </div>
        </div>

        {/* Resume content simulation */}
        <div className="px-5 py-4 space-y-3">
          {/* Summary block */}
          <div>
            <div className="h-2 bg-foreground/80 rounded w-16 mb-2" />
            <div className="space-y-1">
              <div className="h-1.5 bg-muted-foreground/20 rounded w-full" />
              <div className="h-1.5 bg-muted-foreground/20 rounded w-5/6" />
              <div className="h-1.5 bg-muted-foreground/20 rounded w-4/6" />
            </div>
          </div>

          {/* Experience block */}
          <div>
            <div className="h-2 bg-foreground/80 rounded w-20 mb-2" />
            <div className="space-y-2">
              {[
                { role: "Lead Designer", co: "Acme Corp", w: "3/4" },
                { role: "UX Designer", co: "Startup XYZ", w: "2/3" },
              ].map((job) => (
                <div key={job.role} className="pl-2 border-l-2 border-primary/40 space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="h-1.5 bg-foreground/40 rounded w-24" />
                    <div className="h-1 bg-muted-foreground/20 rounded w-14" />
                  </div>
                  <div className="h-1.5 bg-muted-foreground/20 rounded w-20" />
                  <div className="h-1 bg-muted-foreground/15 rounded w-5/6" />
                  <div className="h-1 bg-muted-foreground/15 rounded w-4/6" />
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="h-2 bg-foreground/80 rounded w-12 mb-2" />
            <div className="flex flex-wrap gap-1">
              {["Figma", "Research", "Prototyping", "Design Systems", "Stakeholder Mgmt"].map((s) => (
                <span key={s} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Assistant overlay */}
        <div className="border-t border-border/50 bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Brain className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-bold text-foreground">AI ASSISTANT</span>
          </div>
          <div className="space-y-1.5">
            {[
              { icon: "✦", label: "Generate skills from job" },
              { icon: "↗", label: "Tailor for this role" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                <span className="text-primary font-bold">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating document badges */}
      <div className="absolute -left-6 top-1/3 bg-white dark:bg-card border border-border rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 animate-none">
        <div className="w-6 h-6 rounded-md bg-green-500/15 flex items-center justify-center">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-foreground leading-none">Cover Letter</p>
          <p className="text-[9px] text-muted-foreground">Generated ✓</p>
        </div>
      </div>

      <div className="absolute -right-4 bottom-1/4 bg-white dark:bg-card border border-border rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-violet-500/15 flex items-center justify-center">
          <BookOpen className="h-3.5 w-3.5 text-violet-600" />
        </div>
        <div>
          <p className="text-[9px] font-bold text-foreground leading-none">Interview Prep</p>
          <p className="text-[9px] text-muted-foreground">7 questions ready</p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight" data-testid="text-brand-name">Resuma</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>

          <div className="flex items-center gap-2">
            <a href="/login?mode=login">
              <Button variant="ghost" size="sm" data-testid="button-login" className="font-medium">
                Sign in
              </Button>
            </a>
            <a href="/login?mode=signup">
              <Button size="sm" data-testid="button-get-started" className="font-semibold">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/5 via-transparent to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-8">
              <div className="space-y-5">
                <h1
                  className="text-[2.6rem] sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1] text-foreground"
                  data-testid="text-hero-title"
                >
                  Land more interviews with{" "}
                  <span className="text-primary">AI-tailored applications</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-[500px]">
                  ATS scoring, resume tailoring, cover letter, follow-up email, and interview prep — all generated from one job paste.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <a href="/login?mode=signup">
                  <Button size="lg" className="font-semibold px-7 h-12 text-[15px] w-full sm:w-auto" data-testid="button-hero-cta">
                    Build Your Application
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" className="h-12 text-[15px] font-medium w-full sm:w-auto" data-testid="button-hero-learn">
                    See how it works
                  </Button>
                </a>
              </div>

              {/* Inline social proof — Enhancv style */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">4.9 · <strong className="text-foreground">500+ reviews</strong></span>
                </div>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span><strong className="text-foreground">2,400+</strong> applications tailored this month</span>
                </div>
              </div>

              {/* Feature bullets */}
              <div className="flex flex-col gap-2 pt-1">
                {[
                  "Tailored resume, cover letter & follow-up email in one click",
                  "ATS fit score so you know your chances before applying",
                  "Interview questions and model answers specific to the role",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product mockup */}
            <div className="hidden lg:flex justify-end">
              <ProductMockup />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 border-t border-border/60 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight" data-testid="text-features-title">
              From job post to full package in 4 steps
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">
              No templates to fill out. No generic outputs. Just your profile matched to each job.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%+0px)] w-full h-px border-t-2 border-dashed border-primary/20 z-0" />
                )}
                <div className="bg-background border border-border rounded-xl p-5 h-full relative z-10 hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="h-[18px] w-[18px] text-primary" />
                    </div>
                    <span className="text-xs font-bold font-mono text-primary/60">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Everything included</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              One paste. Four documents.
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-base">
              Everything you need to stand out at every stage of your application process.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group flex items-start gap-4 p-5 bg-background border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {feature.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-28 px-4 sm:px-6 border-y border-border/60 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3">Real results</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              Job seekers who got interviews
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-background border border-border rounded-xl p-5 space-y-4 hover:border-primary/20 hover:shadow-sm transition-all">
                <div className="flex">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            Start today
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to land more interviews?
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Stop sending generic applications. Start sending ones that are built for each job.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a href="/login?mode=signup">
              <Button size="lg" className="font-semibold px-8 h-12 text-[15px]" data-testid="button-final-cta">
                Get started — $9.99/mo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="/login?mode=login">
              <Button variant="outline" size="lg" className="h-12 text-[15px] font-medium">
                Sign in to your account
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Cancel anytime · Secure payments via Stripe · ATS-safe output guaranteed
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold">Resuma</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="/login?mode=signup" className="hover:text-foreground transition-colors">Get started</a>
            <a href="/login?mode=login" className="hover:text-foreground transition-colors">Sign in</a>
            <span>© {new Date().getFullYear()} Resuma. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
