"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  "checked-in": {
    label: "In class",
    badge:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  "checked-out": {
    label: "Checked out",
    badge:
      "bg-violet-50 text-violet-700 ring-1 ring-violet-600/10 dark:bg-violet-500/10 dark:text-violet-300",
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
        "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold",
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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dot)} />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums sm:text-3xl", valueClass)}>
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
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
        "flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900",
        child.status === "checked-in"
          ? "border-emerald-200/80 dark:border-emerald-500/25"
          : "border-slate-200/80 dark:border-slate-800",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
            cohort?.tone.icon ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
          )}
        >
          {initials(child.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <h3 className="break-words text-sm font-semibold leading-5">{child.name}</h3>
            <StatusBadge status={child.status} />
          </div>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {child.age} yrs · {cohort?.name ?? "Unassigned"}
          </p>
          {(child.allergies || child.medicalNotes) && (
            <p className="mt-2 flex flex-wrap items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <AlertTriangleIcon className="h-3 w-3 shrink-0" />
              {child.allergies && <span>Allergy: {child.allergies}</span>}
              {child.allergies && child.medicalNotes && <span>·</span>}
              {child.medicalNotes && <span>Medical: {child.medicalNotes}</span>}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
        {child.status === "expected" && (
          <p>
            Drop-off:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {child.guardians[0]?.name ?? "Guardian"}
            </span>
            {child.guardians[0] ? ` · ${child.guardians[0].relation}` : ""}
          </p>
        )}
        {child.status === "checked-in" && (
          <>
            <p>
              In at{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {child.arrivedAt}
              </span>
            </p>
            <p>
              Drop-off:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {child.dropOffBy}
              </span>
            </p>
          </>
        )}
        {child.status === "checked-out" && (
          <>
            <p>
              In {child.arrivedAt} → out{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {child.signedOutAt}
              </span>
            </p>
            <p>
              Picked up by{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {child.pickedUpBy}
              </span>
            </p>
          </>
        )}
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Guardians
        </p>
        {child.guardians.map((guardian) => (
          <div key={guardian.name} className="flex items-center gap-2 text-[11px] leading-4">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                guardian.authorized ? "bg-emerald-500" : "bg-rose-500",
              )}
            />
            <span className="min-w-0 flex-1 truncate font-medium">
              {guardian.name}
              <span className="text-slate-500 dark:text-slate-400">
                {" "}
                · {guardian.relation}
              </span>
            </span>
            {guardian.authorized ? (
              <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                Authorized
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                Not authorized
              </span>
            )}
            {guardian.phone && (
              <span className="shrink-0 text-slate-500 dark:text-slate-400">{guardian.phone}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {cohort ? `${cohort.lead} leads · ${cohort.assistant} assists` : "No teacher assigned"}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

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
      valueClass: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "In class now",
      value: counts["checked-in"],
      hint: "Checked in at the service",
      dot: "bg-emerald-500",
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Checked out",
      value: counts["checked-out"],
      hint: "Picked up today",
      dot: "bg-violet-500",
      valueClass: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Expected",
      value: counts.expected,
      hint: "Awaiting arrival",
      dot: "bg-amber-500",
      valueClass: "text-amber-600 dark:text-amber-400",
    },
  ];

  const hasFilters = statusFilter !== "all" || search.trim() !== "";

  function clearFilters() {
    setStatusFilter("all");
    setQuery("");
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Sunday · Children&apos;s church
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Children</h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Child profiles, age-group rosters, guardian details, allergies, and today&apos;s
              attendance in one place.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
              Admin-only roster
            </span>
            <button
              type="button"
              onClick={() => router.push("/children/add")}
              className="inline-flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 active:scale-[0.99] sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Add child
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>

      <section
        aria-labelledby="children-history-title"
        className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="children-history-title" className="text-base font-bold tracking-tight">
                Child roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filtered.length} of {children.length} children
                {statusFilter !== "all" && (
                  <>
                    {" "}
                    · <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {STATUS_META[statusFilter].label}
                    </span>
                  </>
                )}
              </p>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Sorted by roster order
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <label htmlFor="child-search" className="sr-only">
                Search children or guardians
              </label>
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="child-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search child or guardian…"
                autoComplete="off"
                enterKeyHint="search"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
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
                    "inline-flex h-9 shrink-0 touch-manipulation items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors",
                    statusFilter === "all"
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  All
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                      statusFilter === "all"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
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
                      "inline-flex h-9 shrink-0 touch-manipulation items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors",
                      statusFilter === status
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                    )}
                  >
                    {STATUS_META[status].label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                        statusFilter === status
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
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
            <p className="text-sm font-semibold">No children match</p>
            <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              Try another child, guardian, or allergy name, or clear the current filter.
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
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filtered.map((child) => {
              const cohort = cohortById(cohorts, child.classId);

              return <ChildCard key={child.id} child={child} cohort={cohort} />;
            })}
          </div>
        )}
      </section>

      <p className="flex items-start gap-2 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
        Child profiles are visible to admins and leaders. Guardians flagged as unauthorized cannot be
        used for pick-up confirmation at the kiosk.
      </p>
    </div>
  );
}
