import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardFeedPage() {
  if (!(await getCurrentUser())) redirect("/login");
  redirect("/community");
}
