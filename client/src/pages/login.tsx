import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { data: devStatus } = useQuery<{ isDev: boolean }>({
    queryKey: ["/api/auth/dev-status"],
    staleTime: Infinity,
  });

  const isDev = devStatus?.isDev || false;

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/app");
    }
  }, [user, isLoading, setLocation]);

  const devAuthMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isSignup ? "/api/auth/dev/register" : "/api/auth/dev/login";
      const body = isSignup
        ? { email, password, firstName, lastName }
        : { email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Authentication failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/app");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

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
              ? "Get started with Resuma for free"
              : "Sign in to continue to Resuma"}
          </p>
        </div>

        {isDev && (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                devAuthMutation.mutate();
              }}
              className="space-y-4"
              data-testid="form-dev-login"
            >
              {isSignup && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={devAuthMutation.isPending}
                data-testid="button-dev-login"
              >
                {devAuthMutation.isPending
                  ? "Please wait..."
                  : isSignup
                    ? "Create Account"
                    : "Sign In"}
              </Button>
            </form>
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                or
              </span>
            </div>
          </>
        )}

        <a href="/api/login" className="block">
          <Button className="w-full" size="lg" variant={isDev ? "outline" : "default"} data-testid="button-google-login">
            <SiGoogle className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </a>

        {isDev && (
          <p className="text-xs text-center">
            {isSignup ? (
              <a href="/login?mode=login" className="text-primary hover:underline" data-testid="link-switch-login">
                Already have an account? Sign in
              </a>
            ) : (
              <a href="/login?mode=signup" className="text-primary hover:underline" data-testid="link-switch-signup">
                Need an account? Sign up
              </a>
            )}
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Card>
    </div>
  );
}
