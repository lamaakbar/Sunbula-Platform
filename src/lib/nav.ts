import type { Role } from "@prisma/client";
import {
  Home,
  LayoutGrid,
  ListChecks,
  Package,
  History,
  UserRound,
  Trees,
  BarChart3,
  Users,
  ClipboardList,
  Bell,
  BookOpen,
  Network,
  Target,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
};

export function navigationFor(role: Role): { primary: NavItem[]; more: NavItem[] } {
  if (role === "EMPLOYEE") {
    return {
      primary: [
        { href: "/employee", label: "Home", icon: Home, mobile: true },
        { href: "/employee/zone", label: "My Zone", icon: LayoutGrid, mobile: true },
        { href: "/employee/tasks", label: "Tasks", icon: ListChecks, mobile: true },
      ],
      more: [
        { href: "/employee/monitoring", label: "Readings", icon: BarChart3 },
        { href: "/employee/inventory", label: "Inventory", icon: Package },
        { href: "/employee/history", label: "History", icon: History },
        { href: "/employee/profile", label: "Profile", icon: UserRound },
      ],
    };
  }

  if (role === "SUPERVISOR") {
    return {
      primary: [
        { href: "/supervisor", label: "Overview", icon: Trees, mobile: true },
        { href: "/supervisor/zones", label: "Zones", icon: LayoutGrid, mobile: true },
        { href: "/supervisor/employees", label: "Team", icon: Users, mobile: true },
      ],
      more: [
        { href: "/supervisor/insights", label: "Insights & Reports", icon: BarChart3 },
        { href: "/supervisor/requests", label: "Seedling Requests", icon: ClipboardList },
        { href: "/supervisor/alerts", label: "Alerts", icon: Bell },
        { href: "/supervisor/knowledge", label: "Knowledge Base", icon: BookOpen },
        { href: "/supervisor/profile", label: "Profile", icon: UserRound },
      ],
    };
  }

  return {
    primary: [
      { href: "/hq", label: "Network", icon: Network, mobile: true },
      { href: "/hq/requests", label: "Requests", icon: ClipboardList, mobile: true },
      { href: "/hq/reports", label: "Reports", icon: FileText, mobile: true },
    ],
    more: [
      { href: "/hq/production", label: "Production Planning", icon: Target },
      { href: "/hq/alerts", label: "Alerts", icon: Bell },
      { href: "/hq/profile", label: "Profile", icon: UserRound },
    ],
  };
}

export function allNavItems(role: Role) {
  const nav = navigationFor(role);
  return [...nav.primary, ...nav.more];
}
