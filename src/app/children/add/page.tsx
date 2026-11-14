import { Suspense } from "react";
import type { Metadata } from "next";

import { AddChildForm } from "@/components/add-child-form";

export const metadata: Metadata = {
  title: "Add child",
  description: "Capture a new child profile with guardians, family linkage, and pick-up safeguards.",
};

export default function AddChildPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <AddChildForm />
    </Suspense>
  );
}