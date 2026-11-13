"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  CloseIcon,
  FamilyIcon,
  GridIcon,
  ListIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { PaginationFooter } from "@/components/pagination";
import { cn } from "@/lib/cn";
import { useChildren, useCohorts, type Child, type Guardian } from "@/lib/children-store";

const PAGE_SIZE = 10;

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
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [currentPage, setCurrentPage] = useState(1);

  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setCurrentPage(1);
  }

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

  const totalPages = Math.max(1, Math.ceil(filteredFamilies.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedFamilies = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return filteredFamilies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredFamilies, safePage]);

  const startEntry = filteredFamilies.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(safePage * PAGE_SIZE, filteredFamilies.length);

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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Registered Households
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                  {startEntry}–{endEntry}
                </span>{" "}
                of{" "}
                <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                  {filteredFamilies.length}
                </span>{" "}
                {filteredFamilies.length === 1 ? "family" : "families"}
                {totalPages > 1 && (
                  <>
                    {" "}
                    · Page{" "}
                    <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                      {safePage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                      {totalPages}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* View Mode Toggle: Cards / List */}
            <div
              role="group"
              aria-label="View layout"
              className="inline-flex h-9 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-700/80 dark:bg-slate-800/80"
            >
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                aria-pressed={viewMode === "cards"}
                aria-label="Cards view"
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500",
                  viewMode === "cards"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                <GridIcon className="h-4 w-4" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                aria-label="List view"
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500",
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                )}
              >
                <ListIcon className="h-4 w-4" />
                <span>List</span>
              </button>
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
        ) : viewMode === "cards" ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {paginatedFamilies.map((family) => (
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Household
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Primary Contact
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Guardians & Pick-Up Rights
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Enrolled Children
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Safety Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedFamilies.map((family) => {
                  const hasRestricted = family.guardians.some((g) => !g.authorized);

                  return (
                    <tr
                      key={family.familyName}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-xs text-indigo-700 ring-1 ring-indigo-500/15 dark:bg-indigo-500/10 dark:text-indigo-300">
                            {initials(family.familyName)}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                              {family.familyName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {family.children.length} {family.children.length === 1 ? "child" : "children"} enrolled
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        {family.primaryPhone ? (
                          <a
                            href={`tel:${family.primaryPhone}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <PhoneIcon className="h-3 w-3 text-slate-400" />
                            {family.primaryPhone}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <ul className="flex flex-col gap-1.5">
                          {family.guardians.map((guardian) => (
                            <li
                              key={guardian.name}
                              className="inline-flex items-center gap-2 text-xs"
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 shrink-0 rounded-full",
                                  guardian.authorized ? "bg-emerald-500" : "bg-rose-500",
                                )}
                              />
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {guardian.name}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                ({guardian.relation})
                              </span>
                              {guardian.authorized ? (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                                  Auth
                                </span>
                              ) : (
                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-semibold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300">
                                  Restricted
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {family.children.map((child) => {
                            const cohort = cohorts.find((c) => c.id === child.classId);
                            return (
                              <span
                                key={child.id}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700/80"
                              >
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  {child.name}
                                </span>
                                <span className="text-slate-400">·</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {cohort?.name || `${child.age}y`}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        {hasRestricted ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Restricted Guardian
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                            <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            Clear for Release
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredFamilies.length > 0 && (
          <PaginationFooter
            startEntry={startEntry}
            endEntry={endEntry}
            totalEntries={filteredFamilies.length}
            singularLabel="family"
            pluralLabel="families"
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            ariaLabel="Families directory pagination"
          />
        )}
      </section>
    </div>
  );
}

