import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MessageSquare,
  LayoutTemplate,
  Kanban,
  Database,
  Bell,
  LifeBuoy,
  Settings,
  Shield,
} from "lucide-react";

export type NavItem = {
  id: string;
  title: string;
  icon: LucideIcon;
  url?: string;
  comingSoon?: boolean;
  isActive: (location: string) => boolean;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const COMING_SOON_FEATURES: Record<
  string,
  { title: string; description: string }
> = {
  "cover-letter": {
    title: "Cover Letter",
    description:
      "A dedicated cover letter workspace is on the way. For now, cover letters are generated and editable inside each application.",
  },
  templates: {
    title: "Templates",
    description:
      "A full template library page is coming soon. You can already pick templates when creating a new application.",
  },
  notifications: {
    title: "Notifications",
    description:
      "Application reminders and status alerts are coming soon. We'll notify you when it's ready.",
  },
  help: {
    title: "Help & Support",
    description:
      "Guides, FAQs, and direct support are on the way. Reach out via your account email in the meantime.",
  },
};

function isApplicationDetail(location: string) {
  return /^\/app\/applications\/\d+(\/fit-report)?$/.test(location);
}

export const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        id: "home",
        title: "Home",
        icon: LayoutDashboard,
        url: "/app",
        isActive: (location) => location === "/app",
      },
      {
        id: "new-application",
        title: "New Application",
        icon: PlusCircle,
        url: "/app/new",
        isActive: (location) => location === "/app/new",
      },
    ],
  },
  {
    label: "Build",
    items: [
      {
        id: "resume-builder",
        title: "Resume Builder",
        icon: FileText,
        url: "/app/applications",
        isActive: (location) =>
          location === "/app/new" || isApplicationDetail(location),
      },
      {
        id: "cover-letter",
        title: "Cover Letter",
        icon: MessageSquare,
        comingSoon: true,
        url: "/app/coming-soon/cover-letter",
        isActive: (location) => location.startsWith("/app/coming-soon/cover-letter"),
      },
      {
        id: "templates",
        title: "Templates",
        icon: LayoutTemplate,
        comingSoon: true,
        url: "/app/coming-soon/templates",
        isActive: (location) => location.startsWith("/app/coming-soon/templates"),
      },
    ],
  },
  {
    label: "Track",
    items: [
      {
        id: "application-tracker",
        title: "Application Tracker",
        icon: Kanban,
        url: "/app/applications",
        isActive: (location) => location === "/app/applications",
      },
    ],
  },
  {
    label: "Career",
    items: [
      {
        id: "career-database",
        title: "Career Database",
        icon: Database,
        url: "/app/profile",
        isActive: (location) => location.startsWith("/app/profile"),
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        id: "notifications",
        title: "Notifications",
        icon: Bell,
        comingSoon: true,
        url: "/app/coming-soon/notifications",
        isActive: (location) => location.startsWith("/app/coming-soon/notifications"),
      },
      {
        id: "help",
        title: "Help & Support",
        icon: LifeBuoy,
        comingSoon: true,
        url: "/app/coming-soon/help",
        isActive: (location) => location.startsWith("/app/coming-soon/help"),
      },
      {
        id: "settings",
        title: "Settings",
        icon: Settings,
        url: "/app/settings",
        isActive: (location) => location.startsWith("/app/settings"),
      },
    ],
  },
];

export const adminNavItem: NavItem = {
  id: "admin",
  title: "Admin Portal",
  icon: Shield,
  url: "/app/admin",
  isActive: (location) => location.startsWith("/app/admin"),
};

/** Mobile bottom bar — core destinations only */
export const mobileNavItems: NavItem[] = [
  {
    id: "home",
    title: "Home",
    icon: LayoutDashboard,
    url: "/app",
    isActive: (location) => location === "/app",
  },
  {
    id: "new-application",
    title: "New",
    icon: PlusCircle,
    url: "/app/new",
    isActive: (location) => location === "/app/new",
  },
  {
    id: "application-tracker",
    title: "Tracker",
    icon: Kanban,
    url: "/app/applications",
    isActive: (location) =>
      location === "/app/applications" || isApplicationDetail(location),
  },
  {
    id: "career-database",
    title: "Career",
    icon: Database,
    url: "/app/profile",
    isActive: (location) => location.startsWith("/app/profile"),
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    url: "/app/settings",
    isActive: (location) => location.startsWith("/app/settings"),
  },
];
