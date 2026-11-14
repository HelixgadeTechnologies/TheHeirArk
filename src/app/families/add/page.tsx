import { Suspense } from "react";
import type { Metadata } from "next";

import { AddFamilyForm } from "@/components/add-family-form";

export const metadata: Metadata = {
  title: "Add family household",
  description: "Register a new family household with primary guardian, address, and spouse details.",
};

export default function AddFamilyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <AddFamilyForm />
    </Suspense>
  );
}
