"use client";

import Link from "next/link";
import type { ComponentType } from "react";

import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CalendarIcon,
  ChildrenIcon,
  ClassesIcon,
  FamilyIcon,
  FinanceIcon,
  KioskIcon,
  PlusIcon,
  ShieldCheckIcon,
  SmileIcon,
  type IconProps,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white transition-all dark:border-slate-800/90 dark:bg-slate-900/90";

const toneStyles = {
  indigo:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 ring-1 ring-indigo-500/20",
  emerald:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 ring-1 ring-emerald-500/20",
  amber:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 ring-1 ring-amber-500/20",
  violet:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 ring-1 ring-violet-500/20",
  rose:
    "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 ring-1 ring-rose-500/20",
} as const;

type Tone = keyof typeof toneStyles;

const week = [
  { day: "Sun", value: 96, count: "96" },
  { day: "Mon", value: 34, count: "34" },
  { day: "Tue", value: 26, count: "26" },
  { day: "Wed", value: 58, count: "58" },
  { day: "Thu", value: 31, count: "31" },
  { day: "Fri", value: 22, count: "22" },
  { day: "Sat", value: 64, count: "64" },
];

const todaysClasses = [
  {
    name: "Little Lambs",
    range: "Ages 2–4",
    teacher: "Grace Okafor",
    time: "9:00 AM",
    present: 24,
    total: 28,
    tone: "bg-rose-50 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300",
  },
  {
    name: "Kingdom Kids",
    range: "Ages 5–7",
    teacher: "Daniel Kim",
    time: "9:00 AM",
    present: 31,
    total: 35,
    tone: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  {
    name: "Overcomers",
    range: "Ages 8–11",
    teacher: "Ruth Mensah",
    time: "10:30 AM",
    present: 27,
    total: 30,
    tone: "bg-amber-50 text-amber-800 ring-1 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    name: "Torchbearers",
    range: "Ages 12–14",
    teacher: "Samuel Adeyemi",
    time: "10:30 AM",
    present: 14,
    total: 18,
    tone: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
];

const birthdays = [
  {
    name: "Ella Mensah",
    age: 6,
    date: "Today",
    tone: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
  {
    name: "Noah Adeyemi",
    age: 9,
    date: "Tomorrow",
    tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  },
  {
    name: "Zoe Kim",
    age: 4,
    date: "Fri, Nov 6",
    tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  },
];

const checkIns = [
  { name: "Ella Mensah", guardian: "Sarah Mensah", time: "9:04 AM", status: "Checked in" },
  { name: "Noah Adeyemi", guardian: "Tunde Adeyemi", time: "9:07 AM", status: "Checked in" },
  { name: "Zoe Kim", guardian: "Daniel Kim", time: "9:12 AM", status: "Picked up" },
  { name: "Liam Okafor", guardian: "Grace Okafor", time: "9:18 AM", status: "Checked in" },
];

const kingdomKidsStudents = [
  { name: "Ella Mensah", age: "6 yrs", guardian: "Sarah Mensah (Mother)", status: "Present", alert: null },
  { name: "Noah Adeyemi", age: "6 yrs", guardian: "Tunde Adeyemi (Father)", status: "Present", alert: "Severe peanut allergy · Epipen in bag" },
  { name: "Zoe Kim", age: "5 yrs", guardian: "Daniel Kim (Father)", status: "Picked up", alert: "Asthma inhaler in outer pocket" },
  { name: "Tomiwa Balogun", age: "7 yrs", guardian: "Funke Balogun (Mother)", status: "Present", alert: null },
  { name: "Chinedu Eze", age: "6 yrs", guardian: "Amaka Eze (Mother)", status: "Expected", alert: "Gluten sensitive" },
];

const statusStyles: Record<string, string> = {
  "Checked in":
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Picked up":
    "bg-slate-100 text-slate-700 ring-1 ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  Present:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  Expected:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default function DashboardPage() {
  const { user, role } = useAuth();

  // Role-specific metrics configuration
  const adminStats: {
    label: string;
    value: string;
    hint: string;
    tone: Tone;
    icon: ComponentType<IconProps>;
  }[] = [
    { label: "Total Children", value: "128", hint: "+12 enrolled this month", tone: "indigo", icon: ChildrenIcon },
    { label: "Present Today", value: "96", hint: "75% active attendance", tone: "emerald", icon: KioskIcon },
    { label: "Active Classes", value: "8", hint: "Across 4 age groups", tone: "amber", icon: ClassesIcon },
    { label: "Weekly Giving", value: "₦245,000", hint: "+8.2% vs last Sunday", tone: "violet", icon: FinanceIcon },
  ];

  const leaderStats: {
    label: string;
    value: string;
    hint: string;
    tone: Tone;
    icon: ComponentType<IconProps>;
  }[] = [
    { label: "Total Children", value: "128", hint: "+12 enrolled this month", tone: "indigo", icon: ChildrenIcon },
    { label: "Present Today", value: "96", hint: "75% active attendance", tone: "emerald", icon: KioskIcon },
    { label: "Volunteer Teachers", value: "14", hint: "All classes staffed", tone: "amber", icon: ClassesIcon },
    { label: "Kiosks Active", value: "4", hint: "Front lobby & West hall", tone: "emerald", icon: ShieldCheckIcon },
  ];

  const teacherStats: {
    label: string;
    value: string;
    hint: string;
    tone: Tone;
    icon: ComponentType<IconProps>;
  }[] = [
    { label: "Class Enrolled", value: "35", hint: "Kingdom Kids (Ages 5–7)", tone: "indigo", icon: ChildrenIcon },
    { label: "Present in Class", value: "31", hint: "89% class attendance", tone: "emerald", icon: KioskIcon },
    { label: "Expected", value: "4", hint: "Arriving for 2nd service", tone: "amber", icon: CalendarIcon },
    { label: "Care Alerts", value: "3", hint: "Allergy & medical notes", tone: "rose", icon: AlertTriangleIcon },
  ];

  const currentStats =
    role === "Teacher" ? teacherStats : role === "Leader" ? leaderStats : adminStats;

  return (
    <div className="space-y-6">
      {/* Live Service Status Banner tailored to role */}
      <section className="relative overflow-hidden rounded-2xl border border-indigo-700/40 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 text-white shadow-sm sm:p-7 dark:border-indigo-500/30 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {role === "Teacher"
                ? "Kingdom Kids Classroom · Active"
                : role === "Leader"
                  ? "Ministry Operations & Safety · Active"
                  : "Sunday Morning Service · Active"}
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {role === "Teacher"
                ? `Welcome, ${user?.name ?? "Teacher"} — Kingdom Kids`
                : role === "Leader"
                  ? "Ministry Leadership & Volunteer Oversight"
                  : "Children's Church Administrative Overview"}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100/90">
              {role === "Teacher" ? (
                <>
                  Room 204 · <span className="font-semibold text-white tabular-nums">31 of 35</span> students checked in. Safety tags verified and 3 allergy flags flagged for attention.
                </>
              ) : role === "Leader" ? (
                <>
                  <span className="font-semibold text-white tabular-nums">96</span> children checked in across 8 classes. All 14 teachers on duty with active safety pick-up logs.
                </>
              ) : (
                <>
                  <span className="font-semibold text-white tabular-nums">96</span> children checked in across <span className="font-semibold text-white">8 classes</span>. Pick-up verification is active at all kiosks.
                </>
              )}
            </p>
          </div>

          {/* Role specific quick action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/attendance"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-indigo-900 shadow-sm transition-all hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
            >
              <KioskIcon className="h-4 w-4 text-indigo-600" />
              {role === "Teacher" ? "Class Check-in" : "Open Kiosk"}
            </Link>

            {role === "Admin" && (
              <>
                <Link
                  href="/children/add"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Register Child
                </Link>
                <Link
                  href="/finance"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
                >
                  <FinanceIcon className="h-4 w-4" />
                  Ledger
                </Link>
              </>
            )}

            {role === "Leader" && (
              <>
                <Link
                  href="/families"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
                >
                  <FamilyIcon className="h-4 w-4" />
                  Families Directory
                </Link>
                <Link
                  href="/children/add"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
                >
                  <PlusIcon className="h-4 w-4" />
                  Register Child
                </Link>
              </>
            )}

            {role === "Teacher" && (
              <Link
                href="/classes"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
              >
                <ClassesIcon className="h-4 w-4" />
                Class Roster
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Key metrics with tabular numerals */}
      <section aria-label="Key Metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {currentStats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(cardClass, "p-5 hover:border-slate-300 dark:hover:border-slate-700/80")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl tabular-nums dark:text-slate-50">
                    {stat.value}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    toneStyles[stat.tone],
                  )}
                >
                  <StatIcon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                {stat.hint}
              </p>
            </div>
          );
        })}
      </section>

      {/* Role specific dashboard layouts */}
      {role === "Teacher" ? (
        /* TEACHER DASHBOARD VIEW */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Today's Bible Lesson card */}
          <section className={cn(cardClass, "p-5 sm:p-6 lg:col-span-2")}>
            <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <SmileIcon className="h-3.5 w-3.5" />
                  Today&apos;s Curriculum · Unit 4
                </span>
                <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">
                  Lesson: The Good Shepherd
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Scripture: Psalm 23:1 · Luke 15:3–7
                </p>
              </div>
              <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Ages 5–7 Group
              </span>
            </header>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Memory Verse
                </p>
                <p className="mt-1 text-xs italic text-indigo-700 dark:text-indigo-300">
                  &ldquo;The Lord is my shepherd; I shall not want.&rdquo; — Psalm 23:1
                </p>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Action prompt: Have children recite with hand motions mimicking a shepherd&apos;s crook.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700/60 dark:bg-slate-800/40">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Classroom Craft Supplies
                </p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-xs text-slate-600 dark:text-slate-300">
                  <li>Cotton balls for sheep craft</li>
                  <li>Washable coloring markers</li>
                  <li>Paper plate masks & glue sticks</li>
                </ul>
              </div>
            </div>

            {/* Kingdom Kids Student Roster */}
            <div className="mt-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Kingdom Kids Class Roster & Care Notes
                </h4>
                <span className="text-xs font-medium text-slate-500">
                  Showing 5 of 35 students
                </span>
              </div>

              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {kingdomKidsStudents.map((student) => (
                  <li key={student.name} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {initials(student.name)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {student.name}
                          </p>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            ({student.age})
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {student.guardian}
                        </p>
                        {student.alert && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <AlertTriangleIcon className="h-3 w-3 shrink-0" />
                            {student.alert}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                          statusStyles[student.status],
                        )}
                      >
                        {student.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Right column: Class Birthdays & Kiosk Check */}
          <div className="space-y-6">
            <section className={cn(cardClass, "p-5 sm:p-6")}>
              <header className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Kingdom Kids Birthdays
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Celebrate with students today
                  </p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <CalendarIcon className="h-4 w-4" />
                </span>
              </header>

              <ul className="mt-4 space-y-3">
                {birthdays.map((birthday) => (
                  <li
                    key={birthday.name}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        birthday.tone,
                      )}
                    >
                      {initials(birthday.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {birthday.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Turning <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">{birthday.age}</span> · {birthday.date}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className={cn(cardClass, "p-5 sm:p-6")}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <ShieldCheckIcon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Kiosk Security Protocol
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Match pick-up security codes on guardian mobile passes before releasing any child at dismissal.
                  </p>
                  <Link
                    href="/attendance"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-400"
                  >
                    Verify child release <ArrowRightIcon className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : (
        /* ADMIN & LEADER DASHBOARD VIEW */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Weekly attendance */}
          <section className={cn(cardClass, "p-5 sm:p-6 lg:col-span-2")}>
            <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Weekly Attendance Rhythm
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Total daily attendance across all classes
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold tabular-nums text-indigo-700 ring-1 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                Avg 47 children / day
              </span>
            </header>

            <div className="mt-6 flex h-48 items-end gap-2.5 sm:gap-4">
              {week.map((entry) => (
                <div key={entry.day} className="group relative flex h-full flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 items-end overflow-hidden rounded-lg bg-slate-100/90 dark:bg-slate-800/60">
                    <div
                      className="w-full rounded-lg bg-indigo-600 transition-all duration-300 group-hover:bg-indigo-500 dark:bg-indigo-500 dark:group-hover:bg-indigo-400"
                      style={{ height: `${entry.value}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider text-slate-600 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-300">
                    {entry.day}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Birthdays this week */}
          <section className={cn(cardClass, "p-5 sm:p-6")}>
            <header className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Upcoming Birthdays
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Celebrate in class
                </p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <CalendarIcon className="h-4 w-4" />
              </span>
            </header>

            <ul className="mt-4 space-y-3">
              {birthdays.map((birthday) => (
                <li
                  key={birthday.name}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      birthday.tone,
                    )}
                  >
                    {initials(birthday.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {birthday.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Turning <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">{birthday.age}</span> · {birthday.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Today's classes */}
          <section className={cn(cardClass, "p-5 sm:p-6 lg:col-span-2")}>
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Today&apos;s Active Classes
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Roster breakdown by age bracket
                </p>
              </div>
              <Link
                href="/classes"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Manage all classes
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </header>

            <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
              {todaysClasses.map((classItem) => (
                <li
                  key={classItem.name}
                  className="flex items-center gap-3 py-3.5 first:pt-3 last:pb-2"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                      classItem.tone,
                    )}
                  >
                    {classItem.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {classItem.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {classItem.range} · Teacher: <span className="text-slate-700 dark:text-slate-300 font-medium">{classItem.teacher}</span> · {classItem.time}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {classItem.present}
                      <span className="text-slate-400 dark:text-slate-500 font-normal">/{classItem.total}</span>
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      In Class
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Recent check-ins */}
          <section className={cn(cardClass, "p-5 sm:p-6")}>
            <header className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Recent Check-Ins
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Real-time kiosk log
                </p>
              </div>
              <Link
                href="/attendance"
                className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Open Kiosk
              </Link>
            </header>

            <ul className="mt-4 space-y-3">
              {checkIns.map((checkIn) => (
                <li key={checkIn.name} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {initials(checkIn.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {checkIn.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {checkIn.guardian} · <span className="tabular-nums font-medium">{checkIn.time}</span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                      statusStyles[checkIn.status],
                    )}
                  >
                    {checkIn.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
