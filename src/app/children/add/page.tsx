import type { Metadata } from "next";

import { AddChildForm } from "@/components/add-child-form";

export const metadata: Metadata = {
  title: "Add child",
  description: "Capture a new child profile with guardians and health details.",
};

export default function AddChildPage() {
  return <AddChildForm />;
}