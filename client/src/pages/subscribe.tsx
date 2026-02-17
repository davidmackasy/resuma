import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, FileText, Zap, RefreshCw, Shield, Rocket, HeadphonesIcon, LogOut } from "lucide-react";
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
    { icon: FileText, text: "Generate up to 30 resume discoveries every month" },
    { icon: Zap, text: "AI-optimized resumes tailored to job descriptions" },
    { icon: Rocket, text: "Faster job application turnaround" },
    { icon: RefreshCw, text: "Unlimited revisions during active billing period" },
    { icon: Shield, text: "Continuous feature updates and improvements" },
    { icon: HeadphonesIcon, text: "Priority AI processing performance" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight">Resuma</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-subscribe-title">
            Unlock Full Resume Discovery Access
          </h1>
          {user?.firstName && (
            <p className="text-muted-foreground">
              Welcome, {user.firstName}. Start generating tailored resumes today.
            </p>
          )}
        </div>

        <Card className="p-6 space-y-5">
          <div className="text-center">
            <Badge variant="secondary" className="mb-3">Monthly Plan</Badge>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold" data-testid="text-price">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Why $9.99/month?</p>
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t space-y-2">
            <p className="text-xs text-muted-foreground">
              Your $9.99 monthly membership powers advanced AI processing, server infrastructure,
              ongoing product improvements, and reliable resume generation at scale.
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
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
              "Start My $9.99 Monthly Access"
            )}
          </Button>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime. Secure payment powered by Stripe.
        </p>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.location.href = "/api/logout";
            }}
            data-testid="button-logout-subscribe"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
