import type { Metadata } from "next";

import { FinanceLedger } from "@/components/finance-ledger";

export const metadata: Metadata = {
  title: "Finance",
  description:
    "Log Sunday offerings, teacher dues, donations, and contributions with category totals and a filterable history.",
};

export default function FinancePage() {
  return <FinanceLedger />;
}
