"use client";

import { useSyncExternalStore } from "react";

export type Status = "expected" | "checked-in" | "checked-out";

export type Guardian = {
  name: string;
  relation: string;
  phone: string;
  authorized: boolean;
};

export type Child = {
  id: string;
  name: string;
  age: number;
  classId: string;
  bornOn?: string;
  guardians: Guardian[];
  status: Status;
  arrivedAt?: string;
  dropOffBy?: string;
  signedOutAt?: string;
  pickedUpBy?: string;
  allergies?: string;
  medicalNotes?: string;
};

export type Notice = {
  message: string;
  detail: string;
};

export type CohortTone = {
  icon: string;
  badge: string;
  bar: string;
  soft: string;
};

export type Cohort = {
  id: string;
  name: string;
  ageMin: number;
  ageMax: number | null;
  room: string;
  capacity: number;
  lead: string;
  assistant: string;
  tone: CohortTone;
};

export type NewChild = {
  name: string;
  age: number;
  classId: string;
  bornOn?: string;
  guardians: Guardian[];
  allergies?: string;
  medicalNotes?: string;
};

export const INITIAL_COHORTS: Cohort[] = [
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
      badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/10 dark:bg-sky-500/10 dark:text-sky-300",
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

export const INITIAL_CHILDREN: Child[] = [
  {
    id: "ava",
    name: "Ava Thompson",
    age: 3,
    classId: "little-lights",
    status: "checked-out",
    guardians: [
      { name: "Rachel Thompson", relation: "Mother", phone: "(555) 051-9044", authorized: true },
      { name: "Mark Thompson", relation: "Father", phone: "(555) 051-9045", authorized: true },
    ],
    arrivedAt: "8:56 AM",
    dropOffBy: "Rachel Thompson",
    signedOutAt: "9:12 AM",
    pickedUpBy: "Rachel Thompson",
  },
  {
    id: "sophia",
    name: "Sophia Mensah",
    age: 4,
    classId: "little-lights",
    status: "expected",
    guardians: [
      { name: "Sarah Mensah", relation: "Mother", phone: "(555) 014-4821", authorized: true },
      { name: "Kojo Mensah", relation: "Father", phone: "(555) 014-4822", authorized: false },
    ],
    allergies: "Peanut allergy",
  },
  {
    id: "levi",
    name: "Levi Osei",
    age: 2,
    classId: "little-lights",
    status: "expected",
    guardians: [
      { name: "Kwame Osei", relation: "Father", phone: "(555) 061-3345", authorized: true },
      { name: "Adwoa Osei", relation: "Mother", phone: "(555) 061-3346", authorized: true },
    ],
  },
  {
    id: "amara",
    name: "Amara Nwosu",
    age: 1,
    classId: "little-lights",
    status: "expected",
    guardians: [
      { name: "Ngozi Nwosu", relation: "Mother", phone: "(555) 062-8820", authorized: true },
      { name: "Emeka Nwosu", relation: "Father", phone: "(555) 062-8821", authorized: true },
    ],
    medicalNotes: "Needs inhaler with guardian",
  },
  {
    id: "ella",
    name: "Ella Mensah",
    age: 6,
    classId: "kingdom-kids",
    status: "checked-in",
    guardians: [
      { name: "Sarah Mensah", relation: "Mother", phone: "(555) 014-4821", authorized: true },
      { name: "Kojo Mensah", relation: "Father", phone: "(555) 014-4822", authorized: false },
    ],
    arrivedAt: "9:04 AM",
    dropOffBy: "Sarah Mensah",
  },
  {
    id: "liam",
    name: "Liam Okafor",
    age: 7,
    classId: "kingdom-kids",
    status: "checked-in",
    guardians: [
      { name: "Grace Okafor", relation: "Mother", phone: "(555) 045-6632", authorized: true },
      { name: "Chidi Okafor", relation: "Father", phone: "(555) 045-6633", authorized: false },
    ],
    arrivedAt: "9:18 AM",
    dropOffBy: "Grace Okafor",
  },
  {
    id: "micah",
    name: "Micah Johnson",
    age: 5,
    classId: "kingdom-kids",
    status: "expected",
    guardians: [
      { name: "Marcus Johnson", relation: "Father", phone: "(555) 066-1170", authorized: true },
      { name: "Tasha Johnson", relation: "Mother", phone: "(555) 066-1171", authorized: true },
    ],
  },
  {
    id: "caleb",
    name: "Caleb Kim",
    age: 7,
    classId: "kingdom-kids",
    status: "expected",
    guardians: [
      { name: "Daniel Kim", relation: "Father", phone: "(555) 032-7788", authorized: true },
      { name: "Anna Kim", relation: "Mother", phone: "(555) 032-7789", authorized: true },
    ],
  },
  {
    id: "elijah",
    name: "Elijah Bello",
    age: 8,
    classId: "kingdom-kids",
    status: "checked-out",
    guardians: [
      { name: "Funke Bello", relation: "Mother", phone: "(555) 081-5520", authorized: true },
      { name: "Kunle Bello", relation: "Father", phone: "(555) 081-5521", authorized: true },
    ],
    arrivedAt: "9:05 AM",
    dropOffBy: "Funke Bello",
    signedOutAt: "9:14 AM",
    pickedUpBy: "Kunle Bello",
  },
  {
    id: "noah",
    name: "Noah Adeyemi",
    age: 9,
    classId: "overcomers",
    status: "checked-in",
    guardians: [
      { name: "Tunde Adeyemi", relation: "Father", phone: "(555) 019-2210", authorized: true },
      { name: "Bisi Adeyemi", relation: "Mother", phone: "(555) 019-2211", authorized: true },
    ],
    arrivedAt: "9:07 AM",
    dropOffBy: "Tunde Adeyemi",
  },
  {
    id: "isabella",
    name: "Isabella Grace",
    age: 10,
    classId: "overcomers",
    status: "expected",
    guardians: [
      { name: "Naomi Grace", relation: "Mother", phone: "(555) 072-3388", authorized: true },
      { name: "Peter Grace", relation: "Father", phone: "(555) 072-3389", authorized: false },
    ],
  },
  {
    id: "maya",
    name: "Maya Patel",
    age: 12,
    classId: "overcomers",
    status: "checked-out",
    guardians: [
      { name: "Priya Patel", relation: "Mother", phone: "(555) 093-7712", authorized: true },
      { name: "Raj Patel", relation: "Father", phone: "(555) 093-7713", authorized: true },
    ],
    arrivedAt: "9:02 AM",
    dropOffBy: "Raj Patel",
    signedOutAt: "9:20 AM",
    pickedUpBy: "Raj Patel",
  },
  {
    id: "josiah",
    name: "Josiah Reed",
    age: 13,
    classId: "teens",
    status: "expected",
    guardians: [
      { name: "Hannah Reed", relation: "Mother", phone: "(555) 104-8890", authorized: true },
      { name: "David Reed", relation: "Father", phone: "(555) 104-8891", authorized: false },
    ],
  },
  {
    id: "esther",
    name: "Esther Adeyemi",
    age: 14,
    classId: "teens",
    status: "expected",
    guardians: [
      { name: "Ayo Adeyemi", relation: "Father", phone: "(555) 067-4412", authorized: true },
      { name: "Grace Adeyemi", relation: "Mother", phone: "(555) 067-4413", authorized: true },
    ],
    allergies: "Allergic to penicillin",
  },
  {
    id: "michael",
    name: "Michael Osei",
    age: 15,
    classId: "teens",
    status: "expected",
    guardians: [
      { name: "Ngozi Osei", relation: "Mother", phone: "(555) 068-9920", authorized: true },
      { name: "Emeka Osei", relation: "Father", phone: "(555) 068-9921", authorized: true },
    ],
  },
  {
    id: "rebecca",
    name: "Rebecca Mensah",
    age: 16,
    classId: "teens",
    status: "checked-out",
    guardians: [
      { name: "David Mensah", relation: "Father", phone: "(555) 069-1150", authorized: true },
      { name: "Grace Mensah", relation: "Mother", phone: "(555) 069-1151", authorized: true },
    ],
    arrivedAt: "9:03 AM",
    dropOffBy: "David Mensah",
    signedOutAt: "9:16 AM",
    pickedUpBy: "David Mensah",
  },
];

let children: Child[] = INITIAL_CHILDREN;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getChildrenSnapshot() {
  return children;
}

function getCohortsSnapshot() {
  return INITIAL_COHORTS;
}

export function useChildren(): Child[] {
  return useSyncExternalStore(subscribe, getChildrenSnapshot, getChildrenSnapshot);
}

export function useCohorts(): Cohort[] {
  return useSyncExternalStore(subscribe, getCohortsSnapshot, getCohortsSnapshot);
}

export function addChild(input: NewChild) {
  const normalize = (value?: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    if (["none", "nil", "n/a", "na", "no", "no known", "nothing"].includes(trimmed.toLowerCase())) {
      return undefined;
    }
    return trimmed;
  };

  const guardians = input.guardians
    .map((guardian) => ({
      ...guardian,
      name: guardian.name.trim(),
      relation: guardian.relation.trim() || "Guardian",
      phone: guardian.phone.trim(),
    }))
    .filter((guardian) => guardian.name.length > 0);

  const child: Child = {
    id: `child-${Date.now()}`,
    name: input.name.trim(),
    age: input.age,
    classId: input.classId,
    bornOn: input.bornOn || undefined,
    guardians,
    status: "expected",
    allergies: normalize(input.allergies),
    medicalNotes: normalize(input.medicalNotes),
  };

  children = [child, ...children];
  emit();
}

export function resetChildren() {
  children = INITIAL_CHILDREN;
  emit();
}
