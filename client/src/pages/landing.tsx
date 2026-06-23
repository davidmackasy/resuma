import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Target,
  CheckCircle2,
  Star,
  Users,
  Brain,
  Kanban,
  LayoutTemplate,
  Database,
  MessageSquare,
  Clock,
  BarChart3,
  Zap,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("landing-reveal", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function MacFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 shadow-elevation overflow-hidden bg-card",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b border-border/60">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 h-5 bg-muted/60 rounded-md max-w-[200px] mx-auto" />
      </div>
      {children}
    </div>
  );
}

function BuilderMockup() {
  return (
    <MacFrame className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] min-h-[200px] sm:min-h-[280px] text-[10px] sm:text-[10px]">
        <div className="border-b sm:border-b-0 sm:border-r border-border/60 bg-muted/20 p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="h-3 w-3 text-primary" />
            <span className="font-bold tracking-wide text-foreground">AI Assistant</span>
            <span className="ml-auto text-[8px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">
              GPT-5.5
            </span>
          </div>
          <div className="rounded-lg bg-card border border-border/50 p-2 text-muted-foreground leading-relaxed">
            Make my summary more impactful for this product role…
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-2 text-foreground/90 leading-relaxed">
            <span className="text-primary font-bold">✦</span> Updated your summary and
            highlighted product metrics in your top two bullets.
          </div>
          <div className="mt-auto flex gap-1">
            <div className="h-6 flex-1 rounded-md bg-muted/50 border border-border/40" />
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
        </div>
        <div className="p-3 space-y-3 bg-background/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-2 w-24 bg-foreground/70 rounded mb-1" />
              <div className="h-1.5 w-32 bg-muted-foreground/30 rounded" />
            </div>
            <span className="text-[8px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full">
              92% ATS
            </span>
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-2 section-edit-flash">
            <div className="h-1.5 w-14 bg-foreground/50 rounded mb-1.5" />
            <div className="space-y-1">
              <div className="h-1 bg-muted-foreground/25 rounded w-full" />
              <div className="h-1 bg-muted-foreground/25 rounded w-11/12" />
            </div>
          </div>
          <div>
            <div className="h-1.5 w-16 bg-foreground/50 rounded mb-1.5" />
            <div className="pl-2 border-l-2 border-primary/40 space-y-1">
              <div className="h-1 bg-muted-foreground/20 rounded w-3/4" />
              <div className="h-1 bg-muted-foreground/20 rounded w-full" />
              <div className="h-1 bg-muted-foreground/20 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </MacFrame>
  );
}

function TrackerMockup() {
  const rows = [
    { company: "Stripe", role: "Product Designer", score: 94, status: "Interview" },
    { company: "Notion", role: "Senior UX", score: 88, status: "Applied" },
    { company: "Linear", role: "Design Lead", score: 91, status: "Draft" },
  ];
  return (
    <MacFrame className="w-full">
      <div className="p-4 space-y-3 bg-background/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Application Tracker</span>
          <span className="text-[9px] text-muted-foreground">3 active</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.company}
            className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/80 px-3 py-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
              {row.company[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-foreground truncate">{row.role}</p>
              <p className="text-[9px] text-muted-foreground">{row.company}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold text-primary">{row.score}%</p>
              <p className="text-[8px] text-muted-foreground">{row.status}</p>
            </div>
          </div>
        ))}
      </div>
    </MacFrame>
  );
}

function CareerMockup() {
  return (
    <MacFrame className="w-full">
      <div className="p-4 grid grid-cols-2 gap-3 bg-background/50">
        <div className="rounded-lg border border-border/60 bg-card/80 p-3 space-y-2">
          <LayoutTemplate className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-bold text-foreground">Modern Pro</p>
          <div className="space-y-1">
            <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            <div className="h-1 bg-muted-foreground/20 rounded w-4/5" />
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/80 p-3 space-y-2">
          <Database className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-bold text-foreground">Career DB</p>
          <div className="space-y-1">
            <div className="h-1 bg-muted-foreground/20 rounded w-full" />
            <div className="h-1 bg-muted-foreground/20 rounded w-3/5" />
          </div>
        </div>
        <div className="col-span-2 rounded-lg border border-primary/25 bg-primary/5 p-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-foreground">Cover Letter</p>
            <p className="text-[9px] text-muted-foreground">Tailored to Stripe — Product Designer</p>
          </div>
        </div>
      </div>
    </MacFrame>
  );
}

const TRUST_CHIPS = [
  "No credit card",
  "ATS-optimized",
  "AI-powered",
  "Cancel anytime",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Build your career database once",
    desc: "Upload your resume or enter experience once. Resuma remembers everything for every application.",
    icon: Database,
  },
  {
    step: "02",
    title: "Paste a job description",
    desc: "Drop in the role you're targeting. We extract requirements and score your fit instantly.",
    icon: Target,
  },
  {
    step: "03",
    title: "Generate & refine live",
    desc: "Watch your tailored resume write itself, then chat with AI to polish every section in real time.",
    icon: Sparkles,
  },
];

const FEATURE_SECTIONS = [
  {
    id: "features",
    badge: "Hero feature",
    title: "Real-time AI generation & chat-edit",
    desc: "Paste a job description and watch your resume update live. Chat to rewrite bullets, add keywords, or tailor your summary — the preview changes as the AI streams.",
    bullets: [
      "Split-pane builder: AI chat + live preview",
      "Section highlights show exactly what changed",
      "GPT-5.5 powered with model selector",
    ],
    Mockup: BuilderMockup,
    reverse: false,
  },
  {
    id: "features-tracker",
    badge: "Track & analyze",
    title: "Application Tracker + Analytics",
    desc: "Every application in one place with ATS fit scores, matched skills, and gap analysis before you hit send.",
    bullets: [
      "Kanban-style application pipeline",
      "Pre-apply fit report with risk flags",
      "Matched skills & missing keywords",
    ],
    Mockup: TrackerMockup,
    reverse: true,
  },
  {
    id: "templates",
    badge: "Full package",
    title: "Templates, Career Database & Cover Letters",
    desc: "One career profile powers every application. Generate cover letters, follow-ups, and interview prep from the same job description.",
    bullets: [
      "Premium resume templates",
      "Reusable career database",
      "Cover letter & follow-up generation",
    ],
    Mockup: CareerMockup,
    reverse: false,
  },
];

const VALUE_PROPS = [
  {
    icon: Clock,
    title: "Save hours per application",
    desc: "Stop rewriting from scratch. One job description → tailored resume, cover letter, and follow-up.",
  },
  {
    icon: BarChart3,
    title: "Higher ATS pass rate",
    desc: "Fit scores and keyword alignment help you apply with confidence — not guesswork.",
  },
  {
    icon: Shield,
    title: "Premium, ATS-safe output",
    desc: "Clean formatting recruiters and parsers love. No gimmicks, no fabricated experience.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya K.",
    role: "Software Engineer",
    quote:
      "I went from zero callbacks to three interviews in two weeks. The live AI editing is a game changer.",
    stars: 5,
  },
  {
    name: "Marcus D.",
    role: "Product Manager",
    quote:
      "The ATS fit report alone is worth it. I finally understood why my applications weren't landing.",
    stars: 5,
  },
  {
    name: "Aisha T.",
    role: "Marketing Lead",
    quote:
      "Getting a tailored cover letter and follow-up in the same pass saves me hours per application.",
    stars: 5,
  },
];

const FAQ_ITEMS = [
  {
    q: "How is Resuma different from a generic resume builder?",
    a: "Resuma tailors every application to a specific job description — resume, cover letter, follow-up, and interview prep — with live AI editing so you refine in real time instead of starting over.",
  },
  {
    q: "Will my resume pass ATS systems?",
    a: "Yes. Output uses clean, ATS-friendly formatting. The fit report shows your match score, matched skills, and gaps before you apply.",
  },
  {
    q: "Does the AI fabricate experience?",
    a: "No. Resuma rewrites and emphasizes your existing experience. It won't invent companies, dates, or credentials unless you explicitly ask to add something grounded in your profile.",
  },
  {
    q: "What's included in the subscription?",
    a: "Unlimited applications, AI resume builder with chat-edit, fit reports, cover letters, follow-up emails, interview prep, and your reusable career database — all for $9.99/month.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from Settings anytime. No long-term contracts.",
  },
];

export default function Landing() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#templates", label: "Templates" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Sticky nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-[60px] flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-base tracking-tight" data-testid="text-brand-name">
              Resuma
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 shrink-0" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,320px)]">
                <SheetHeader>
                  <SheetTitle className="font-serif text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileNavOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                  <a
                    href="#faq"
                    onClick={() => setMobileNavOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    FAQ
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
            <a href="/login?mode=login">
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-login"
                className="font-medium text-muted-foreground hover:text-foreground hidden sm:inline-flex"
              >
                Log in
              </Button>
            </a>
            <a href="/login?mode=signup">
              <Button
                size="sm"
                data-testid="button-get-started"
                className="font-semibold px-3 sm:px-4 btn-glow text-xs sm:text-sm"
              >
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero — centered */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-5 sm:px-6">
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="landing-glow-orb absolute top-1/4 left-1/2 -translate-x-1/2 w-[min(900px,100vw)] h-[500px] bg-primary/12 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-[11px] font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by GPT-5.5
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="font-serif text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto"
              data-testid="text-hero-title"
            >
              Paste a job description.{" "}
              <span className="text-primary">Watch your tailored resume write itself.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
              Real-time AI generation and chat-edit — resume, cover letter, and fit analysis from one job post.
            </p>
          </Reveal>

          <Reveal delay={240} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/login?mode=signup">
              <Button size="lg" className="font-semibold px-8 h-12 text-sm btn-glow" data-testid="button-hero-cta">
                Build Your Resume
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="h-12 text-sm font-medium border-border/80 hover:bg-muted/30"
                data-testid="button-hero-learn"
              >
                See how it works
              </Button>
            </a>
          </Reveal>

          <Reveal delay={320} className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {TRUST_CHIPS.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-3 py-1.5"
              >
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                {chip}
              </span>
            ))}
          </Reveal>

          <Reveal delay={400} className="pt-8 max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-6 bg-primary/8 rounded-2xl blur-2xl pointer-events-none" />
              <BuilderMockup />
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-border/60 bg-muted/15">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
              How it works
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Three steps to a stronger application
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {HOW_IT_WORKS.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.step} delay={i * 100}>
                  <div className="relative h-full rounded-2xl border border-border/70 bg-card/50 p-6 hover:border-primary/25 transition-colors duration-200">
                    <span className="text-[11px] font-bold text-primary/80 tracking-widest">{item.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center mt-4 mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-lg font-bold mb-2 tracking-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature sections */}
      {FEATURE_SECTIONS.map((section, i) => {
        const Mockup = section.Mockup;
        return (
          <section
            key={section.id}
            id={section.id}
            className={cn(
              "py-20 sm:py-28 px-5 sm:px-6 border-t border-border/60",
              i % 2 === 1 && "bg-muted/10",
            )}
          >
            <div className="max-w-6xl mx-auto">
              <div
                className={cn(
                  "grid lg:grid-cols-2 gap-12 lg:gap-16 items-center",
                  section.reverse && "lg:[&>*:first-child]:order-2",
                )}
              >
                <Reveal className={section.reverse ? "lg:order-2" : ""}>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
                    {section.badge}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-4 leading-tight">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">{section.desc}</p>
                  <ul className="space-y-3">
                    {section.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delay={120}>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary/6 rounded-2xl blur-xl pointer-events-none" />
                    <Mockup />
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      {/* Value props */}
      <section className="py-20 sm:py-28 px-5 sm:px-6 border-t border-border/60 bg-muted/15">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
              Why Resuma
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Built for serious job seekers
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {VALUE_PROPS.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 80}>
                  <div className="h-full rounded-2xl border border-border/70 bg-card/50 p-6 hover:border-primary/20 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/12 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-serif font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-border/60">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
              Testimonials
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Job seekers who got interviews
            </h2>
            <p className="text-sm text-muted-foreground mt-2">Placeholder quotes — swap with real testimonials</p>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="h-full rounded-2xl border border-border/70 bg-card/40 p-6 space-y-4 hover:border-primary/20 transition-colors">
                  <div className="flex">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-primary/80 text-primary/80" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-2.5 pt-2 border-t border-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-border/60 bg-muted/10">
        <div className="max-w-2xl mx-auto">
          <Reveal className="text-center mb-10">
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">
              FAQ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Common questions</h2>
          </Reveal>
          <Reveal delay={80}>
            <Accordion type="single" collapsible className="rounded-2xl border border-border/70 bg-card/40 px-5">
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.q} value={item.q} className="border-border/50">
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline hover:text-primary transition-colors py-5">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Final CTA / Pricing */}
      <section id="pricing" className="py-20 sm:py-28 px-5 sm:px-6 border-t border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="landing-glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-3xl" />
        </div>
        <Reveal className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/12 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" />
            Simple pricing
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Ready to land more interviews?
          </h2>
          <p className="text-muted-foreground text-[15px]">
            <strong className="text-foreground font-semibold">$9.99/month</strong> — unlimited applications, AI
            builder, fit reports, and full application package.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <a href="/login?mode=signup">
              <Button size="lg" className="font-semibold px-8 h-12 text-sm btn-glow" data-testid="button-final-cta">
                Get started — $9.99/mo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="/login?mode=login">
              <Button variant="outline" size="lg" className="h-12 text-sm font-medium border-border/80">
                Log in
              </Button>
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Cancel anytime · Secure payments via Stripe · ATS-safe output
          </p>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-12 px-5 sm:px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold font-serif">Resuma</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
                Tailored applications powered by real-time AI. Built for job seekers who want results.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Product</p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-foreground transition-colors">Templates</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Company</p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><a href="#reviews" className="hover:text-foreground transition-colors">Testimonials</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a></li>
                <li><a href="/login?mode=signup" className="hover:text-foreground transition-colors">Get started</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">Legal</p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li><span className="text-muted-foreground/70">Privacy Policy</span></li>
                <li><span className="text-muted-foreground/70">Terms of Service</span></li>
                <li><a href="/login?mode=login" className="hover:text-foreground transition-colors">Sign in</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border/50 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Resuma. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Trusted by thousands of applicants</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
