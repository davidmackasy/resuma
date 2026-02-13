import { useLocation, Link } from "wouter";
import { LayoutDashboard, PlusCircle, History, User, Settings, FileText, LogOut } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "New Application", url: "/app/new", icon: PlusCircle },
  { title: "History", url: "/app/applications", icon: History },
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (url: string) => {
    if (url === "/app") return location === "/app";
    return location.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/app">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-sidebar-logo">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight">Resuma</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={isActive(item.url)}
                    data-testid={`link-nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
            <AvatarFallback className="text-xs">
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
            <Button size="icon" variant="ghost" data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
