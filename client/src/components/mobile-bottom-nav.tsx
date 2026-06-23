import { useLocation, Link } from "wouter";
import { useAdmin } from "@/hooks/use-admin";
import { mobileNavItems, adminNavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const [location] = useLocation();
  const { isAdmin } = useAdmin();

  const tabs = isAdmin ? [...mobileNavItems, adminNavItem] : mobileNavItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      data-testid="mobile-bottom-nav"
    >
      <div className="flex items-stretch justify-around h-16 px-1">
        {tabs.map((tab) => {
          const active = tab.isActive(location);
          return (
            <Link key={tab.id} href={tab.url!}>
              <button
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1.5 transition-colors duration-fast ease-premium mobile-tap-scale",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                data-testid={`mobile-tab-${tab.id}`}
              >
                {active ? (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                ) : null}
                <tab.icon
                  className={cn(
                    tabs.length > 5 ? "h-[18px] w-[18px]" : "h-5 w-5",
                    active && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.45)]"
                  )}
                />
                <span
                  className={cn(
                    "font-medium leading-tight truncate max-w-full px-0.5",
                    tabs.length > 5 ? "text-[10px]" : "text-[11px]"
                  )}
                >
                  {tab.title}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
