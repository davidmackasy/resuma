import { useLocation, Link } from "wouter";
import { FileText, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { navSections, adminNavItem, type NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

const activeNavClass =
  "data-[active=true]:bg-accent/70 data-[active=true]:text-accent-foreground data-[active=true]:shadow-[inset_3px_0_0_0_hsl(var(--primary)),inset_0_0_24px_hsl(var(--primary)/0.06)]";

function NavEntry({ item, location }: { item: NavItem; location: string }) {
  const active = item.isActive(location);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.comingSoon ? `${item.title} — coming soon` : item.title}
        className={cn(
          "h-9 px-2.5 gap-2.5 transition-[background-color,box-shadow,color] duration-fast ease-premium rounded-lg",
          activeNavClass,
          item.comingSoon && "opacity-90"
        )}
        data-testid={`link-nav-${item.id}`}
      >
        <Link href={item.url!}>
          <item.icon className="h-4 w-4 opacity-80" />
          <span className="flex-1 truncate">{item.title}</span>
          {item.comingSoon ? (
            <Badge
              variant="outline"
              className="ml-auto h-5 px-1.5 text-[10px] font-medium text-muted-foreground border-border/80 shrink-0"
            >
              Soon
            </Badge>
          ) : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <Sidebar className="border-r border-sidebar-border/80">
      <SidebarHeader className="px-3 py-4">
        <Link href="/app">
          <div
            className="flex items-center gap-2.5 cursor-pointer px-1 py-0.5 rounded-lg transition-opacity duration-fast hover:opacity-90"
            data-testid="link-sidebar-logo"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.35)]">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight">Resuma</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 gap-1">
        {navSections.map((section) => (
          <SidebarGroup key={section.label} className="py-1">
            <SidebarGroupLabel className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80 h-7">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => (
                  <NavEntry key={item.id} item={item} location={location} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {isAdmin ? (
          <SidebarGroup className="py-1">
            <SidebarGroupLabel className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80 h-7">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavEntry item={adminNavItem} location={location} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/80">
        <div className="flex items-center gap-2.5 rounded-lg p-2 bg-sidebar-accent/40">
          <Avatar className="h-8 w-8 ring-1 ring-border/50">
            <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
            <AvatarFallback className="text-xs bg-muted">
              {(user?.firstName?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-sidebar-user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-sidebar-user-email">
              {user?.email || ""}
            </p>
          </div>
          <a href="/api/logout">
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
