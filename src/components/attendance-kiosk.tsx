"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  CheckCircleIcon,
  CloseIcon,
  GridIcon,
  KioskIcon,
  ListIcon,
  LogOutIcon,
  PhoneIcon,
  SearchIcon,
  ShieldCheckIcon,
  UserCheckIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/cn";

type ChildStatus = "expected" | "checked-in" | "checked-out";

type Guardian = {
  name: string;
  relation: string;
  phone: string;
  authorized: boolean;
};

type Child = {
  id: string;
  name: string;
  age: number;
  className: string;
  tone: string;
  guardians: Guardian[];
  status: ChildStatus;
  arrivedAt?: string;
  dropOffBy?: string;
  signedOutAt?: string;
  pickedUpBy?: string;
  note?: string;
};

const INITIAL_CHILDREN: Child[] = [
  {
    id: "ella",
    name: "Ella Mensah",
    age: 6,
    className: "Kingdom Kids",
    tone: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    guardians: [
      { name: "Sarah Mensah", relation: "Mother", phone: "(555) 014-4821", authorized: true },
      { name: "Kojo Mensah", relation: "Father", phone: "(555) 014-4822", authorized: false },
    ],
    status: "checked-in",
    arrivedAt: "9:04 AM",
    dropOffBy: "Sarah Mensah",
  },
  {
    id: "noah",
    name: "Noah Adeyemi",
    age: 9,
    className: "Overcomers",
    tone: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    guardians: [
      { name: "Tunde Adeyemi", relation: "Father", phone: "(555) 019-2210", authorized: true },
      { name: "Bisi Adeyemi", relation: "Mother", phone: "(555) 019-2211", authorized: true },
    ],
    status: "checked-in",
    arrivedAt: "9:07 AM",
    dropOffBy: "Tunde Adeyemi",
  },
  {
    id: "zoe",
    name: "Zoe Kim",
    age: 4,
    className: "Little Lambs",
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    guardians: [
      { name: "Daniel Kim", relation: "Father", phone: "(555) 032-7788", authorized: true },
      { name: "Anna Kim", relation: "Mother", phone: "(555) 032-7789", authorized: true },
    ],
    status: "checked-out",
    arrivedAt: "8:56 AM",
    dropOffBy: "Daniel Kim",
    signedOutAt: "9:12 AM",
    pickedUpBy: "Daniel Kim",
  },
  {
    id: "liam",
    name: "Liam Okafor",
    age: 7,
    className: "Kingdom Kids",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    guardians: [
      { name: "Grace Okafor", relation: "Mother", phone: "(555) 045-6632", authorized: true },
      { name: "Chidi Okafor", relation: "Father", phone: "(555) 045-6633", authorized: false },
    ],
    status: "checked-in",
    arrivedAt: "9:18 AM",
    dropOffBy: "Grace Okafor",
  },
  {
    id: "ava",
    name: "Ava Thompson",
    age: 3,
    className: "Little Lambs",
    tone: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    guardians: [
      { name: "Rachel Thompson", relation: "Mother", phone: "(555) 051-9044", authorized: true },
      { name: "Mark Thompson", relation: "Father", phone: "(555) 051-9045", authorized: true },
    ],
    status: "expected",
    note: "Peanut allergy",
  },
  {
    id: "micah",
    name: "Micah Johnson",
    age: 5,
    className: "Kingdom Kids",
    tone: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    guardians: [
      { name: "Marcus Johnson", relation: "Father", phone: "(555) 066-1170", authorized: true },
      { name: "Tasha Johnson", relation: "Mother", phone: "(555) 066-1171", authorized: true },
    ],
    status: "expected",
  },
  {
    id: "isabella",
    name: "Isabella Grace",
    age: 10,
    className: "Overcomers",
    tone: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    guardians: [
      { name: "Naomi Grace", relation: "Mother", phone: "(555) 072-3388", authorized: true },
      { name: "Peter Grace", relation: "Father", phone: "(555) 072-3389", authorized: false },
    ],
    status: "expected",
  },
  {
    id: "elijah",
    name: "Elijah Bello",
    age: 8,
    className: "Overcomers",
    tone: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
    guardians: [
      { name: "Funke Bello", relation: "Mother", phone: "(555) 081-5520", authorized: true },
      { name: "Kunle Bello", relation: "Father", phone: "(555) 081-5521", authorized: true },
    ],
    status: "expected",
  },
  {
    id: "sophia",
    name: "Sophia Mensah",
    age: 4,
    className: "Little Lambs",
    tone: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    guardians: [
      { name: "Sarah Mensah", relation: "Mother", phone: "(555) 014-4821", authorized: true },
      { name: "Kojo Mensah", relation: "Father", phone: "(555) 014-4822", authorized: false },
    ],
    status: "expected",
  },
  {
    id: "caleb",
    name: "Caleb Kim",
    age: 7,
    className: "Kingdom Kids",
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    guardians: [
      { name: "Daniel Kim", relation: "Father", phone: "(555) 032-7788", authorized: true },
      { name: "Anna Kim", relation: "Mother", phone: "(555) 032-7789", authorized: true },
    ],
    status: "expected",
  },
  {
    id: "maya",
    name: "Maya Patel",
    age: 12,
    className: "Torchbearers",
    tone: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    guardians: [
      { name: "Priya Patel", relation: "Mother", phone: "(555) 093-7712", authorized: true },
      { name: "Raj Patel", relation: "Father", phone: "(555) 093-7713", authorized: true },
    ],
    status: "expected",
  },
  {
    id: "josiah",
    name: "Josiah Reed",
    age: 13,
    className: "Torchbearers",
    tone: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    guardians: [
      { name: "Hannah Reed", relation: "Mother", phone: "(555) 104-8890", authorized: true },
      { name: "David Reed", relation: "Father", phone: "(555) 104-8891", authorized: false },
    ],
    status: "expected",
  },
];

const statusMeta: Record<ChildStatus, { label: string; badge: string }> = {
  expected: {
    label: "Expected",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
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

type Filter = "all" | ChildStatus;

type LastAction = {
  tone: "in" | "out";
  message: string;
  detail: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function AttendanceKiosk() {
  const { role } = useAuth();
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [checkoutChild, setCheckoutChild] = useState<Child | null>(null);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const counts = useMemo(() => {
    let present = 0;
    let out = 0;
    let expected = 0;

    for (const child of children) {
      if (child.status === "checked-in") present += 1;
      else if (child.status === "checked-out") out += 1;
      else expected += 1;
    }

    return { present, out, expected };
  }, [children]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return children.filter((child) => {
      if (filter !== "all" && child.status !== filter) return false;
      if (!search) return true;

      return (
        child.name.toLowerCase().includes(search) ||
        child.guardians.some((guardian) => guardian.name.toLowerCase().includes(search))
      );
    });
  }, [children, filter, query]);

  const filterOptions = useMemo(
    () => [
      { value: "all" as const, label: "All", count: children.length },
      { value: "expected" as const, label: "To check in", count: counts.expected },
      { value: "checked-in" as const, label: "In class", count: counts.present },
      { value: "checked-out" as const, label: "Checked out", count: counts.out },
    ],
    [children.length, counts],
  );

  const metrics = [
    {
      label: "Present now",
      value: counts.present,
      hint: "Checked in right now",
      dot: "bg-emerald-500",
      valueClass: "text-emerald-600 dark:text-emerald-400",
      live: true,
    },
    {
      label: "Checked out",
      value: counts.out,
      hint: "Signed out today",
      dot: "bg-violet-500",
      valueClass: "text-violet-600 dark:text-violet-400",
      live: false,
    },
    {
      label: "Still expected",
      value: counts.expected,
      hint: "Awaiting arrival",
      dot: "bg-amber-500",
      valueClass: "text-amber-600 dark:text-amber-400",
      live: false,
    },
    {
      label: "Total roster",
      value: children.length,
      hint: "On today's list",
      dot: "bg-indigo-500",
      valueClass: "text-indigo-600 dark:text-indigo-400",
      live: false,
    },
  ];

  function handleCheckIn(child: Child) {
    const time = formatTime(new Date());
    const dropOff = child.guardians[0];

    setChildren((current) =>
      current.map((item) =>
        item.id === child.id
          ? {
              ...item,
              status: "checked-in",
              arrivedAt: time,
              dropOffBy: dropOff.name,
              signedOutAt: undefined,
              pickedUpBy: undefined,
            }
          : item,
      ),
    );

    setLastAction({
      tone: "in",
      message: `${child.name} checked in at ${time}`,
      detail: `Drop-off recorded: ${dropOff.name} (${dropOff.relation})`,
    });
  }

  function handleCheckOut(child: Child, guardian: Guardian) {
    const time = formatTime(new Date());

    setChildren((current) =>
      current.map((item) =>
        item.id === child.id
          ? {
              ...item,
              status: "checked-out",
              signedOutAt: time,
              pickedUpBy: guardian.name,
            }
          : item,
      ),
    );

    setCheckoutChild(null);
    setLastAction({
      tone: "out",
      message: `${child.name} checked out at ${time}`,
      detail: `Verified pick-up: ${guardian.name} (${guardian.relation})`,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Check-in & Pick-up Kiosk
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Tap to check in arrivals. At pick-up, verify an authorized guardian before completing sign-out.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {role === "Admin" && (
              <Link
                href="/settings/teacher-attendance"
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 text-xs font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-100"
              >
                <UserCheckIcon className="h-4 w-4 text-indigo-600" />
                <span>Staff &amp; Teacher Sign-In</span>
              </Link>
            )}
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Kiosk live · Instant synchronization
            </div>
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
                aria-live={metric.live ? "polite" : undefined}
              >
                {metric.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.hint}</p>
            </div>
          ))}
        </div>

        {lastAction && (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-3 sm:items-center",
              lastAction.tone === "in"
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10"
                : "border-indigo-200 bg-indigo-50 dark:border-indigo-500/25 dark:bg-indigo-500/10",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                lastAction.tone === "in"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
              )}
            >
              {lastAction.tone === "in" ? (
                <KioskIcon className="h-4 w-4" />
              ) : (
                <LogOutIcon className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{lastAction.message}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {lastAction.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLastAction(null)}
              aria-label="Dismiss notification"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="sticky top-16 z-20 -mx-4 border-b border-slate-200/70 bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1">
              <label htmlFor="child-search" className="sr-only">
                Search child or parent name
              </label>
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="child-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search child or parent name…"
                autoComplete="off"
                enterKeyHint="search"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-base font-medium shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="text-xs font-medium text-slate-500 sm:text-right dark:text-slate-400">
                <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                  {filtered.length}
                </span>{" "}
                of <span className="tabular-nums">{children.length}</span> children
              </p>

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
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={cn(
                  "inline-flex h-10 shrink-0 touch-manipulation items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                  filter === option.value
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                    filter === option.value
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                  )}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <SearchIcon className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold">No matching children</p>
          <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            Try another child or parent name, or clear the current filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-2 h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Clear search
          </button>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onCheckIn={handleCheckIn}
              onCheckOut={setCheckoutChild}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Child
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Class Cohort
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Guardians & Contact
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Arrival / Pick-up Info
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((child) => {
                  const status = statusMeta[child.status];
                  const primary = child.guardians[0];

                  return (
                    <tr
                      key={child.id}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                              child.tone,
                            )}
                          >
                            {initials(child.name)}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {child.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{child.age} yrs</span>
                              {child.note && (
                                <>
                                  <span>·</span>
                                  <span className="font-medium text-amber-700 dark:text-amber-400">
                                    Allergy: {child.note}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            status.badge,
                          )}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {child.className}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {primary.name}
                          <span className="font-normal text-slate-500 dark:text-slate-400">
                            {" "}
                            ({primary.relation})
                          </span>
                        </p>
                        {primary.phone && (
                          <a
                            href={`tel:${primary.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                          >
                            <PhoneIcon className="h-3 w-3 text-slate-400" />
                            <span className="tabular-nums">{primary.phone}</span>
                          </a>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                        {child.status === "expected" && (
                          <span>
                            Awaiting drop-off by{" "}
                            <strong className="font-semibold text-slate-800 dark:text-slate-200">
                              {primary.name}
                            </strong>
                          </span>
                        )}
                        {child.status === "checked-in" && (
                          <span>
                            In at{" "}
                            <strong className="font-semibold text-slate-800 dark:text-slate-200">
                              {child.arrivedAt}
                            </strong>{" "}
                            · Drop-off: {child.dropOffBy}
                          </span>
                        )}
                        {child.status === "checked-out" && (
                          <span>
                            In {child.arrivedAt} → Out{" "}
                            <strong className="font-semibold text-slate-800 dark:text-slate-200">
                              {child.signedOutAt}
                            </strong>{" "}
                            · Pick-up: {child.pickedUpBy}
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        {child.status === "expected" ? (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(child)}
                            aria-label={`Check in ${child.name}`}
                            className="inline-flex h-9 touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-500 active:scale-[0.99]"
                          >
                            <KioskIcon className="h-4 w-4" />
                            Check in
                          </button>
                        ) : child.status === "checked-in" ? (
                          <button
                            type="button"
                            onClick={() => setCheckoutChild(child)}
                            aria-label={`Check out ${child.name}`}
                            className="inline-flex h-9 touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-indigo-500 active:scale-[0.99]"
                          >
                            <LogOutIcon className="h-4 w-4" />
                            Check out
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            Signed out ({child.signedOutAt})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {checkoutChild && (
        <CheckoutDialog
          child={checkoutChild}
          onClose={() => setCheckoutChild(null)}
          onConfirm={(guardian) => handleCheckOut(checkoutChild, guardian)}
        />
      )}
    </div>
  );
}

type ChildCardProps = {
  child: Child;
  onCheckIn: (child: Child) => void;
  onCheckOut: (child: Child) => void;
};

function ChildCard({ child, onCheckIn, onCheckOut }: ChildCardProps) {
  const status = statusMeta[child.status];
  const primary = child.guardians[0];

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm transition-colors dark:bg-slate-900",
        child.status === "checked-in"
          ? "border-emerald-200/80 dark:border-emerald-500/25"
          : "border-slate-200/80 dark:border-slate-800",
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
            child.tone,
          )}
        >
          {initials(child.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <h3 className="break-words text-sm font-semibold leading-5">{child.name}</h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                status.badge,
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {child.age} yrs · {child.className}
          </p>

          <div className="mt-2 space-y-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            {child.status === "expected" && (
              <p>
                Drop-off:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {primary.name}
                </span>{" "}
                · {primary.relation}
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
            {child.note && (
              <p className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                Allergies: {child.note}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto">
        {child.status === "expected" ? (
          <button
            type="button"
            onClick={() => onCheckIn(child)}
            aria-label={`Check in ${child.name}`}
            className="flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-500 active:scale-[0.99]"
          >
            <KioskIcon className="h-5 w-5" />
            Check in
          </button>
        ) : child.status === "checked-in" ? (
          <button
            type="button"
            onClick={() => onCheckOut(child)}
            aria-label={`Check out ${child.name}`}
            className="flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 active:scale-[0.99]"
          >
            <LogOutIcon className="h-5 w-5" />
            Check out
          </button>
        ) : (
          <div className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-50 text-xs font-semibold text-slate-400 dark:bg-slate-800/60 dark:text-slate-500">
            <CheckCircleIcon className="h-4 w-4" />
            Picked up at {child.signedOutAt}
          </div>
        )}
      </div>
    </article>
  );
}

type CheckoutDialogProps = {
  child: Child;
  onClose: () => void;
  onConfirm: (guardian: Guardian) => void;
};

function CheckoutDialog({ child, onClose, onConfirm }: CheckoutDialogProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedGuardian =
    child.guardians.find((guardian) => guardian.authorized && guardian.name === selected) ?? null;

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cancel check-out"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:m-4 sm:rounded-3xl sm:p-6 sm:pb-6 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              Verify pick-up
            </p>
            <h2 id="checkout-title" className="mt-1 text-xl font-bold tracking-tight">
              {child.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {child.age} yrs · {child.className}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close check-out"
            autoFocus
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Arrived {child.arrivedAt}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Drop-off: {child.dropOffBy}
          </span>
        </div>

        <p className="mt-5 text-sm font-semibold">Authorized pick-up contacts</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Only contacts approved by the family can sign this child out.
        </p>

        <div className="mt-3 space-y-2">
          {child.guardians.map((guardian) => {
            const isSelected = selected === guardian.name;

            return (
              <button
                key={guardian.name}
                type="button"
                disabled={!guardian.authorized}
                onClick={() => setSelected(guardian.name)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full touch-manipulation items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                  !guardian.authorized
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70 dark:border-slate-800 dark:bg-slate-800/40"
                    : isSelected
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-500/10"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    guardian.authorized
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
                  )}
                >
                  {initials(guardian.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{guardian.name}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    {guardian.relation}
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <PhoneIcon className="h-3 w-3 shrink-0" />
                    {guardian.phone}
                  </span>
                </span>
                {guardian.authorized ? (
                  isSelected ? (
                    <CheckCircleIcon className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-300" />
                  ) : (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Authorized
                    </span>
                  )
                ) : (
                  <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                    Not authorized
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <button
            type="button"
            disabled={!selectedGuardian}
            onClick={() => {
              if (selectedGuardian) onConfirm(selectedGuardian);
            }}
            className={cn(
              "flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-colors",
              selectedGuardian
                ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:scale-[0.99]"
                : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
            )}
          >
            <LogOutIcon className="h-5 w-5" />
            {selectedGuardian ? "Confirm pick-up" : "Select a pick-up contact"}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Sign-out time is recorded automatically when you confirm.
          </p>
        </div>
      </div>
    </div>
  );
}
