import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import LoginPage from "@/pages/login";
import SubscribePage from "@/pages/subscribe";
import Dashboard from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import NewApplication from "@/pages/new-application";
import ApplicationsPage from "@/pages/applications";
import ApplicationDetail from "@/pages/application-detail";
import SettingsPage from "@/pages/settings";
import ProfileSetup from "@/pages/profile-setup";
import FitReport from "@/pages/fit-report";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminUserDetail from "@/pages/admin-user-detail";
import AdminAdmins from "@/pages/admin-admins";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/app" component={Dashboard} />
      <Route path="/app/new" component={NewApplication} />
      <Route path="/app/applications" component={ApplicationsPage} />
      <Route path="/app/applications/:id/fit-report" component={FitReport} />
      <Route path="/app/applications/:id" component={ApplicationDetail} />
      <Route path="/app/profile/setup" component={ProfileSetup} />
      <Route path="/app/profile" component={ProfilePage} />
      <Route path="/app/settings" component={SettingsPage} />
      <Route path="/app/admin" component={AdminDashboard} />
      <Route path="/app/admin/users/:userId" component={AdminUserDetail} />
      <Route path="/app/admin/users" component={AdminUsers} />
      <Route path="/app/admin/admins" component={AdminAdmins} />
      <Route component={NotFound} />
    </Switch>
  );
}

function MobileShell() {
  return (
    <div className="flex flex-col h-[100dvh] w-full">
      <header className="flex items-center justify-between gap-4 px-4 py-2 border-b sticky top-0 z-50 bg-background/95 backdrop-blur-md">
        <Link href="/app">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="mobile-header-logo">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-base tracking-tight">Resuma</span>
          </div>
        </Link>
      </header>
      <main className="flex-1 overflow-auto" style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}>
        <AppRoutes />
      </main>
      <MobileBottomNav />
    </div>
  );
}

function DesktopShell() {
  const style = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 px-4 py-2.5 border-b sticky top-0 z-50 bg-background/90 backdrop-blur-md">
            <SidebarTrigger data-testid="button-sidebar-toggle" className="text-muted-foreground hover:text-foreground" />
          </header>
          <main className="flex-1 overflow-auto bg-muted/10">
            <AppRoutes />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppShell() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileShell /> : <DesktopShell />;
}

function SubscriptionGate() {
  const { hasAccess, isAdmin, isLoading } = useSubscription();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !hasAccess && !isAdmin) {
      if (location !== "/subscribe") {
        setLocation("/subscribe");
      }
    }
  }, [isLoading, hasAccess, isAdmin, location, setLocation]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") === "success") {
      fetch("/api/stripe/sync-subscription", {
        method: "POST",
        credentials: "include",
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/applykit/subscription"] });
        window.history.replaceState({}, "", "/app");
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-10 rounded-md mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!hasAccess && !isAdmin) {
    return <SubscribePage />;
  }

  return (
    <Switch>
      <Route path="/app/*?" component={AppShell} />
      <Route path="/subscribe">{() => { window.location.href = "/app"; return null; }}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function RootRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-10 rounded-md mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={LoginPage} />
        <Route>{() => { window.location.href = "/"; return null; }}</Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/">{() => { window.location.href = "/app"; return null; }}</Route>
      <Route path="/login">{() => { window.location.href = "/app"; return null; }}</Route>
      <Route path="/subscribe" component={SubscribePage} />
      <Route path="/app/*?">
        <SubscriptionGate />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <RootRouter />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
