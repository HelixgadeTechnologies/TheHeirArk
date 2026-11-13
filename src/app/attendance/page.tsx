import type { Metadata } from "next";

import { AttendanceKiosk } from "@/components/attendance-kiosk";

export const metadata: Metadata = {
  title: "Attendance Kiosk",
  description: "Sunday check-in and check-out kiosk for children's church.",
};

export default function AttendancePage() {
  return <AttendanceKiosk />;
}
