import Link from "next/link";
import type { ComponentType } from "react";

import {
  ArrowRightIcon,
  CalendarIcon,
  ChildrenIcon,
  ClassesIcon,
  FinanceIcon,
  KioskIcon,
  PlusIcon,
  type IconProps,
} from "@/components/icons";
import { cn } from "@/lib/cn";

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";

const toneStyles = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
} as const;

type Tone = keyof typeof toneStyles;

const stats: {
  label: string;
  value: string;
  hint: string;
  tone: Tone;
  icon: ComponentType<IconProps>;
}[] = [
  { label: "Total Children", value: "128", hint: "+12 this month", tone: "indigo", icon: ChildrenIcon },
  { label: "Present Today", value: "96", hint: "75% attendance", tone: "emerald", icon: KioskIcon },
  { label: "Active Classes", value: "8", hint: "Across 3 age groups", tone: "amber", icon: ClassesIcon },
  { label: "Weekly Giving", value: "₦245,000", hint: "+8.2% vs last week", tone: "violet", icon: FinanceIcon },
];

const week = [
  { day: "Sun", value: 96 },
  { day: "Mon", value: 34 },
  { day: "Tue", value: 26 },
  { day: "Wed", value: 58 },
  { day: "Thu", value: 31 },
  { day: "Fri", value: 22 },
  { day: "Sat", value: 64 },
];

const todaysClasses = [
  {
    name: "Little Lambs",
    range: "Ages 2–4",
    teacher: "Grace Okafor",
    time: "9:00 AM",
    present: 24,
    total: 28,
    tone: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  },
  {
    name: "Kingdom Kids",
    range: "Ages 5–7",
    teacher: "Daniel Kim",
    time: "9:00 AM",
    present: 31,
    total: 35,
    tone: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  {
    name: "Overcomers",
    range: "Ages 8–11",
    teacher: "Ruth Mensah",
    time: "10:30 AM",
    present: 27,
    total: 30,
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    name: "Torchbearers",
    range: "Ages 12–14",
    teacher: "Samuel Adeyemi",
    time: "10:30 AM",
    present: 14,
    total: 18,
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
];

const birthdays = [
  {
    name: "Ella Mensah",
    age: 6,
    date: "Today",
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    name: "Noah Adeyemi",
    age: 9,
    date: "Tomorrow",
    tone: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  },
  {
    name: "Zoe Kim",
    age: 4,
    date: "Fri, Nov 6",
    tone: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
];

const checkIns = [
  { name: "Ella Mensah", guardian: "Sarah Mensah", time: "9:04 AM", status: "Checked in" },
  { name: "Noah Adeyemi", guardian: "Tunde Adeyemi", time: "9:07 AM", status: "Checked in" },
  { name: "Zoe Kim", guardian: "Daniel Kim", time: "9:12 AM", status: "Picked up" },
  { name: "Liam Okafor", guardian: "Grace Okafor", time: "9:18 AM", status: "Checked in" },
];

const statusStyles: Record<string, string> = {
  "Checked in": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Picked up": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 right-16 h-64 w-64 rounded-full bg-fuchsia-300/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-indigo-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Sunday service · Live
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Good morning, Ayo 👋
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
              96 children are checked in across 8 classes. Two families still need to confirm
              pick-up details before the second service.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/attendance"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
            >
              <KioskIcon className="h-4 w-4" />
              Open kiosk
            </Link>
            <Link
              href="/children"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/30 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <PlusIcon className="h-4 w-4" />
              Add child
            </Link>
          </div>
        </div>
      </section>

      {/* Key metrics */}
      <section aria-label="Overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div key={stat.label} className={cn(cardClass, "p-5")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    toneStyles[stat.tone],
                  )}
                >
                  <StatIcon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                {stat.hint}
              </p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Weekly attendance */}
        <section className={cn(cardClass, "p-5 lg:col-span-2")}>
          <header className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Attendance this week</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Check-ins across all classes
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              Avg 47 / day
            </span>
          </header>
          <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
            {week.map((entry) => (
              <div key={entry.day} className="flex h-full flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800/60">
                  <div
                    className="w-full rounded-lg bg-linear-to-t from-indigo-600 to-violet-500"
                    style={{ height: `${entry.value}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {entry.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Birthdays */}
        <section className={cn(cardClass, "p-5")}>
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Birthdays</h3>
            <CalendarIcon className="h-4 w-4 text-slate-400" />
          </header>
          <ul className="mt-4 space-y-3">
            {birthdays.map((birthday) => (
              <li key={birthday.name} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    birthday.tone,
                  )}
                >
                  {initials(birthday.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{birthday.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Turning {birthday.age} · {birthday.date}
                  </p>
                </div>

              </li>
            ))}
          </ul>
        </section>

        {/* Today's classes */}
        <section className={cn(cardClass, "p-5 lg:col-span-2")}>
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Today&apos;s classes</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                4 of 8 classes shown
              </p>
            </div>
            <Link
              href="/classes"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
            >
              View all
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </header>
          <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {todaysClasses.map((classItem) => (
              <li
                key={classItem.name}
                className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
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
                  <p className="truncate text-sm font-medium">{classItem.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {classItem.range} · {classItem.teacher} · {classItem.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {classItem.present}
                    <span className="text-slate-400">/{classItem.total}</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Present</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent check-ins */}
        <section className={cn(cardClass, "p-5")}>
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent check-ins</h3>
            <Link
              href="/attendance"
              className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
            >
              Kiosk
            </Link>
          </header>
          <ul className="mt-4 space-y-3">
            {checkIns.map((checkIn) => (
              <li key={checkIn.name} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {initials(checkIn.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{checkIn.name}</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {checkIn.guardian} · {checkIn.time}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
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
    </div>
  );
}
