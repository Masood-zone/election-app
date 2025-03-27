import {
  BarChart3,
  Users,
  Vote,
  Award,
  Calendar,
  Settings,
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    title: "Elections",
    href: "/admin/elections",
    icon: Calendar,
  },
  {
    title: "Voters",
    href: "/admin/voters",
    icon: Users,
  },
  {
    title: "Candidates",
    href: "/admin/candidates",
    icon: Vote,
  },
  {
    title: "Positions",
    href: "/admin/positions",
    icon: Award,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];
