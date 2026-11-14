"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertTriangleIcon,
  CheckCircleIcon,
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
import { useChildren, useCohorts } from "@/lib/children-store";
import { cn } from "@/lib/cn";
import {
  addFamily,
  addSpouseOrGuardian,
  useFamilies,
  type Family,
  type GuardianRelation,
} from "@/lib/family-store";

const PAGE_SIZE = 10;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function FamiliesDirectory() {
  const families = useFamilies();
  const children = useChildren();
  const cohorts = useCohorts();

  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Feedback
  const [addFamilyOpen, setAddFamilyOpen] = useState(false);
  const [addSpouseFamily, setAddSpouseFamily] = useState<Family | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setCurrentPage(1);
  }

  // Combine families with enrolled children
  const enrichedFamilies = useMemo(() => {
    return families.map((family) => {
      const familyChildren = children.filter((child) => {
        if (child.familyId && child.familyId === family.id) {
          return true;
        }
        // Fallback to name/guardian matching
        return family.members.some((member) =>
          child.guardians.some((g) => g.name.toLowerCase() === member.name.toLowerCase()),
        );
      });

      return {
        ...family,
        children: familyChildren,
      };
    });
  }, [families, children]);

  const search = query.trim().toLowerCase();

  const filteredFamilies = useMemo(() => {
    if (!search) return enrichedFamilies;

    return enrichedFamilies.filter((family) => {
      const matchName = family.familyName.toLowerCase().includes(search);
      const matchSurname = family.surname.toLowerCase().includes(search);
      const matchMember = family.members.some(
        (m) => m.name.toLowerCase().includes(search) || m.phone.includes(search),
      );
      const matchChild = family.children.some((c) => c.name.toLowerCase().includes(search));

      return matchName || matchSurname || matchMember || matchChild;
    });
  }, [enrichedFamilies, search]);

  const totalPages = Math.max(1, Math.ceil(filteredFamilies.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedFamilies = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return filteredFamilies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredFamilies, safePage]);

  const startEntry = filteredFamilies.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(safePage * PAGE_SIZE, filteredFamilies.length);

  const totalMembers = useMemo(() => {
    let count = 0;
    for (const f of families) {
      count += f.members.length;
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
              Connected family households, spouses and co-guardians, emergency telephone contacts, and sibling rosters.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
              Verified pick-up authorizations
            </span>
            <button
              type="button"
              onClick={() => setAddFamilyOpen(true)}
              className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 active:scale-[0.99] sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Add family first
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl border p-3.5 sm:px-4",
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200"
                : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200",
            )}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium sm:text-sm">
              {feedback.type === "success" ? (
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangleIcon className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )}

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
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Registered households</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Enrolled Children</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-700 sm:text-3xl dark:text-emerald-400">
              {children.length}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Connected to families</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 dark:border-slate-800/90 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Parents & Spouses</p>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-violet-700 sm:text-3xl dark:text-violet-400">
              {totalMembers}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Registered guardians</p>
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
              placeholder="Search by family surname, spouse/parent name, child or phone number…"
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
              Register a family household first, or search by another surname.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAddFamilyOpen(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <PlusIcon className="h-4 w-4" />
                Register new family
              </button>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="h-10 rounded-xl bg-slate-100 px-4 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {paginatedFamilies.map((family) => {
              return (
                <article
                  key={family.id}
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
                      <a
                        href={`tel:${family.primaryPhone}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <PhoneIcon className="h-3 w-3 text-slate-400" />
                        {family.primaryPhone}
                      </a>
                    )}
                  </div>

                  {/* Parents & Spouses List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Parents & Spouses
                      </p>
                      <button
                        type="button"
                        onClick={() => setAddSpouseFamily(family)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <PlusIcon className="h-3 w-3" />
                        Add spouse
                      </button>
                    </div>

                    <ul className="space-y-1.5">
                      {family.members.map((member) => (
                        <li key={member.id} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 shrink-0 rounded-full",
                                member.defaultAuthorized ? "bg-emerald-500" : "bg-rose-500",
                              )}
                            />
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {member.name}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              ({member.relation})
                            </span>
                            {member.isPrimary && (
                              <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                Primary
                              </span>
                            )}
                            {member.isSpouse && (
                              <span className="rounded bg-indigo-50 px-1 py-0.2 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                                Spouse
                              </span>
                            )}
                          </span>
                          {member.defaultAuthorized ? (
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
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Children in The Ark
                      </p>
                      <Link
                        href={`/children/add?familyId=${family.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        <PlusIcon className="h-3 w-3" />
                        Add child
                      </Link>
                    </div>

                    {family.children.length === 0 ? (
                      <p className="text-xs italic text-slate-400">No children linked yet.</p>
                    ) : (
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
                    )}
                  </div>
                </article>
              );
            })}
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
                    Spouse & Guardians
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedFamilies.map((family) => {
                  return (
                    <tr
                      key={family.id}
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
                          {family.members.map((member) => (
                            <li
                              key={member.id}
                              className="inline-flex items-center gap-2 text-xs"
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 shrink-0 rounded-full",
                                  member.defaultAuthorized ? "bg-emerald-500" : "bg-rose-500",
                                )}
                              />
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {member.name}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                ({member.relation})
                              </span>
                              {member.isSpouse && (
                                <span className="rounded bg-indigo-50 px-1 py-0.2 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                                  Spouse
                                </span>
                              )}
                              {member.defaultAuthorized ? (
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
                          {family.children.length === 0 ? (
                            <span className="text-xs italic text-slate-400">None enrolled</span>
                          ) : (
                            family.children.map((child) => {
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
                            })
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAddSpouseFamily(family)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <PlusIcon className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Add Spouse</span>
                          </button>
                          <Link
                            href={`/children/add?familyId=${family.id}`}
                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-indigo-50 px-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                          >
                            <span>Add Child</span>
                          </Link>
                        </div>
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

      {/* Add Family Modal */}
      {addFamilyOpen && (
        <AddFamilyModal
          onClose={() => setAddFamilyOpen(false)}
          onSaved={(newFam) => {
            setFeedback({
              type: "success",
              message: `Registered ${newFam.familyName}! You can now add a spouse or register children.`,
            });
            setAddFamilyOpen(false);
          }}
        />
      )}

      {/* Add Spouse / Co-Guardian Modal */}
      {addSpouseFamily && (
        <AddSpouseModal
          family={addSpouseFamily}
          onClose={() => setAddSpouseFamily(null)}
          onSaved={(spouseName) => {
            setFeedback({
              type: "success",
              message: `Added ${spouseName} as spouse to ${addSpouseFamily.familyName}.`,
            });
            setAddSpouseFamily(null);
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// Add Family Modal
// -------------------------------------------------------------------------------------------------
type AddFamilyModalProps = {
  onClose: () => void;
  onSaved: (family: Family) => void;
};

function AddFamilyModal({ onClose, onSaved }: AddFamilyModalProps) {
  const [surname, setSurname] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [primaryName, setPrimaryName] = useState("");
  const [relation, setRelation] = useState<GuardianRelation>("Father");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSurnameChange(val: string) {
    setSurname(val);
    if (!familyName || familyName.endsWith(" Household")) {
      setFamilyName(val ? `${val.trim()} Household` : "");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!surname.trim()) {
      setError("Please enter the family surname.");
      return;
    }
    if (!primaryName.trim()) {
      setError("Please enter the primary parent / guardian's name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter a primary telephone contact.");
      return;
    }

    const created = addFamily({
      surname: surname.trim(),
      familyName: familyName.trim() || `${surname.trim()} Household`,
      primaryGuardianName: primaryName.trim(),
      primaryRelation: relation,
      primaryPhone: phone.trim(),
      primaryEmail: email.trim() || undefined,
      address: address.trim() || undefined,
    });

    onSaved(created);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-family-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:m-4 sm:rounded-3xl sm:p-6 sm:pb-6 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2
              id="add-family-title"
              className="text-base font-bold text-slate-900 dark:text-slate-100"
            >
              Register Family Household First
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Establish the primary family household before registering spouse and children.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertTriangleIcon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="fam-surname"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Family Surname *
              </label>
              <input
                id="fam-surname"
                type="text"
                required
                value={surname}
                onChange={(e) => handleSurnameChange(e.target.value)}
                placeholder="e.g. Balogun"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="fam-name"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Household Name
              </label>
              <input
                id="fam-name"
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. Balogun Household"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Primary Guardian / Head of Household
            </p>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="pri-name"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Full Name *
                  </label>
                  <input
                    id="pri-name"
                    type="text"
                    required
                    value={primaryName}
                    onChange={(e) => setPrimaryName(e.target.value)}
                    placeholder="e.g. Adebayo Balogun"
                    className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pri-rel"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Relationship *
                  </label>
                  <select
                    id="pri-rel"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as GuardianRelation)}
                    className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="pri-phone"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Telephone Number *
                  </label>
                  <input
                    id="pri-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pri-email"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </label>
                  <input
                    id="pri-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="fam-address"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Home Address / Area (Optional)
            </label>
            <input
              id="fam-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 14 Jubilee Crescent, Lekki"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Register Family</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
// Add Spouse / Co-Guardian Modal
// -------------------------------------------------------------------------------------------------
type AddSpouseModalProps = {
  family: Family;
  onClose: () => void;
  onSaved: (spouseName: string) => void;
};

function AddSpouseModal({ family, onClose, onSaved }: AddSpouseModalProps) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState<GuardianRelation>("Mother");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [authorized, setAuthorized] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the spouse / guardian's full name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter a telephone contact.");
      return;
    }

    const res = addSpouseOrGuardian(family.id, {
      name: name.trim(),
      relation,
      phone: phone.trim(),
      email: email.trim() || undefined,
      isSpouse: true,
      defaultAuthorized: authorized,
    });

    if (!res.success) {
      setError(res.error || "Failed to add spouse.");
      return;
    }

    onSaved(name.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-spouse-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:m-4 sm:rounded-3xl sm:p-6 sm:pb-6 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2
              id="add-spouse-title"
              className="text-base font-bold text-slate-900 dark:text-slate-100"
            >
              Add Spouse / Co-Guardian
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Household: <strong className="font-semibold text-slate-800 dark:text-slate-200">{family.familyName}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertTriangleIcon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="spouse-name"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Full Name *
            </label>
            <input
              id="spouse-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Funmi Balogun"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="spouse-rel"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Relationship to Children *
              </label>
              <select
                id="spouse-rel"
                value={relation}
                onChange={(e) => setRelation(e.target.value as GuardianRelation)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Mother">Mother / Spouse</option>
                <option value="Father">Father / Spouse</option>
                <option value="Stepmother">Stepmother</option>
                <option value="Stepfather">Stepfather</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Aunt">Aunt</option>
                <option value="Uncle">Uncle</option>
                <option value="Legal Guardian">Legal Guardian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="spouse-phone"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Telephone Contact *
              </label>
              <input
                id="spouse-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="spouse-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Email Address (Optional)
            </label>
            <input
              id="spouse-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="spouse@example.com"
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Pick-up Authorization Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Child Pick-up Authorization
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Allow this spouse/guardian to check out children at the kiosk.
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700" />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Spouse to Household</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
