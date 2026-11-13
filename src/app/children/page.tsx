import type { Metadata } from "next";

import { ChildrenLedger } from "@/components/children-ledger";

export const metadata: Metadata = {
  title: "Children",
  description:
    "Child profiles, age-group rosters, guardian details, allergies, and attendance tracking.",
};

export default function ChildrenPage() {
  return <ChildrenLedger />;
}
