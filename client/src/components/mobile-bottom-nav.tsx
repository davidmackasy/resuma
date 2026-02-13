import { useLocation, Link } from "wouter";
import { LayoutDashboard, PlusCircle, History, User, Settings } from "lucide-react";

const tabs = [
  { title: "Home", url: "/app", icon: LayoutDashboard },
  { title: "New", url: "/app/new", icon: PlusCircle },
  { title: "History", url: "/app/applications", icon: History },
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function MobileBottomNav() {
  const [location] = useLocation();

  const isActive = (url: string) => {
    if (url === "/app") return location === "/app";
    return location.startsWith(url);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.url);
          return (
            <Link key={tab.title} href={tab.url}>
              <button
                className={`flex flex-col items-center justify-center gap-0.5 w-full min-w-[56px] py-1 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-testid={`mobile-tab-${tab.title.toLowerCase()}`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[11px] font-medium leading-tight">{tab.title}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
