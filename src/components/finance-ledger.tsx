"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChildrenIcon,
  CloseIcon,
  FinanceIcon,
  GiftIcon,
  HeartIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";

type Category = "sunday-offering" | "teacher-dues" | "donations" | "contributions";

type Method = "Cash" | "Card" | "Bank transfer" | "Mobile money";

type Transaction = {
  id: string;
  date: string;
  category: Category;
  giver: string;
  amount: number;
  method: Method;
  recordedBy: string;
  note?: string;
};

type Notice = {
  message: string;
  detail: string;
};

const METHODS: Method[] = ["Cash", "Card", "Bank transfer", "Mobile money"];

const CATEGORY_ORDER: Category[] = [
  "sunday-offering",
  "teacher-dues",
  "donations",
  "contributions",
];

const CATEGORY_META: Record<
  Category,
  { label: string; icon: string; badge: string; bar: string; dot: string }
> = {
  "sunday-offering": {
    label: "Sunday offering",
    icon: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    badge:
      "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10 dark:bg-indigo-500/10 dark:text-indigo-300",
    bar: "bg-indigo-500",
    dot: "bg-indigo-500",
  },
  "teacher-dues": {
    label: "Teacher dues",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    badge:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-300",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  donations: {
    label: "Donations",
    icon: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    badge:
      "bg-rose-50 text-rose-700 ring-1 ring-rose-600/10 dark:bg-rose-500/10 dark:text-rose-300",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
  contributions: {
    label: "Contributions",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    badge:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  // Sunday offerings
  {
    id: "off-1101",
    date: "2026-11-01",
    category: "sunday-offering",
    giver: "Sunday congregation",
    amount: 124050,
    method: "Cash",
    recordedBy: "Grace Okafor",
    note: "First service · 84 attendees",
  },
  {
    id: "off-1025",
    date: "2026-10-25",
    category: "sunday-offering",
    giver: "Sunday congregation",
    amount: 118600,
    method: "Card",
    recordedBy: "Grace Okafor",
    note: "Combined service",
  },
  {
    id: "off-1018",
    date: "2026-10-18",
    category: "sunday-offering",
    giver: "Sunday congregation",
    amount: 132275,
    method: "Cash",
    recordedBy: "Ruth Mensah",
    note: "Missions Sunday",
  },
  {
    id: "off-1011",
    date: "2026-10-11",
    category: "sunday-offering",
    giver: "Sunday congregation",
    amount: 109800,
    method: "Mobile money",
    recordedBy: "Grace Okafor",
  },
  {
    id: "off-1004",
    date: "2026-10-04",
    category: "sunday-offering",
    giver: "Sunday congregation",
    amount: 127525,
    method: "Cash",
    recordedBy: "Ruth Mensah",
    note: "Harvest Sunday",
  },
  {
    id: "off-0927",
    date: "2026-09-27",
    category: "sunday-offering",
    giver: "Sunday congregation",
    amount: 115500,
    method: "Card",
    recordedBy: "Grace Okafor",
  },
  // Teacher dues
  {
    id: "dues-1101-go",
    date: "2026-11-01",
    category: "teacher-dues",
    giver: "Grace Okafor",
    amount: 2500,
    method: "Cash",
    recordedBy: "Ruth Mensah",
    note: "November dues",
  },
  {
    id: "dues-1101-dk",
    date: "2026-11-01",
    category: "teacher-dues",
    giver: "Daniel Kim",
    amount: 2500,
    method: "Bank transfer",
    recordedBy: "Ruth Mensah",
    note: "November dues",
  },
  {
    id: "dues-1004-rm",
    date: "2026-10-04",
    category: "teacher-dues",
    giver: "Ruth Mensah",
    amount: 2500,
    method: "Cash",
    recordedBy: "Grace Okafor",
    note: "October dues",
  },
  {
    id: "dues-1004-sa",
    date: "2026-10-04",
    category: "teacher-dues",
    giver: "Samuel Adeyemi",
    amount: 2500,
    method: "Mobile money",
    recordedBy: "Grace Okafor",
    note: "October dues",
  },
  {
    id: "dues-0906-sm",
    date: "2026-09-06",
    category: "teacher-dues",
    giver: "Sarah Mensah",
    amount: 2500,
    method: "Cash",
    recordedBy: "Grace Okafor",
    note: "September dues",
  },
  {
    id: "dues-0906-ta",
    date: "2026-09-06",
    category: "teacher-dues",
    giver: "Tunde Adeyemi",
    amount: 2500,
    method: "Bank transfer",
    recordedBy: "Grace Okafor",
    note: "September dues",
  },
  // Donations
  {
    id: "don-1101",
    date: "2026-11-01",
    category: "donations",
    giver: "Anonymous",
    amount: 50000,
    method: "Bank transfer",
    recordedBy: "Grace Okafor",
    note: "Children's Bible fund",
  },
  {
    id: "don-1018",
    date: "2026-10-18",
    category: "donations",
    giver: "The Mensah Family",
    amount: 25000,
    method: "Cash",
    recordedBy: "Ruth Mensah",
    note: "Snacks ministry",
  },
  {
    id: "don-1004",
    date: "2026-10-04",
    category: "donations",
    giver: "Anonymous",
    amount: 12000,
    method: "Mobile money",
    recordedBy: "Grace Okafor",
    note: "Craft supplies",
  },
  {
    id: "don-0920",
    date: "2026-09-20",
    category: "donations",
    giver: "Grace Community",
    amount: 100000,
    method: "Bank transfer",
    recordedBy: "Grace Okafor",
    note: "Christmas programme",
  },
  {
    id: "don-0913",
    date: "2026-09-13",
    category: "donations",
    giver: "Anonymous",
    amount: 7500,
    method: "Cash",
    recordedBy: "Ruth Mensah",
    note: "Library books",
  },
  // Contributions
  {
    id: "con-1101",
    date: "2026-11-01",
    category: "contributions",
    giver: "Okafor family",
    amount: 15000,
    method: "Cash",
    recordedBy: "Grace Okafor",
    note: "Thanksgiving outreach",
  },
  {
    id: "con-1025",
    date: "2026-10-25",
    category: "contributions",
    giver: "Youth parents",
    amount: 32000,
    method: "Mobile money",
    recordedBy: "Samuel Adeyemi",
    note: "Teens retreat",
  },
  {
    id: "con-1011",
    date: "2026-10-11",
    category: "contributions",
    giver: "Anonymous",
    amount: 20000,
    method: "Bank transfer",
    recordedBy: "Grace Okafor",
    note: "Building fund",
  },
  {
    id: "con-0927",
    date: "2026-09-27",
    category: "contributions",
    giver: "Patel family",
    amount: 10000,
    method: "Cash",
    recordedBy: "Ruth Mensah",
    note: "Playground fund",
  },
  {
    id: "con-0913",
    date: "2026-09-13",
    category: "contributions",
    giver: "Anonymous",
    amount: 25000,
    method: "Card",
    recordedBy: "Grace Okafor",
    note: "Scholarship fund",
  },
];

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const weekdayYearFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
});

const mobileDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Math.round(value));
}

function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

function CategoryGlyph({ category, className }: { category: Category; className?: string }) {
  if (category === "sunday-offering") return <FinanceIcon className={className} />;
  if (category === "teacher-dues") return <ChildrenIcon className={className} />;
  if (category === "donations") return <HeartIcon className={className} />;
  return <GiftIcon className={className} />;
}

const PAGE_SIZE = 10;

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

type NewTransaction = {
  category: Category;
  amount: number;
  date: string;
  method: Method;
  giver: string;
  note?: string;
};

export function FinanceLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [methodFilter, setMethodFilter] = useState<Method | "all">("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entryOpen, setEntryOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const search = query.trim().toLowerCase();

  const totals = useMemo(() => {
    const byCategory = Object.fromEntries(
      CATEGORY_ORDER.map((category) => [category, { total: 0, count: 0 }]),
    ) as Record<Category, { total: number; count: number }>;

    let total = 0;
    for (const transaction of transactions) {
      byCategory[transaction.category].total += transaction.amount;
      byCategory[transaction.category].count += 1;
      total += transaction.amount;
    }

    return { total, byCategory };
  }, [transactions]);

  const monthOptions = useMemo(() => {
    const months = new Map<string, string>();

    for (const transaction of transactions) {
      const key = transaction.date.slice(0, 7);
      if (!months.has(key)) {
        months.set(key, monthFormatter.format(parseISODate(`${key}-01`)));
      }
    }

    return Array.from(months.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

  const latestMonthKey = monthOptions[0]?.[0] ?? "";
  const latestMonthLabel = monthOptions[0]?.[1] ?? "No entries yet";
  const latestMonthTotal = useMemo(
    () =>
      latestMonthKey
        ? transactions
            .filter((transaction) => transaction.date.startsWith(latestMonthKey))
            .reduce((sum, transaction) => sum + transaction.amount, 0)
        : 0,
    [transactions, latestMonthKey],
  );

  const filtered = useMemo(
    () =>
      transactions
        .filter(
          (transaction) => categoryFilter === "all" || transaction.category === categoryFilter,
        )
        .filter((transaction) => methodFilter === "all" || transaction.method === methodFilter)
        .filter(
          (transaction) => monthFilter === "all" || transaction.date.startsWith(monthFilter),
        )
        .filter((transaction) => {
          if (!search) return true;
          return [
            transaction.giver,
            transaction.note ?? "",
            transaction.recordedBy,
            transaction.method,
            CATEGORY_META[transaction.category].label,
          ]
            .join(" ")
            .toLowerCase()
            .includes(search);
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, categoryFilter, methodFilter, monthFilter, search],
  );

  const filteredTotal = filtered.reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filtered, safePage]);

  const startEntry = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(safePage * PAGE_SIZE, filtered.length);

  const offering = totals.byCategory["sunday-offering"];
  const hasFilters =
    categoryFilter !== "all" ||
    methodFilter !== "all" ||
    monthFilter !== "all" ||
    query.trim() !== "";

  const metrics = [
    {
      label: "Total collected",
      value: formatCurrency(totals.total),
      hint: `${transactions.length} entries across 4 categories`,
      dot: "bg-indigo-500",
      valueClass: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Latest month",
      value: formatCurrency(latestMonthTotal),
      hint: latestMonthLabel,
      dot: "bg-emerald-500",
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Avg. Sunday offering",
      value: formatCurrency(offering.count ? offering.total / offering.count : 0),
      hint: `Across ${offering.count} collections`,
      dot: "bg-amber-500",
      valueClass: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Entries logged",
      value: String(transactions.length),
      hint: "All four categories",
      dot: "bg-sky-500",
      valueClass: "text-sky-600 dark:text-sky-400",
    },
  ];

  function clearFilters() {
    setCategoryFilter("all");
    setMethodFilter("all");
    setMonthFilter("all");
    setQuery("");
    setCurrentPage(1);
  }

  function saveTransaction(input: NewTransaction) {
    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      category: input.category,
      amount: input.amount,
      date: input.date,
      method: input.method,
      giver: input.giver,
      note: input.note,
      recordedBy: "Grace Okafor",
    };

    setTransactions((current) => [transaction, ...current]);
    setCurrentPage(1);
    setEntryOpen(false);
    setNotice({
      message: `${formatCurrency(transaction.amount)} ${CATEGORY_META[transaction.category].label.toLowerCase()} recorded`,
      detail: `${transaction.giver} · ${transaction.method} · ${shortDateFormatter.format(
        parseISODate(transaction.date),
      )}`,
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Finance & Giving Ledger
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Track Sunday offerings, teacher dues, donations, and special project contributions. Instant audit trail and category breakdowns.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              Audited ministry ledger
            </span>
            <button
              type="button"
              onClick={() => setEntryOpen(true)}
              className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 active:scale-[0.99] sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Record contribution
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90"
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", metric.dot)} />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {metric.label}
                </p>
              </div>
              <p
                className={cn(
                  "mt-2 text-2xl font-bold tabular-nums sm:text-3xl",
                  metric.valueClass,
                )}
              >
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {metric.hint}
              </p>
            </div>
          ))}
        </div>
      </div>

      <section aria-labelledby="category-totals-title">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="category-totals-title"
              className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100"
            >
              Collections by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time ministry totals and percentage breakdown
            </p>
          </div>
          <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrency(totals.total)}
          </p>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-3.5 xl:grid-cols-4">
          {CATEGORY_ORDER.map((category) => {
            const meta = CATEGORY_META[category];
            const data = totals.byCategory[category];
            const percent = totals.total > 0 ? Math.round((data.total / totals.total) * 100) : 0;

            return (
              <article
                key={category}
                className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      meta.icon,
                    )}
                  >
                    <CategoryGlyph category={category} className="h-4 w-4" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {data.count} {data.count === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {meta.label}
                </p>
                <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">{formatCurrency(data.total)}</p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn("h-full rounded-full transition-all duration-300", meta.bar)}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">{percent}%</span> of total funds
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="history-title"
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900/90"
      >
        <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="history-title" className="text-base font-bold tracking-tight">
                Transaction history
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  {startEntry}–{endEntry}
                </span>{" "}
                of{" "}
                <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  {filtered.length}
                </span>{" "}
                entries ·{" "}
                <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  {formatCurrency(filteredTotal)}
                </span>
              </p>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Page{" "}
              <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                {safePage}
              </span>{" "}
              of{" "}
              <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                {totalPages}
              </span>{" "}
              · 10 per page
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-2 xl:flex-row">
              <div className="relative flex-1">
                <label htmlFor="finance-search" className="sr-only">
                  Search transactions
                </label>
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="finance-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search giver or note…"
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCurrentPage(1);
                    }}
                    aria-label="Clear search"
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 xl:flex xl:shrink-0">
                <FilterSelect
                  id="finance-month"
                  label="Filter by month"
                  value={monthFilter}
                  onChange={(value) => {
                    setMonthFilter(value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "All months" },
                    ...monthOptions.map(([value, label]) => ({ value, label })),
                  ]}
                />
                <FilterSelect
                  id="finance-method"
                  label="Filter by payment method"
                  value={methodFilter}
                  onChange={(value) => {
                    setMethodFilter(value as Method | "all");
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: "All methods" },
                    ...METHODS.map((method) => ({ value: method, label: method })),
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                <FilterChip
                  active={categoryFilter === "all"}
                  onClick={() => {
                    setCategoryFilter("all");
                    setCurrentPage(1);
                  }}
                  label="All"
                  count={transactions.length}
                />
                {CATEGORY_ORDER.map((category) => (
                  <FilterChip
                    key={category}
                    active={categoryFilter === category}
                    onClick={() => {
                      setCategoryFilter(category);
                      setCurrentPage(1);
                    }}
                    label={CATEGORY_META[category].label}
                    count={totals.byCategory[category].count}
                  />
                ))}
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="shrink-0 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <SearchIcon className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold">No transactions match</p>
            <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              Try another category, month, payment method, or search term.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 lg:hidden dark:divide-slate-800">
              {paginatedTransactions.map((transaction) => (
                <article key={transaction.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <CategoryBadge category={transaction.category} />
                    <p className="shrink-0 text-base font-bold tabular-nums">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{transaction.giver}</p>
                  {transaction.note && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {transaction.note}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{mobileDateFormatter.format(parseISODate(transaction.date))}</span>
                    <span aria-hidden="true">·</span>
                    <span>{transaction.method}</span>
                    <span aria-hidden="true">·</span>
                    <span>Recorded by {transaction.recordedBy}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
                      <th
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Giver / source
                      </th>
                      <th
                        scope="col"
                        className="hidden px-4 py-3 text-xs font-semibold text-slate-700 xl:table-cell dark:text-slate-300"
                      >
                        Method
                      </th>
                      <th
                        scope="col"
                        className="hidden px-4 py-3 text-xs font-semibold text-slate-700 2xl:table-cell dark:text-slate-300"
                      >
                        Recorded by
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <p className="text-sm font-semibold">
                            {shortDateFormatter.format(parseISODate(transaction.date))}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {weekdayYearFormatter.format(parseISODate(transaction.date))}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <CategoryBadge category={transaction.category} />
                        </td>
                        <td className="max-w-[260px] px-4 py-3">
                          <p className="truncate text-sm font-medium">{transaction.giver}</p>
                          {transaction.note && (
                            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                              {transaction.note}
                            </p>
                          )}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-slate-600 xl:table-cell dark:text-slate-300">
                          {transaction.method}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-slate-500 2xl:table-cell dark:text-slate-400">
                          {transaction.recordedBy}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold tabular-nums">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Showing{" "}
                  <strong className="font-semibold tabular-nums text-slate-900 dark:text-white">
                    {startEntry}–{endEntry}
                  </strong>{" "}
                  of{" "}
                  <strong className="font-semibold tabular-nums text-slate-900 dark:text-white">
                    {filtered.length}
                  </strong>{" "}
                  {filtered.length === 1 ? "entry" : "entries"}
                  {hasFilters && (
                    <span className="text-slate-400 dark:text-slate-500">
                      {" "}(filtered from {transactions.length})
                    </span>
                  )}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                  ·
                </span>
                <span>
                  Page total:{" "}
                  <strong className="font-semibold tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(
                      paginatedTransactions.reduce((sum, tx) => sum + tx.amount, 0),
                    )}
                  </strong>
                </span>
                <span aria-hidden="true" className="hidden text-slate-300 sm:inline dark:text-slate-600">
                  ·
                </span>
                <span className="hidden sm:inline">
                  Filtered total:{" "}
                  <strong className="font-semibold tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(filteredTotal)}
                  </strong>
                </span>
              </div>

              {totalPages > 1 && (
                <nav
                  aria-label="Transaction pagination"
                  className="flex items-center justify-between gap-1 sm:justify-end sm:gap-1.5"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    aria-label="Previous page"
                    className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 sm:h-8.5 sm:rounded-lg sm:px-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="px-2 text-xs font-semibold tabular-nums text-slate-600 sm:hidden dark:text-slate-400">
                      Page {safePage} of {totalPages}
                    </span>
                    <div className="hidden sm:flex items-center gap-1">
                      {getPageNumbers(safePage, totalPages).map((item, idx) => {
                        if (item === "...") {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="flex h-8.5 w-6 items-center justify-center text-xs font-semibold text-slate-400"
                            >
                              …
                            </span>
                          );
                        }

                        const isCurrent = item === safePage;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setCurrentPage(item)}
                            aria-current={isCurrent ? "page" : undefined}
                            aria-label={`Page ${item}`}
                            className={cn(
                              "flex h-8.5 w-8.5 items-center justify-center rounded-lg text-xs font-semibold tabular-nums transition-colors",
                              isCurrent
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white",
                            )}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    aria-label="Next page"
                    className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 sm:h-8.5 sm:rounded-lg sm:px-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                  >
                    <span>Next</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </div>
          </>
        )}
      </section>

      <p className="flex items-start gap-2 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
        Finance records are visible to admins only. New entries are attributed to the signed-in
        admin and appear in the history immediately.
      </p>

      {entryOpen && (
        <EntryModal onClose={() => setEntryOpen(false)} onSave={saveTransaction} />
      )}

      {notice && (
        <div className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96">
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-3 shadow-xl dark:border-emerald-500/25 dark:bg-slate-900"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircleIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{notice.message}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {notice.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

function FilterSelect({ id, label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none truncate rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:w-auto dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

type FilterChipProps = {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
};

function FilterChip({ active, label, count, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 touch-manipulation items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors",
        active
          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
          active
            ? "bg-white/20 text-white"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold",
        meta.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

type EntryModalProps = {
  onClose: () => void;
  onSave: (transaction: NewTransaction) => void;
};

function EntryModal({ onClose, onSave }: EntryModalProps) {
  const [category, setCategory] = useState<Category>("sunday-offering");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [method, setMethod] = useState<Method>("Cash");
  const [giver, setGiver] = useState("");
  const [note, setNote] = useState("");

  const parsedAmount = Number.parseFloat(amount);
  const roundedAmount = Math.round(parsedAmount);
  const validAmount = Number.isFinite(parsedAmount) && roundedAmount > 0;

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validAmount) return;

    onSave({
      category,
      amount: roundedAmount,
      date,
      method,
      giver: giver.trim() || "Anonymous",
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cancel new transaction"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:m-4 sm:rounded-3xl sm:p-6 sm:pb-6 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <FinanceIcon className="h-3.5 w-3.5" />
              New entry
            </p>
            <h2 id="entry-title" className="mt-1 text-xl font-bold tracking-tight">
              Log a transaction
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Record giving against one of the four collection categories.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close new transaction"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <fieldset>
            <legend className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Offering Category
            </legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {CATEGORY_ORDER.map((option) => {
                const meta = CATEGORY_META[option];
                const selected = category === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCategory(option)}
                    aria-pressed={selected}
                    className={cn(
                      "flex touch-manipulation items-center gap-2 rounded-xl border p-2.5 text-left transition-colors",
                      selected
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-500/10"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        meta.icon,
                      )}
                    >
                      <CategoryGlyph category={option} className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 truncate text-xs font-semibold">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="entry-amount"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Amount (₦)
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                  ₦
                </span>
                <input
                  id="entry-amount"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  autoFocus
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-lg font-bold tabular-nums outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="entry-date"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Date
              </label>
              <input
                id="entry-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="entry-method"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Payment method
              </label>
              <div className="relative mt-1">
                <select
                  id="entry-method"
                  value={method}
                  onChange={(event) => setMethod(event.target.value as Method)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
                >
                  {METHODS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <label
                htmlFor="entry-giver"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Giver / source
              </label>
              <input
                id="entry-giver"
                type="text"
                value={giver}
                onChange={(event) => setGiver(event.target.value)}
                placeholder="Anonymous"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div className="mt-3">
            <label
              htmlFor="entry-note"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Note <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span>
            </label>
            <textarea
              id="entry-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="e.g. First service, Christmas programme"
              className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:focus:bg-slate-900"
            />
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              GO
            </span>
            <span>
              Recorded by{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Grace Okafor
              </span>{" "}
              · Admin
            </span>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 touch-manipulation rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validAmount}
              className={cn(
                "flex h-12 flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
                validAmount
                  ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
              )}
            >
              <PlusIcon className="h-4 w-4" />
              {validAmount ? `Record ${formatCurrency(roundedAmount)}` : "Enter an amount"}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
            Leave the giver blank to record the entry as Anonymous.
          </p>
        </form>
      </div>
    </div>
  );
}
