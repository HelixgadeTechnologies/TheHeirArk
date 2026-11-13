import type { Metadata } from "next";

import { SettingsManagement } from "@/components/settings-management";

export const metadata: Metadata = {
  title: "Settings & Staff Roles",
  description:
    "Manage staff accounts, assign ministry access roles, oversee classroom authorizations, and configure church safety safeguards.",
};

export default function SettingsPage() {
  return <SettingsManagement />;
}

