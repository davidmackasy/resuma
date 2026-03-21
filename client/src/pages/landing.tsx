import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText, Sparkles, Download, ArrowRight, Zap, Shield, Target,
  CheckCircle2, Star, Clock, Users, TrendingUp, Mail, MessageSquare,
  ChevronRight, BookOpen
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
    desc: "Enter your experience, skills, and education once. Resuma keeps everything structured and ready to use.",
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

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight" data-testid="text-brand-name">Resuma</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/login?mode=login">
              <Button variant="ghost" size="sm" data-testid="button-login" className="hidden sm:inline-flex">
                Log in
              </Button>
            </a>
            <a href="/login?mode=signup">
              <Button size="sm" data-testid="button-get-started" className="font-semibold">
                Get Started
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Career Tools
              </div>

              <div className="space-y-3">
                <h1
                  className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.1]"
                  data-testid="text-hero-title"
                >
                  Land your dream job with{" "}
                  <span className="text-primary">tailored applications</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-[480px]">
                  Upload your resume once. Paste any job description. Get a perfectly tailored resume, cover letter, follow-up email, and interview prep — in seconds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <a href="/login?mode=signup">
                  <Button size="lg" className="font-semibold px-6 h-12 text-base" data-testid="button-hero-cta">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a href="/login?mode=login">
                  <Button variant="ghost" size="lg" className="h-12 text-base text-muted-foreground" data-testid="button-hero-signin">
                    Already have an account?
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  ATS-optimized output
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Generated in seconds
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Trusted by job seekers
                </span>
              </div>
            </div>

            {/* Right: Product mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-2xl" />
                <Card className="relative p-6 space-y-5 shadow-lg">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">Senior Product Designer</p>
                      <p className="text-xs text-muted-foreground">Acme Corp · San Francisco, CA</p>
                    </div>
                    <div className="ml-auto shrink-0">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">92% fit</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { label: "Tailored Resume", color: "bg-green-500", badge: "ATS optimized" },
                      { label: "Cover Letter", color: "bg-blue-500", badge: "Personalized" },
                      { label: "Follow-up Email", color: "bg-orange-500", badge: "Ready to send" },
                      { label: "Interview Prep", color: "bg-violet-500", badge: "7 questions" },
                    ].map((doc) => (
                      <div
                        key={doc.label}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${doc.color}`} />
                          <span className="text-sm font-medium">{doc.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                          {doc.badge}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button className="flex-1 font-semibold" size="sm">
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download All
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Documents
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 px-4 sm:px-6 border-y bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span>4.9 / 5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">500+</strong> job seekers helped</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">30 seconds</strong> average generation time</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">100%</strong> ATS-safe output</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-4">
              Simple Process
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3" data-testid="text-features-title">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              Four steps from profile to perfect application package
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%-0px)] w-full h-px border-t border-dashed border-border z-0" />
                )}
                <Card className="p-5 h-full relative z-10">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="h-4.5 w-4.5 text-primary h-[18px] w-[18px]" />
                    </div>
                    <span className="text-xs font-mono font-bold text-primary">{step.step}</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-sm">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-muted/20 border-y">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-4">
              Everything included
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
              One paste. Four documents.
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              Everything you need to stand out at every stage of the application process.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="p-5 hover-elevate group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-4">
              Real results
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
              What job seekers say
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-5 space-y-4">
                <div className="flex">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 border-t bg-muted/20">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mx-auto">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Ready to apply smarter?
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Stop sending generic applications. Start getting interviews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a href="/login?mode=signup">
              <Button size="lg" className="font-semibold px-8 h-12 text-base" data-testid="button-final-cta">
                Get started — $9.99/mo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Cancel anytime · Secure payments via Stripe · No writing from scratch
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Resuma</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <a href="/login?mode=signup" className="hover:text-foreground transition-colors">Get started</a>
            <a href="/login?mode=login" className="hover:text-foreground transition-colors">Log in</a>
            <span>© {new Date().getFullYear()} Resuma. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
