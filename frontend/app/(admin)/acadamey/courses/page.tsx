import type { Metadata } from "next"
import { AdminCoursesView } from "@/components/products/icacademy/admin/courses/admin-courses-view"

export const metadata: Metadata = {
  title: "Course Management — Admin",
}

export default function AcademyAdminCoursesPage() {
  return <AdminCoursesView />
}
