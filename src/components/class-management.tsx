"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangleIcon,
  ArrowLeftRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClassesIcon,
  CloseIcon,
  SearchIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";

type Tone = {
  icon: string;
  badge: string;
  bar: string;
  soft: string;
};

type Cohort = {
  id: string;
  name: string;
  ageMin: number;
  ageMax: number | null;
  room: string;
  capacity: number;
  lead: string;
  assistant: string;
  tone: Tone;
};

type Child = {
  id: string;
  name: string;
  age: number;
  classId: string;
  note?: string;
};

type Notice = {
  message: string;
  detail: string;
};

const TEACHERS = [
  "Grace Okafor",
  "Daniel Kim",
  "Ruth Mensah",
  "Samuel Adeyemi",
  "Sarah Mensah",
  "Tunde Adeyemi",
  "Hannah Reed",
  "Priya Patel",
];

const INITIAL_COHORTS: Cohort[] = [
  {
    id: "little-lights",
    name: "Little Lights",
    ageMin: 0,
    ageMax: 4,
    room: "Room 101 · Nursery",
    capacity: 12,
    lead: "Ruth Mensah",
    assistant: "Sarah Mensah",
    tone: {
      icon: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      badge:
        "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-300",
      bar: "bg-amber-500",
      soft: "bg-amber-50/60 dark:bg-amber-500/5",
    },
  },
  {
    id: "kingdom-kids",
    name: "Kingdom Kids",
    ageMin: 5,
    ageMax: 8,
    room: "Room 102 · Lower hall",
    capacity: 14,
    lead: "Grace Okafor",
    assistant: "Priya Patel",
    tone: {
      icon: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
      badge:
        "bg-sky-50 text-sky-700 ring-1 ring-sky-600/10 dark:bg-sky-500/10 dark:text-sky-300",
      bar: "bg-sky-500",
      soft: "bg-sky-50/60 dark:bg-sky-500/5",
    },
  },
  {
    id: "overcomers",
    name: "Overcomers",
    ageMin: 9,
    ageMax: 12,
    room: "Room 201 · Upper hall",
    capacity: 12,
    lead: "Daniel Kim",
    assistant: "Tunde Adeyemi",
    tone: {
      icon: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
      badge:
        "bg-violet-50 text-violet-700 ring-1 ring-violet-600/10 dark:bg-violet-500/10 dark:text-violet-300",
      bar: "bg-violet-500",
      soft: "bg-violet-50/60 dark:bg-violet-500/5",
    },
  },
  {
    id: "teens",
    name: "Teens",
    ageMin: 13,
    ageMax: null,
    room: "Youth hall · Main building",
    capacity: 16,
    lead: "Samuel Adeyemi",
    assistant: "Hannah Reed",
    tone: {
      icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      badge:
        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300",
      bar: "bg-emerald-500",
      soft: "bg-emerald-50/60 dark:bg-emerald-500/5",
    },
  },
];

const INITIAL_CHILDREN: Child[] = [
  // Little Lights · ages 0–4
  { id: "ava", name: "Ava Thompson", age: 3, classId: "little-lights" },
  { id: "zoe", name: "Zoe Kim", age: 4, classId: "little-lights", note: "Peanut allergy" },
  { id: "sophia", name: "Sophia Mensah", age: 4, classId: "little-lights" },
  { id: "levi", name: "Levi Osei", age: 2, classId: "little-lights" },
  { id: "amara", name: "Amara Nwosu", age: 1, classId: "little-lights" },
  { id: "kofi", name: "Kofi Boateng", age: 3, classId: "little-lights" },
  { id: "naomi", name: "Naomi Eze", age: 2, classId: "little-lights" },
  // Kingdom Kids · ages 5–8
  { id: "ella", name: "Ella Mensah", age: 6, classId: "kingdom-kids" },
  { id: "liam", name: "Liam Okafor", age: 7, classId: "kingdom-kids" },
  { id: "micah", name: "Micah Johnson", age: 5, classId: "kingdom-kids" },
  { id: "caleb", name: "Caleb Kim", age: 7, classId: "kingdom-kids" },
  { id: "elijah", name: "Elijah Bello", age: 8, classId: "kingdom-kids" },
  { id: "grace", name: "Grace Adeyemi", age: 8, classId: "kingdom-kids" },
  { id: "faith", name: "Faith Okonkwo", age: 6, classId: "kingdom-kids" },
  { id: "isaac", name: "Isaac Mensah", age: 5, classId: "kingdom-kids" },
  { id: "praise", name: "Praise Bello", age: 8, classId: "kingdom-kids", note: "Asthma inhaler" },
  // Overcomers · ages 9–12
  { id: "noah", name: "Noah Adeyemi", age: 9, classId: "overcomers" },
  { id: "isabella", name: "Isabella Grace", age: 10, classId: "overcomers" },
  { id: "maya", name: "Maya Patel", age: 12, classId: "overcomers" },
  { id: "ethan", name: "Ethan Okafor", age: 11, classId: "overcomers" },
  { id: "chidera", name: "Chidera Nwosu", age: 12, classId: "overcomers" },
  { id: "jason", name: "Jason Kim", age: 10, classId: "overcomers" },
  // Teens · ages 13+
  { id: "josiah", name: "Josiah Reed", age: 13, classId: "teens" },
  { id: "esther", name: "Esther Adeyemi", age: 14, classId: "teens" },
  { id: "michael", name: "Michael Osei", age: 15, classId: "teens" },
  { id: "rebecca", name: "Rebecca Mensah", age: 16, classId: "teens" },
  { id: "timothy", name: "Timothy Bello", age: 13, classId: "teens" },
  { id: "sarah", name: "Sarah Okonkwo", age: 17, classId: "teens" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function ageRangeLabel(cohort: Cohort) {
  return cohort.ageMax === null
    ? `Ages ${cohort.ageMin}+`
    : `Ages ${cohort.ageMin}–${cohort.ageMax}`;
}

function isMovingUp(child: Child, cohort: Cohort) {
  return cohort.ageMax !== null && child.age >= cohort.ageMax;
}

function countInClass(children: Child[], classId: string) {
  return children.filter((child) => child.classId === classId).length;
}

function nextCohortFor(child: Child, cohorts: Cohort[]) {
  const current = cohorts.find((cohort) => cohort.id === child.classId);
  if (!current || current.ageMax === null) return null;
  const currentMax = current.ageMax;
  return cohorts.find((cohort) => cohort.ageMin === currentMax + 1) ?? null;
}

export function ClassManagement() {
  const [cohorts, setCohorts] = useState<Cohort[]>(INITIAL_COHORTS);
  const [children, setChildren] = useState<Child[]>(INITIAL_CHILDREN);
  const [query, setQuery] = useState("");
  const [alertOnly, setAlertOnly] = useState(false);
  const [transferChild, setTransferChild] = useState<Child | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const search = query.trim().toLowerCase();

  const stats = useMemo(() => {
    const capacity = cohorts.reduce((total, cohort) => total + cohort.capacity, 0);
    let movingUp = 0;

    for (const child of children) {
      const cohort = cohorts.find((item) => item.id === child.classId);
      if (cohort && isMovingUp(child, cohort)) movingUp += 1;
    }

    return {
      enrolled: children.length,
      capacity,
      movingUp,
      fill: Math.round((children.length / capacity) * 100),
    };
  }, [children, cohorts]);

  function assignTeacher(cohortId: string, role: "lead" | "assistant", teacher: string) {
    const cohort = cohorts.find((item) => item.id === cohortId);
    if (!cohort) return;

    setCohorts((current) =>
      current.map((item) => (item.id === cohortId ? { ...item, [role]: teacher } : item)),
    );

    setNotice({
      message: `${teacher} is now ${role === "lead" ? "lead teacher" : "assistant"} for ${cohort.name}`,
      detail: `${cohort.room} · Ages ${cohort.ageMin}${cohort.ageMax === null ? "+" : `–${cohort.ageMax}`}`,
    });
  }

  function transferChildTo(child: Child, destinationId: string) {
    const destination = cohorts.find((cohort) => cohort.id === destinationId);
    if (!destination) return;

    setChildren((current) =>
      current.map((item) => (item.id === child.id ? { ...item, classId: destinationId } : item)),
    );
    setTransferChild(null);
    setNotice({
      message: `${child.name} moved to ${destination.name}`,
      detail: `${destination.room} · ${ageRangeLabel(destination)}`,
    });
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Sunday · Children&apos;s church
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Class management
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Four age-based cohorts with teacher assignments, live rosters, and alerts for
              children who have reached their class age limit.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <ClassesIcon className="h-4 w-4 text-indigo-500" />
            {stats.enrolled} children · {cohorts.length} cohorts
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Enrolled children" value={stats.enrolled} hint="Across all cohorts" dot="bg-indigo-500" valueClass="text-indigo-600 dark:text-indigo-400" />
          <MetricCard label="Active cohorts" value={cohorts.length} hint="Age 0 through teens" dot="bg-sky-500" valueClass="text-sky-600 dark:text-sky-400" />
          <MetricCard label="Moving up soon" value={stats.movingUp} hint="At the class age limit" dot="bg-amber-500" valueClass="text-amber-600 dark:text-amber-400" />
          <MetricCard label="Capacity used" value={`${stats.fill}%`} hint={`${stats.enrolled} of ${stats.capacity} seats`} dot="bg-emerald-500" valueClass="text-emerald-600 dark:text-emerald-400" />
        </div>

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 sm:items-center dark:border-emerald-500/25 dark:bg-emerald-500/10"
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm lg:flex-row lg:items-center dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <label htmlFor="roster-search" className="sr-only">
            Search children by name
          </label>
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="roster-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search children…"
            autoComplete="off"
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAlertOnly((value) => !value)}
            aria-pressed={alertOnly}
            className={cn(
              "inline-flex h-11 touch-manipulation items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors",
              alertOnly
                ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <AlertTriangleIcon className="h-4 w-4" />
            Moving up only
            {stats.movingUp > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  alertOnly
                    ? "bg-white/20 text-white"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
                )}
              >
                {stats.movingUp}
              </span>
            )}
          </button>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {stats.movingUp} approaching an age limit
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {cohorts.map((cohort) => {
          const allInClass = children.filter((child) => child.classId === cohort.id);
          const movingUp = allInClass.filter((child) => isMovingUp(child, cohort)).length;
          const roster = allInClass
            .filter((child) => !search || child.name.toLowerCase().includes(search))
            .filter((child) => !alertOnly || isMovingUp(child, cohort))
            .sort((a, b) => a.name.localeCompare(b.name));

          return (
            <ClassCard
              key={cohort.id}
              cohort={cohort}
              roster={roster}
              total={allInClass.length}
              movingUp={movingUp}
              filtered={Boolean(search) || alertOnly}
              onAssign={assignTeacher}
              onTransfer={setTransferChild}
            />
          );
        })}
      </div>

      <p className="flex items-start gap-2 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        Age-limit alerts flag children who have reached the oldest age in their current cohort.
        Use Transfer to move them into the next class.
      </p>

      {transferChild && (
        <TransferDialog
          key={transferChild.id}
          child={transferChild}
          cohorts={cohorts}
          allChildren={children}
          onClose={() => setTransferChild(null)}
          onConfirm={(destinationId) => transferChildTo(transferChild, destinationId)}
        />
      )}
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: number | string;
  hint: string;
  dot: string;
  valueClass: string;
};

function MetricCard({ label, value, hint, dot, valueClass }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dot)} />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
      <p className={cn("mt-1 text-3xl font-bold tabular-nums sm:text-4xl", valueClass)}>
        {value}
      </p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

type ClassCardProps = {
  cohort: Cohort;
  roster: Child[];
  total: number;
  movingUp: number;
  filtered: boolean;
  onAssign: (cohortId: string, role: "lead" | "assistant", teacher: string) => void;
  onTransfer: (child: Child) => void;
};

function ClassCard({
  cohort,
  roster,
  total,
  movingUp,
  filtered,
  onAssign,
  onTransfer,
}: ClassCardProps) {
  const fillPercent = Math.min(100, Math.round((total / cohort.capacity) * 100));

  return (
    <section
      aria-labelledby={`class-${cohort.id}-title`}
      className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className={cn("border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800", cohort.tone.soft)}>
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              cohort.tone.icon,
            )}
          >
            <ClassesIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id={`class-${cohort.id}-title`}
                className="text-lg font-bold tracking-tight"
              >
                {cohort.name}
              </h2>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  cohort.tone.badge,
                )}
              >
                {ageRangeLabel(cohort)}
              </span>
            </div>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{cohort.room}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold tabular-nums">
              {total}
              <span className="font-medium text-slate-500 dark:text-slate-400">/{cohort.capacity}</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              enrolled
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800"
            role="img"
            aria-label={`${total} of ${cohort.capacity} seats filled`}
          >
            <div
              className={cn("h-full rounded-full transition-[width] duration-300", cohort.tone.bar)}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <span>{cohort.capacity - total} seats available</span>
            {movingUp > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                <AlertTriangleIcon className="h-3 w-3" />
                {movingUp} moving up
              </span>
            ) : (
              <span>No age alerts</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <TeacherSelect
            id={`lead-${cohort.id}`}
            label="Lead teacher"
            value={cohort.lead}
            onChange={(teacher) => onAssign(cohort.id, "lead", teacher)}
          />
          <TeacherSelect
            id={`assistant-${cohort.id}`}
            label="Assistant"
            value={cohort.assistant}
            onChange={(teacher) => onAssign(cohort.id, "assistant", teacher)}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Roster
          </p>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {roster.length} of {total} shown
          </p>
        </div>

        {roster.length === 0 ? (
          <div className="mt-2 flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-slate-700">
            <SearchIcon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold">
              {filtered ? "No matching children" : "No children enrolled"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filtered
                ? "Try another name or clear the moving-up filter."
                : "Children added to this cohort will appear here."}
            </p>
          </div>
        ) : (
          <ul className="mt-1 divide-y divide-slate-100 dark:divide-slate-800">
            {roster.map((child) => {
              const alert = isMovingUp(child, cohort);

              return (
                <li key={child.id} className="flex items-center gap-2.5 py-2.5">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold",
                      cohort.tone.icon,
                    )}
                  >
                    {initials(child.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                      <p className="truncate text-sm font-semibold">{child.name}</p>
                      {alert && (
                        <span
                          title={`${child.name} has reached the oldest age in ${cohort.name} and can move up.`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 ring-1 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300"
                        >
                          <AlertTriangleIcon className="h-2.5 w-2.5" />
                          Moves up at {(cohort.ageMax ?? 0) + 1}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      Age {child.age}
                      {child.note ? ` · ${child.note}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTransfer(child)}
                    aria-label={`Transfer ${child.name} to another class`}
                    className="inline-flex h-9 shrink-0 touch-manipulation items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                  >
                    <ArrowLeftRightIcon className="h-3.5 w-3.5" />
                    <span className="hidden min-[380px]:inline">Transfer</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

type TeacherSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (teacher: string) => void;
};

function TeacherSelect({ id, label, value, onChange }: TeacherSelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>
      <div className="relative mt-1">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none truncate rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
        >
          {TEACHERS.map((teacher) => (
            <option key={teacher} value={teacher}>
              {teacher}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

type TransferDialogProps = {
  child: Child;
  cohorts: Cohort[];
  allChildren: Child[];
  onClose: () => void;
  onConfirm: (destinationId: string) => void;
};

function rangeWarning(age: number, cohort: Cohort) {
  if (age < cohort.ageMin) {
    return `Age ${age} is below the ${ageRangeLabel(cohort)} range for this class`;
  }
  if (cohort.ageMax !== null && age > cohort.ageMax) {
    return `Age ${age} is above the ${ageRangeLabel(cohort)} range for this class`;
  }
  return null;
}

function TransferDialog({
  child,
  cohorts,
  allChildren,
  onClose,
  onConfirm,
}: TransferDialogProps) {
  const current = cohorts.find((cohort) => cohort.id === child.classId);
  const [selected, setSelected] = useState<string | null>(() => {
    const next = nextCohortFor(child, cohorts);
    if (!next) return null;
    return countInClass(allChildren, next.id) < next.capacity ? next.id : null;
  });

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const destination = cohorts.find((cohort) => cohort.id === selected) ?? null;
  const options = cohorts.filter((cohort) => cohort.id !== child.classId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cancel class transfer"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:m-4 sm:rounded-3xl sm:p-6 sm:pb-6 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <ArrowLeftRightIcon className="h-3.5 w-3.5" />
              Class transfer
            </p>
            <h2 id="transfer-title" className="mt-1 text-xl font-bold tracking-tight">
              {child.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Age {child.age} · Currently in {current?.name ?? "Unassigned"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transfer dialog"
            autoFocus
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm font-semibold">Choose a destination class</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Full classes are disabled. A warning appears if the age falls outside the new cohort.
        </p>

        <div className="mt-3 space-y-2">
          {options.map((cohort) => {
            const occupancy = countInClass(allChildren, cohort.id);
            const isFull = occupancy >= cohort.capacity;
            const isSelected = selected === cohort.id;
            const warning = rangeWarning(child.age, cohort);

            return (
              <button
                key={cohort.id}
                type="button"
                disabled={isFull}
                onClick={() => setSelected(cohort.id)}
                aria-pressed={isSelected}
                className={cn(
                  "w-full touch-manipulation rounded-2xl border p-3 text-left transition-colors",
                  isFull
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70 dark:border-slate-800 dark:bg-slate-800/40"
                    : isSelected
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-500/10"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      cohort.tone.icon,
                    )}
                  >
                    <ClassesIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold">{cohort.name}</span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                          cohort.tone.badge,
                        )}
                      >
                        {ageRangeLabel(cohort)}
                      </span>
                      {isFull && (
                        <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                          Full
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {cohort.room} · {occupancy}/{cohort.capacity} enrolled
                    </p>
                    {!isFull && warning && (
                      <p className="mt-1.5 flex items-start gap-1 text-[11px] font-medium leading-4 text-amber-700 dark:text-amber-300">
                        <AlertTriangleIcon className="mt-0.5 h-3 w-3 shrink-0" />
                        {warning}
                      </p>
                    )}
                  </div>
                  {isSelected && !isFull && (
                    <CheckCircleIcon className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-300" />
                  )}
                </div>
              </button>
            );
          })}
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
            type="button"
            disabled={!destination}
            onClick={() => {
              if (destination) onConfirm(destination.id);
            }}
            className={cn(
              "flex h-12 flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
              destination
                ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:scale-[0.99]"
                : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
            )}
          >
            <ArrowLeftRightIcon className="h-4 w-4" />
            {destination ? `Move to ${destination.name}` : "Select a class"}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
          The roster, counters, and age alerts update as soon as the transfer is confirmed.
        </p>
      </div>
    </div>
  );
}
