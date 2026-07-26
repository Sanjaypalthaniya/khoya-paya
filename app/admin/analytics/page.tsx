import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import AdminAnalyticsCenter from "@/components/admin/AdminAnalyticsCenter";

export default async function AdminAnalyticsPage() {
  if (!await getAdmin()) notFound();
  return <AdminAnalyticsCenter />;
}
