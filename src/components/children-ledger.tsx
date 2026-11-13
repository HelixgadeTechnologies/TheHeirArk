"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  AlertTriangleIcon,
  CloseIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import {
  INITIAL_COHORTS,
  useChildren,
  useCohorts,
  type Child,
  type Cohort,
  type Status,
} from "@/lib/children-store";

const STATUS_META: Record<Status, { label: string; badge: string }> = {
  expected: {
    label: "Expected",
    badge:
      "bg-slate-100 text-slate-700 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  },
  "checked-in": {
    label: "In class",
    badge:
      "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  },
  "checked-out": {
    label: "Checked out",
    badge:
      "bg-violet-50 text-violet-800 ring-1 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function cohortById(cohorts: Cohort[], classId: string) {
  return cohorts.find((cohort) => cohort.id === classId) ?? null;
}

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        meta.badge,
      )}
    >
      {meta.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  hint,
  dot,
  valueClass,
}: {
  label: string;
  value: number | string;
  hint: string;
  dot: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dot)} />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {label}
        </p>
      </div>
      <p className={cn("mt-2 text-2xl font-bold tabular-nums sm:text-3xl", valueClass)}>
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

type ChildCardProps = {
  child: Child;
  cohort: Cohort | null;
};

function ChildCard({ child, cohort }: ChildCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border p-4.5 transition-colors",
        child.status === "checked-in"
          ? "border-emerald-300/80 bg-white dark:border-emerald-500/30 dark:bg-slate-900/90"
          : "border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1 ring-inset ring-black/5 dark:ring-white/10",
            cohort?.tone.icon ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
          )}
        >
          {initials(child.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100">{child.name}</h3>
            <StatusBadge status={child.status} />
          </div>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {child.age} yrs · {cohort?.name ?? "Unassigned"}
          </p>
          {(child.allergies || child.medicalNotes) && (
            <p className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              <AlertTriangleIcon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              {child.allergies && <span>Allergy: {child.allergies}</span>}
              {child.allergies && child.medicalNotes && <span>·</span>}
              {child.medicalNotes && <span>Medical: {child.medicalNotes}</span>}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
        {child.status === "expected" && (
          <p>
            Drop-off:{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {child.guardians[0]?.name ?? "Guardian"}
            </span>
            {child.guardians[0] ? ` · ${child.guardians[0].relation}` : ""}
          </p>
        )}
        {child.status === "checked-in" && (
          <>
            <p>
              In at{" "}
              <span className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {child.arrivedAt}
              </span>
            </p>
            <p>
              Drop-off:{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {child.dropOffBy}
              </span>
            </p>
          </>
        )}
        {child.status === "checked-out" && (
          <>
            <p>
              In <span className="tabular-nums">{child.arrivedAt}</span> → out{" "}
              <span className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                {child.signedOutAt}
              </span>
            </p>
            <p>
              Picked up by{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {child.pickedUpBy}
              </span>
            </p>
          </>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Guardians
        </p>
        {child.guardians.map((guardian) => (
          <div key={guardian.name} className="flex items-center gap-2 text-xs leading-4">
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                guardian.authorized ? "bg-emerald-500" : "bg-rose-500",
              )}
            />
            <span className="min-w-0 flex-1 truncate font-medium text-slate-800 dark:text-slate-200">
              {guardian.name}
              <span className="text-slate-500 dark:text-slate-400">
                {" "}
                · {guardian.relation}
              </span>
            </span>
            {guardian.authorized ? (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                Authorized
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300">
                Not authorized
              </span>
            )}
            {guardian.phone && (
              <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">{guardian.phone}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-slate-100 pt-3 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {cohort ? `${cohort.lead} · ${cohort.assistant}` : "No teacher assigned"}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
          {cohort?.room ?? "Unassigned room"}
          {cohort && cohort.ageMax !== null
            ? ` · Ages ${cohort.ageMin}–${cohort.ageMax}`
            : cohort
              ? ` · Ages ${cohort.ageMin}+`
              : ""}
        </p>
      </div>
    </article>
  );
}

export function ChildrenLedger() {
  const children = useChildren();
  const cohorts = useCohorts();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQ = searchParams.get("q") ?? "";
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  const [query, setQuery] = useState(urlQ);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQuery(urlQ);
  }

  const search = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return children.filter((child) => {
      if (statusFilter !== "all" && child.status !== statusFilter) return false;
      if (!search) return true;

      const guardianNames = child.guardians
        .map((guardian) => guardian.name.toLowerCase())
        .join(" ");
      const flags = [child.allergies ?? "", child.medicalNotes ?? ""]
        .join(" ")
        .toLowerCase();

      return (
        child.name.toLowerCase().includes(search) ||
        guardianNames.includes(search) ||
        flags.includes(search)
      );
    });
  }, [children, statusFilter, search]);

  const counts = useMemo(() => {
    const map: Record<Status, number> = {
      expected: 0,
      "checked-in": 0,
      "checked-out": 0,
    };

    for (const child of children) {
      map[child.status] += 1;
    }

    return map;
  }, [children]);

  const metrics = [
    {
      label: "Total enrolled",
      value: children.length,
      hint: `Across ${INITIAL_COHORTS.length} age groups`,
      dot: "bg-indigo-500",
      valueClass: "text-indigo-700 dark:text-indigo-400",
    },
    {
      label: "In class now",
      value: counts["checked-in"],
      hint: "Checked in at service",
      dot: "bg-emerald-500",
      valueClass: "text-emerald-700 dark:text-emerald-400",
    },
    {
      label: "Checked out",
      value: counts["checked-out"],
      hint: "Picked up today",
      dot: "bg-violet-500",
      valueClass: "text-violet-700 dark:text-violet-400",
    },
    {
      label: "Expected",
      value: counts.expected,
      hint: "Awaiting arrival",
      dot: "bg-amber-500",
      valueClass: "text-amber-700 dark:text-amber-400",
    },
  ];

  const hasFilters = statusFilter !== "all" || search.trim() !== "";

  function clearFilters() {
    setStatusFilter("all");
    setQuery("");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Children & Rosters
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Child profiles, age-group assignments, guardian contact details, allergy safeguards, and live attendance status.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              Verified pick-up safeguards active
            </span>
            <button
              type="button"
              onClick={() => router.push("/children/add")}
              className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 active:scale-[0.99] sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Register child
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>

      <section
        aria-labelledby="children-history-title"
        className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900/90"
      >
        <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="children-history-title" className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Child Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{filtered.length}</span> of <span className="tabular-nums">{children.length}</span> children
                {statusFilter !== "all" && (
                  <>
                    {" "}
                    · filtered by <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {STATUS_META[statusFilter].label}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <label htmlFor="child-search" className="sr-only">
                Search children or guardians
              </label>
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                id="child-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by child, guardian, phone or allergy…"
                autoComplete="off"
                enterKeyHint="search"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="-mx-1 flex flex-1 gap-2 overflow-x-auto px-1 pb-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  aria-pressed={statusFilter === "all"}
                  className={cn(
                    "inline-flex h-10 min-h-[40px] shrink-0 touch-manipulation items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                    statusFilter === "all"
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  All
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                      statusFilter === "all"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                    )}
                  >
                    {children.length}
                  </span>
                </button>
                {(Object.keys(STATUS_META) as Status[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    aria-pressed={statusFilter === status}
                    className={cn(
                      "inline-flex h-10 min-h-[40px] shrink-0 touch-manipulation items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                      statusFilter === status
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                    )}
                  >
                    {STATUS_META[status].label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                        statusFilter === status
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                      )}
                    >
                      {counts[status]}
                    </span>
                  </button>
                ))}
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-[40px] items-center shrink-0 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
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
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No children match</p>
            <p className="max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
              Try another child or guardian name, phone number, or clear active filters.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 h-10 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3.5 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filtered.map((child) => {
              const cohort = cohortById(cohorts, child.classId);

              return <ChildCard key={child.id} child={child} cohort={cohort} />;
            })}
          </div>
        )}
      </section>

      <p className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs leading-5 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
        <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        Guardians flagged as unauthorized cannot be used for child pick-up verification at the kiosk under any circumstances.
      </p>
    </div>
  );
}
