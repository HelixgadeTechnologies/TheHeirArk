import type { Metadata } from "next";

import { FamiliesDirectory } from "@/components/families-directory";

export const metadata: Metadata = {
  title: "Families & Households",
  description:
    "Household directories, approved pick-up contacts, emergency numbers, and sibling rosters for The Ark Children's Church.",
};

export default function FamiliesPage() {
  return <FamiliesDirectory />;
}
