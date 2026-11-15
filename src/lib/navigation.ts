import type { ComponentType } from "react";

import {
  ChildrenIcon,
  ClassesIcon,
  DashboardIcon,
  FamilyIcon,
  FinanceIcon,
  KioskIcon,
  SettingsIcon,
  UserCheckIcon,
  type IconProps,
} from "@/components/icons";

export type Role = "Admin" | "Leader" | "Teacher";

export const ROLES: readonly Role[] = ["Admin", "Leader", "Teacher"];

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
  roles: readonly Role[];
};

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: DashboardIcon,
    roles: ["Admin", "Leader", "Teacher"],
  },
  {
    label: "Attendance Kiosk",
    href: "/attendance",
    icon: KioskIcon,
    roles: ["Admin", "Leader", "Teacher"],
  },
  {
    label: "Children",
    href: "/children",
    icon: ChildrenIcon,
    roles: ["Admin", "Leader", "Teacher"],
  },
  {
    label: "Families",
    href: "/families",
    icon: FamilyIcon,
    roles: ["Admin", "Leader"],
  },
  {
    label: "Classes",
    href: "/classes",
    icon: ClassesIcon,
    roles: ["Admin", "Leader", "Teacher"],
  },
  {
    label: "Finance",
    href: "/finance",
    icon: FinanceIcon,
    roles: ["Admin"],
  },
  {
    label: "Teacher Attendance",
    href: "/settings/teacher-attendance",
    icon: UserCheckIcon,
    roles: ["Admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    roles: ["Admin"],
  },
];
