import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, FileText, Zap, RefreshCw, Shield, Rocket, HeadphonesIcon, LogOut, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SubscribePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/applykit/create-checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Failed to start checkout");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsLoading(false);
    }
  };

  const features = [
    { icon: FileText, text: "30 tailored application packages per month" },
    { icon: Zap, text: "AI-optimized resume, cover letter, and follow-up email" },
    { icon: Rocket, text: "ATS Fit Report with gap analysis before you generate" },
    { icon: RefreshCw, text: "Interview practice questions with model answers" },
    { icon: Shield, text: "PDF and DOCX download for every document" },
    { icon: HeadphonesIcon, text: "Priority AI processing and continuous improvements" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md space-y-6">
        {/* Logo + headline */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight">Resuma</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-subscribe-title">
            Unlock your full application toolkit
          </h1>
          {user?.firstName && (
            <p className="text-muted-foreground text-sm">
              Welcome, {user.firstName} — one plan, everything you need to land your next role.
            </p>
          )}
          <div className="flex items-center justify-center gap-1 pt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">Trusted by 500+ job seekers</span>
          </div>
        </div>

        {/* Pricing card */}
        <Card className="p-6 space-y-6">
          {/* Price */}
          <div className="text-center pb-4 border-b">
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-4xl font-bold" data-testid="text-price">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-xs text-muted-foreground">Cancel anytime · No long-term commitment</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            className="w-full font-semibold h-12 text-base"
            onClick={handleSubscribe}
            disabled={isLoading}
            data-testid="button-subscribe"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to payment...
              </>
            ) : (
              "Start Monthly Access — $9.99"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Secure payment via Stripe. Your $9.99/month powers advanced AI processing,
            server infrastructure, and continuous feature development.
          </p>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => { window.location.href = "/api/logout"; }}
            data-testid="button-logout-subscribe"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
