"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  CloseIcon,
  FamilyIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { useChildren, useCohorts, type Child, type Guardian } from "@/lib/children-store";

type Family = {
  familyName: string;
  guardians: Guardian[];
  children: Child[];
  primaryPhone: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function FamiliesDirectory() {
  const children = useChildren();
  const cohorts = useCohorts();
  const [query, setQuery] = useState("");

  const families = useMemo<Family[]>(() => {
    const familyMap = new Map<string, Family>();

    for (const child of children) {
      // Extract household surname from primary guardian or child
      const primaryGuardian = child.guardians[0];
      const guardianParts = primaryGuardian?.name.trim().split(" ") ?? [];
      const childParts = child.name.trim().split(" ");
      const surname = guardianParts.length > 1 ? guardianParts[guardianParts.length - 1] : childParts[childParts.length - 1] || "Family";

      if (!familyMap.has(surname)) {
        familyMap.set(surname, {
          familyName: `${surname} Household`,
          guardians: [...child.guardians],
          children: [child],
          primaryPhone: primaryGuardian?.phone || "",
        });
      } else {
        const existing = familyMap.get(surname)!;
        existing.children.push(child);
        // Merge guardians without duplicates
        for (const g of child.guardians) {
          if (!existing.guardians.some((ex) => ex.name.toLowerCase() === g.name.toLowerCase())) {
            existing.guardians.push(g);
          }
        }
      }
    }

    return Array.from(familyMap.values()).sort((a, b) => a.familyName.localeCompare(b.familyName));
  }, [children]);

  const search = query.trim().toLowerCase();

  const filteredFamilies = useMemo(() => {
    if (!search) return families;

    return families.filter((family) => {
      const matchName = family.familyName.toLowerCase().includes(search);
      const matchGuardian = family.guardians.some(
        (g) => g.name.toLowerCase().includes(search) || g.phone.includes(search),
      );
      const matchChild = family.children.some((c) => c.name.toLowerCase().includes(search));

      return matchName || matchGuardian || matchChild;
    });
  }, [families, search]);

  const totalGuardians = useMemo(() => {
    let count = 0;
    for (const f of families) {
      count += f.guardians.length;
    }
    return count;
  }, [families]);

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Family & Household Directory
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Connected family profiles, authorized guardians, emergency telephone numbers, and sibling rosters.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              Verified pick-up authorizations
            </span>
            <Link
              href="/children/add"
              className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 active:scale-[0.99] sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Register child or family
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Families</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-indigo-700 sm:text-3xl dark:text-indigo-400">
              {families.length}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active church households</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Children Enrolled</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-700 sm:text-3xl dark:text-emerald-400">
              {children.length}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Across 4 Sunday cohorts</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Registered Guardians</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-violet-700 sm:text-3xl dark:text-violet-400">
              {totalGuardians}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Parents & caregivers</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Average Siblings</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-amber-700 sm:text-3xl dark:text-amber-400">
              {families.length > 0 ? (children.length / families.length).toFixed(1) : 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Children per family</p>
          </div>
        </div>
      </div>

      {/* Directory Search & List */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900/90">
        <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Registered Households
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{filteredFamilies.length}</span> of <span className="tabular-nums">{families.length}</span> families
              </p>
            </div>
          </div>

          <div className="relative mt-4">
            <label htmlFor="family-search" className="sr-only">
              Search families by surname, guardian or child
            </label>
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              id="family-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by family surname, parent name, child or phone number…"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-900"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {filteredFamilies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <FamilyIcon className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No family households found</p>
            <p className="max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
              Try searching by another family name or phone number.
            </p>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-3 h-10 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {filteredFamilies.map((family) => (
              <article
                key={family.familyName}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4.5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-xs text-indigo-700 ring-1 ring-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-300">
                      {initials(family.familyName)}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {family.familyName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {family.children.length} {family.children.length === 1 ? "child" : "children"} enrolled
                      </p>
                    </div>
                  </div>
                  {family.primaryPhone && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <PhoneIcon className="h-3 w-3 text-slate-400" />
                      {family.primaryPhone}
                    </span>
                  )}
                </div>

                {/* Guardians */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Parents & Guardians
                  </p>
                  <ul className="space-y-1.5">
                    {family.guardians.map((guardian) => (
                      <li key={guardian.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 shrink-0 rounded-full",
                              guardian.authorized ? "bg-emerald-500" : "bg-rose-500",
                            )}
                          />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {guardian.name}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            ({guardian.relation})
                          </span>
                        </span>
                        {guardian.authorized ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                            Authorized
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-semibold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300">
                            Restricted
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Enrolled children */}
                <div className="mt-auto space-y-2 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Children in The Ark
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {family.children.map((child) => {
                      const cohort = cohorts.find((c) => c.id === child.classId);
                      return (
                        <div
                          key={child.id}
                          className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                        >
                          <span className="font-semibold">{child.name}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {child.age} yrs ({cohort?.name || "Unassigned"})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

