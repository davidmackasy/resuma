import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const isSignup = mode === "signup";

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/app");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" data-testid="page-login">
      <Card className="w-full max-w-sm p-8 space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight" data-testid="text-login-title">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {isSignup
              ? "Get started with ApplyKit for free"
              : "Sign in to continue to ApplyKit"}
          </p>
        </div>

        <a href="/api/login" className="block">
          <Button className="w-full" size="lg" data-testid="button-google-login">
            <SiGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </a>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Card>
    </div>
  );
}
