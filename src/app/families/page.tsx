import type { Metadata } from "next";

import { FamilyIcon } from "@/components/icons";
import { SectionPlaceholder } from "@/components/section-placeholder";

export const metadata: Metadata = {
  title: "Families",
};

export default function FamiliesPage() {
  return (
    <SectionPlaceholder
      title="Families"
      description="Keep households connected — guardians, siblings, contact preferences, and pickup authorizations in one place."
      icon={FamilyIcon}
      accent="violet"
      highlights={[
        "Group children under a single household",
        "Store guardians and approved pickup contacts",
        "Send updates by email or SMS",
      ]}
    />
  );
}
