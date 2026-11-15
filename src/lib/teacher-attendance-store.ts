"use client";

import { useSyncExternalStore } from "react";

export type TeacherAttendanceStatus = "expected" | "signed-in" | "signed-out";

export type ServiceRole =
  | "Lead Teacher"
  | "Assistant Teacher"
  | "Substitute Teacher"
  | "Classroom Floater"
  | "Special Needs Support";

export type TeacherAttendanceRecord = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatarInitials: string;
  assignedClass: string;
  roomNumber: string;
  serviceRole: ServiceRole;
  status: TeacherAttendanceStatus;
  signedInAt?: string;
  signedInBy?: string;
  signedOutAt?: string;
  signedOutBy?: string;
  notes?: string;
  serviceDate: string;
};

export const INITIAL_TEACHERS: TeacherAttendanceRecord[] = [
  {
    id: "att-daniel-kim",
    userId: "usr-teacher",
    name: "Daniel Kim",
    email: "teacher@theark.church",
    phone: "(555) 032-7788",
    avatarInitials: "DK",
    assignedClass: "Kingdom Kids (Ages 5–8)",
    roomNumber: "Room 102",
    serviceRole: "Lead Teacher",
    status: "signed-in",
    signedInAt: "8:42 AM",
    signedInBy: "Grace Okafor (Admin)",
    notes: "Prepared lesson materials and craft supplies.",
    serviceDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-naomi-grace",
    userId: "usr-6",
    name: "Naomi Grace",
    email: "naomi.grace@theark.church",
    phone: "(555) 072-3388",
    avatarInitials: "NG",
    assignedClass: "Little Lights (Ages 0–4)",
    roomNumber: "Room 101",
    serviceRole: "Lead Teacher",
    status: "signed-in",
    signedInAt: "8:48 AM",
    signedInBy: "Grace Okafor (Admin)",
    notes: "Nursery sanitation checklist verified.",
    serviceDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-sarah-adebayo",
    userId: "usr-4",
    name: "Sarah Adebayo",
    email: "sarah.adebayo@theark.church",
    phone: "(555) 041-9922",
    avatarInitials: "SA",
    assignedClass: "Overcomers (Ages 9–12)",
    roomNumber: "Room 201",
    serviceRole: "Lead Teacher",
    status: "signed-in",
    signedInAt: "8:55 AM",
    signedInBy: "Grace Okafor (Admin)",
    serviceDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-tunde-adeyemi",
    userId: "usr-7",
    name: "Tunde Adeyemi",
    email: "tunde.a@theark.church",
    phone: "(555) 019-2210",
    avatarInitials: "TA",
    assignedClass: "Kingdom Kids (Ages 5–8)",
    roomNumber: "Room 102",
    serviceRole: "Assistant Teacher",
    status: "expected",
    serviceDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-hannah-reed",
    userId: "usr-12",
    name: "Hannah Reed",
    email: "hannah.reed@theark.church",
    phone: "(555) 104-8895",
    avatarInitials: "HR",
    assignedClass: "Little Lights (Ages 0–4)",
    roomNumber: "Room 101",
    serviceRole: "Assistant Teacher",
    status: "expected",
    serviceDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-emmanuel-osei",
    userId: "usr-11",
    name: "Emmanuel Osei",
    email: "emmanuel.osei@theark.church",
    phone: "(555) 061-3345",
    avatarInitials: "EO",
    assignedClass: "General / Worship Hall",
    roomNumber: "Auditorium",
    serviceRole: "Classroom Floater",
    status: "signed-in",
    signedInAt: "9:00 AM",
    signedInBy: "Grace Okafor (Admin)",
    notes: "Leading morning praise & worship songs.",
    serviceDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-priya-patel",
    userId: "usr-8",
    name: "Priya Patel",
    email: "priya.p@theark.church",
    phone: "(555) 093-7712",
    avatarInitials: "PP",
    assignedClass: "Kingdom Kids (Ages 5–8)",
    roomNumber: "Room 102",
    serviceRole: "Special Needs Support",
    status: "expected",
    serviceDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "att-marcus-johnson",
    userId: "usr-5",
    name: "Marcus Johnson",
    email: "marcus.j@theark.church",
    phone: "(555) 066-1170",
    avatarInitials: "MJ",
    assignedClass: "Teens & Lower Hall",
    roomNumber: "Lower Hall",
    serviceRole: "Classroom Floater",
    status: "signed-out",
    signedInAt: "7:45 AM",
    signedInBy: "Grace Okafor (Admin)",
    signedOutAt: "9:15 AM",
    signedOutBy: "Grace Okafor (Admin)",
    notes: "Completed security pre-check and early morning kiosk setup.",
    serviceDate: new Date().toISOString().split("T")[0],
  },
];

const STORAGE_KEY = "theark_teacher_attendance";
const CHANGE_EVENT = "theark_teacher_attendance_change";

function formatCurrentTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function loadAttendance(): TeacherAttendanceRecord[] {
  if (typeof window === "undefined") {
    return INITIAL_TEACHERS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TEACHERS));
      return INITIAL_TEACHERS;
    }
    return JSON.parse(raw) as TeacherAttendanceRecord[];
  } catch {
    return INITIAL_TEACHERS;
  }
}

function saveAttendance(records: TeacherAttendanceRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // LocalStorage quota or storage disabled fallback
  }
}

let cachedRecords: TeacherAttendanceRecord[] = INITIAL_TEACHERS;
let cachedRaw: string = "";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}

function getSnapshot(): TeacherAttendanceRecord[] {
  if (typeof window === "undefined") return INITIAL_TEACHERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? "";
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedRecords = raw ? (JSON.parse(raw) as TeacherAttendanceRecord[]) : loadAttendance();
    }
    return cachedRecords;
  } catch {
    return cachedRecords;
  }
}

function getServerSnapshot(): TeacherAttendanceRecord[] {
  return INITIAL_TEACHERS;
}

export function useTeacherAttendance(): TeacherAttendanceRecord[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function signInTeacher(
  id: string,
  options?: {
    serviceRole?: ServiceRole;
    roomNumber?: string;
    notes?: string;
    adminName?: string;
  },
): { success: boolean; record?: TeacherAttendanceRecord; error?: string } {
  const current = loadAttendance();
  const index = current.findIndex((item) => item.id === id);

  if (index === -1) {
    return { success: false, error: "Teacher attendance record not found." };
  }

  const existing = current[index];
  const now = formatCurrentTime();

  const updatedRecord: TeacherAttendanceRecord = {
    ...existing,
    status: "signed-in",
    signedInAt: now,
    signedInBy: options?.adminName ?? "Grace Okafor (Admin)",
    signedOutAt: undefined,
    signedOutBy: undefined,
    serviceRole: options?.serviceRole ?? existing.serviceRole,
    roomNumber: options?.roomNumber ?? existing.roomNumber,
    notes: options?.notes ? options.notes.trim() : existing.notes,
  };

  const updatedList = [...current];
  updatedList[index] = updatedRecord;
  saveAttendance(updatedList);

  return { success: true, record: updatedRecord };
}

export function signOutTeacher(
  id: string,
  options?: {
    notes?: string;
    adminName?: string;
  },
): { success: boolean; record?: TeacherAttendanceRecord; error?: string } {
  const current = loadAttendance();
  const index = current.findIndex((item) => item.id === id);

  if (index === -1) {
    return { success: false, error: "Teacher attendance record not found." };
  }

  const existing = current[index];
  const now = formatCurrentTime();

  const updatedRecord: TeacherAttendanceRecord = {
    ...existing,
    status: "signed-out",
    signedOutAt: now,
    signedOutBy: options?.adminName ?? "Grace Okafor (Admin)",
    notes: options?.notes ? options.notes.trim() : existing.notes,
  };

  const updatedList = [...current];
  updatedList[index] = updatedRecord;
  saveAttendance(updatedList);

  return { success: true, record: updatedRecord };
}

export function batchSignInTeachers(
  ids: string[],
  adminName = "Grace Okafor (Admin)",
): { count: number } {
  const current = loadAttendance();
  const now = formatCurrentTime();
  let count = 0;

  const updatedList = current.map((item) => {
    if (ids.includes(item.id) && item.status !== "signed-in") {
      count += 1;
      return {
        ...item,
        status: "signed-in" as const,
        signedInAt: now,
        signedInBy: adminName,
        signedOutAt: undefined,
        signedOutBy: undefined,
      };
    }
    return item;
  });

  saveAttendance(updatedList);
  return { count };
}

export function resetTeacherAttendance(): void {
  saveAttendance(INITIAL_TEACHERS);
}
