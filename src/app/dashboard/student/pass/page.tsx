import { redirect } from "next/navigation";

/**
 * The student QR pass is displayed on the main student dashboard.
 * This route previously duplicated the QR generation; it now redirects
 * to the single canonical location at /dashboard/student/.
 */
export default function StudentPassRedirect() {
  redirect("/dashboard/student");
}