import { Button } from "@/components/ui/button";
import {
  FileText, Sparkles, Download, ArrowRight, Zap, Shield, Target,
  CheckCircle2, Star, Users, TrendingUp, Mail, MessageSquare,
  BookOpen, Brain, BarChart3
} from "lucide-react";

const SHOWCASE_CARDS = [
  {
    icon: FileText,
    color: "bg-primary/15",
    iconColor: "text-primary",
    title: "Tailored Resume",
    badge: "ATS optimized",
    desc: "Resume rewritten for the role you want, emphasizing exactly the right skills.",
    lines: [3, 4, 2],
  },
  {
    icon: MessageSquare,
    color: "bg-blue-500/10",
    iconColor: "text-blue-600",
    title: "Cover Letter",
    badge: "Job-specific",
    desc: "Personalized to match the job requirements and company voice.",
    lines: [3, 3, 2],
  },
  {
    icon: Mail,
    color: "bg-orange-500/10",
    iconColor: "text-orange-600",
    title: "Follow-up Email",
    badge: "Ready to send",
    desc: "A professional follow-up ready to send the day after your application.",
    lines: [2, 3, 1],
  },
  {
    icon: BookOpen,
    color: "bg-violet-500/10",
    iconColor: "text-violet-600",
    title: "Interview Prep",
    badge: "7 questions",
    desc: "Likely interview questions with model answers specific to the role.",
    lines: [2, 4, 2],
  },
  {
    icon: Target,
    color: "bg-rose-500/10",
    iconColor: "text-rose-600",
    title: "ATS Fit Report",
    badge: "Gap analysis",
    desc: "See your match score, missing skills, and risk flags before you apply.",
    lines: [3, 3, 2],
  },
  {
    icon: TrendingUp,
    color: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    title: "Smart Gap Fixer",
    badge: "Career boost",
    desc: "AI bridges skill gaps ethically so your application always reads stronger.",
    lines: [2, 3, 2],
  },
];

function MacFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border/70 shadow-xl overflow-hidden bg-white dark:bg-card ${className}`}>
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/60 border-b border-border/60">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 h-5 bg-muted dark:bg-muted/50 rounded-md max-w-[220px] mx-auto" />
      </div>
      {children}
    </div>
  );
}

function ProductMockup() {
  return (
    <MacFrame className="w-full max-w-[440px] mx-auto lg:mx-0 lg:ml-auto">
      {/* Document header */}
      <div className="bg-muted/30 px-5 py-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground leading-none mb-1">Alex Johnson</p>
              <p className="text-[10px] text-muted-foreground">Senior Product Designer</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-primary/15 text-primary px-2 py-1 rounded-full whitespace-nowrap">92% ATS fit</span>
        </div>
      </div>

      {/* Simulated resume content */}
      <div className="px-5 py-4 space-y-4">
        <div>
          <div className="h-[7px] bg-foreground/75 rounded w-14 mb-2.5" />
          <div className="space-y-1.5">
            <div className="h-1.5 bg-muted-foreground/25 rounded w-full" />
            <div className="h-1.5 bg-muted-foreground/25 rounded w-11/12" />
            <div className="h-1.5 bg-muted-foreground/25 rounded w-3/4" />
          </div>
        </div>

        <div>
          <div className="h-[7px] bg-foreground/75 rounded w-20 mb-2.5" />
          <div className="space-y-2.5">
            {[
              { t: "Lead Product Designer", c: "Acme Corp" },
              { t: "UX Designer", c: "Startup Inc." },
            ].map((job) => (
              <div key={job.t} className="pl-2.5 border-l-2 border-primary/40 space-y-1">
                <div className="flex justify-between">
                  <div className="h-[7px] bg-foreground/40 rounded w-28" />
                  <div className="h-[6px] bg-muted-foreground/20 rounded w-16" />
                </div>
                <div className="h-[6px] bg-muted-foreground/20 rounded w-20" />
                <div className="h-[5px] bg-muted-foreground/15 rounded w-full" />
                <div className="h-[5px] bg-muted-foreground/15 rounded w-5/6" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="h-[7px] bg-foreground/75 rounded w-12 mb-2.5" />
          <div className="flex flex-wrap gap-1.5">
            {["Figma", "Research", "Prototyping", "Design Systems", "Stakeholder Mgmt"].map((s) => (
              <span key={s} className="text-[9px] bg-primary/12 text-primary px-2 py-0.5 rounded font-semibold">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* AI panel */}
      <div className="border-t border-border/40 bg-muted/20 px-5 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Brain className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-[9px] font-bold tracking-wide text-foreground">AI ASSISTANT</span>
        </div>
        <div className="space-y-1.5">
          {[
            { sym: "✦", label: "Generate skills from job" },
            { sym: "↗", label: "Tailor for this role" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="text-primary font-bold text-[11px]">{item.sym}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </MacFrame>
  );
}

function ShowcaseCard({ card }: { card: typeof SHOWCASE_CARDS[0] }) {
  const Icon = card.icon;
  return (
    <div className="w-56 shrink-0 bg-white dark:bg-card border border-border/70 rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${card.iconColor} h-[18px] w-[18px]`} />
        </div>
        <span className="text-[9px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0 mt-0.5">
          {card.badge}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground mb-1">{card.title}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{card.desc}</p>
      </div>
      <div className="space-y-1.5 mt-auto pt-1">
        {card.lines.map((w, i) => (
          <div
            key={i}
            className="h-1 bg-muted-foreground/15 rounded"
            style={{ width: `${w * 25}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-lg border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-15 flex items-center justify-between gap-4" style={{ height: 60 }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-base tracking-tight" data-testid="text-brand-name">Resuma</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#showcase" className="hover:text-foreground transition-colors duration-150">How it works</a>
            <a href="#features" className="hover:text-foreground transition-colors duration-150">Features</a>
            <a href="#reviews" className="hover:text-foreground transition-colors duration-150">Reviews</a>
          </div>

          <div className="flex items-center gap-2">
            <a href="/login?mode=login">
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-login"
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Button>
            </a>
            <a href="/login?mode=signup">
              <Button size="sm" data-testid="button-get-started" className="font-semibold px-4">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 px-5 sm:px-6 overflow-hidden">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[600px] bg-gradient-to-bl from-primary/10 via-primary/4 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] bg-gradient-to-tr from-violet-500/6 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div className="space-y-7 max-w-[540px]">
              <div className="space-y-4">
                <h1
                  className="text-[2.1rem] sm:text-[2.6rem] lg:text-[3rem] font-bold tracking-tight leading-[1.14] text-foreground"
                  data-testid="text-hero-title"
                >
                  <span className="block">Land more interviews</span>
                  <span className="block">with a <span className="text-primary">smarter resume builder</span></span>
                </h1>
                <p className="text-muted-foreground text-base sm:text-[17px] leading-relaxed max-w-[460px]">
                  Create tailored resumes, cover letters, follow-up emails, and interview prep from one job description.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <a href="/login?mode=signup">
                  <Button
                    size="lg"
                    className="font-semibold px-6 h-11 text-sm w-full sm:w-auto"
                    data-testid="button-hero-cta"
                  >
                    Build Your Resume
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="#showcase">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 text-sm font-medium w-full sm:w-auto border-border/80 hover:bg-muted/50"
                    data-testid="button-hero-learn"
                  >
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Trust row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 pt-1">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    4.9 · <strong className="text-foreground font-semibold">500+ reviews</strong>
                  </span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-border" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span><strong className="text-foreground font-semibold">2,400+</strong> applications tailored this month</span>
                </div>
              </div>

              {/* Benefit bullets */}
              <div className="flex flex-col gap-2">
                {[
                  "Tailored resume, cover letter & follow-up in one click",
                  "ATS fit score so you know your chances before applying",
                  "Interview questions & model answers specific to each role",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Product mockup in Mac frame */}
            <div className="hidden lg:flex justify-end items-center relative">
              {/* Soft glow */}
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/12 via-primary/4 to-violet-500/8 rounded-3xl blur-2xl pointer-events-none" />
              <div className="relative">
                <ProductMockup />
                {/* Floating badge: Cover Letter */}
                <div className="absolute -left-8 top-1/3 bg-white dark:bg-card border border-border/80 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-foreground leading-none">Cover Letter</p>
                    <p className="text-[9px] text-muted-foreground">Generated ✓</p>
                  </div>
                </div>
                {/* Floating badge: Interview Prep */}
                <div className="absolute -right-6 bottom-1/4 bg-white dark:bg-card border border-border/80 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-violet-500/15 flex items-center justify-center">
                    <BookOpen className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-foreground leading-none">Interview Prep</p>
                    <p className="text-[9px] text-muted-foreground">7 questions ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Showcase (animated marquee in Mac frame) ── */}
      <section id="showcase" className="py-20 sm:py-24 px-5 sm:px-6 border-t border-border/60 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
              Everything included
            </span>
            <h2 className="text-3xl sm:text-[2.2rem] font-bold mb-3 tracking-tight">
              Your full application package, built for you
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-[15px]">
              Generate polished application materials from a single job description.
            </p>
          </div>

          {/* Mac browser frame wrapping the sliding track */}
          <MacFrame>
            <div className="relative overflow-hidden py-6 bg-muted/10">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-muted/10 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-muted/10 to-transparent z-10 pointer-events-none" />

              {/* Sliding track — duplicated for seamless loop */}
              <div className="flex gap-4 w-max marquee-track px-4">
                {[...SHOWCASE_CARDS, ...SHOWCASE_CARDS].map((card, i) => (
                  <ShowcaseCard key={i} card={card} />
                ))}
              </div>
            </div>
          </MacFrame>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="reviews" className="py-20 sm:py-24 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
              Real results
            </span>
            <h2 className="text-3xl sm:text-[2.2rem] font-bold mb-3 tracking-tight">
              Job seekers who got interviews
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
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
            ].map((t) => (
              <div
                key={t.name}
                className="bg-background border border-border/70 rounded-xl p-5 space-y-4 hover:border-primary/25 hover:shadow-sm transition-all"
              >
                <div className="flex">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-2.5 pt-1 border-t border-border/50">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
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

      {/* ── Final CTA ── */}
      <section className="py-20 sm:py-24 px-5 sm:px-6 border-t border-border/60 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/12 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            Start today
          </div>
          <h2 className="text-3xl sm:text-[2.2rem] font-bold tracking-tight leading-tight">
            Ready to land more interviews?
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-sm mx-auto">
            Stop sending generic applications. Start sending ones built for each job.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <a href="/login?mode=signup">
              <Button size="lg" className="font-semibold px-8 h-11 text-sm" data-testid="button-final-cta">
                Get started — $9.99/mo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="/login?mode=login">
              <Button variant="outline" size="lg" className="h-11 text-sm font-medium border-border/80">
                Sign in
              </Button>
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Cancel anytime · Secure payments via Stripe · ATS-safe output guaranteed
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/60 py-7 px-5 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold">Resuma</span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            <a href="#showcase" className="hover:text-foreground transition-colors">Features</a>
            <a href="#reviews" className="hover:text-foreground transition-colors">Reviews</a>
            <a href="/login?mode=signup" className="hover:text-foreground transition-colors">Get started</a>
            <a href="/login?mode=login" className="hover:text-foreground transition-colors">Sign in</a>
            <span>© {new Date().getFullYear()} Resuma</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
