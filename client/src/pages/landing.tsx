import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Sparkles, Download, ArrowRight, Zap, Shield, Target } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight" data-testid="text-brand-name">ApplyKit</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/api/login">
              <Button variant="ghost" data-testid="button-login">Log in</Button>
            </a>
            <a href="/api/login">
              <Button data-testid="button-get-started">Get Started</Button>
            </a>
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent text-accent-foreground text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Career Tools
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight" data-testid="text-hero-title">
                Land your dream job with
                <span className="text-primary"> tailored applications</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
                Upload your resume once. Paste any job description. Get a perfectly tailored resume, cover letter, and follow-up email in seconds.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a href="/api/login">
                  <Button size="lg" data-testid="button-hero-cta">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  ATS-optimized output
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Generated in seconds
                </span>
              </div>
            </div>
            <div className="hidden lg:block">
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Senior Product Designer</p>
                    <p className="text-xs text-muted-foreground">Acme Corp - San Francisco, CA</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {["Tailored Resume", "Cover Letter", "Follow-up Email"].map((doc, i) => (
                    <div key={doc} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : 'bg-orange-500'}`} />
                        <span className="text-sm font-medium">{doc}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Ready</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant="outline" size="sm">
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Download All
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-3" data-testid="text-features-title">How it works</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Three simple steps to your perfect application package</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Build your profile",
                desc: "Enter your experience, skills, and education once. We keep it structured and ready.",
                step: "01",
              },
              {
                icon: Target,
                title: "Paste the job",
                desc: "Paste any job description. Our AI extracts key requirements and matches them to your profile.",
                step: "02",
              },
              {
                icon: Sparkles,
                title: "Get your package",
                desc: "Receive a tailored resume, cover letter, and follow-up email. Copy or download instantly.",
                step: "03",
              },
            ].map((feature) => (
              <Card key={feature.step} className="p-6 hover-elevate">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{feature.step}</span>
                </div>
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <FileText className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">ApplyKit</span>
          </div>
          <p className="text-xs text-muted-foreground">Built with care for job seekers everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
