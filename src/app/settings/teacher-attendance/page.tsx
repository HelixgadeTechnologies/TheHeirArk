import { Suspense } from "react";
import type { Metadata } from "next";

import { TeacherAttendanceManagement } from "@/components/teacher-attendance-management";

export const metadata: Metadata = {
  title: "Teacher Attendance (Admin)",
  description: "Record teacher and volunteer attendance, assign classrooms, and verify staff shifts.",
};

export default function TeacherAttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <TeacherAttendanceManagement />
    </Suspense>
  );
}
