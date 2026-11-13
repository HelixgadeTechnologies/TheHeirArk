import type { Metadata } from "next";

import { ClassManagement } from "@/components/class-management";

export const metadata: Metadata = {
  title: "Class Management",
  description:
    "Manage age-based classes, teacher assignments, rosters, and class transfers for children's church.",
};

export default function ClassesPage() {
  return <ClassManagement />;
}
