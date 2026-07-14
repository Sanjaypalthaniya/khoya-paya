import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminSubscriptionsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();
  const subscriptions = await prisma.subscription.findMany({ include: { user: true, plan: true }, orderBy: { createdAt: "desc" } });
  return <main><Navbar /><PageHero eyebrow="Admin" title="Subscriptions." copy="View every customer plan and its activation status." /><section className="section bg-section"><div className="container"><div className="message-actions mb-3"><Link href="/admin/payments" className="btn btn-secondary-kp btn-sm-pill">View Payments</Link></div><div className="dashboard-message-card"><div className="scan-table-wrap"><table className="scan-table"><thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Started</th><th>Expires</th><th>Payment ID</th></tr></thead><tbody>{subscriptions.length ? subscriptions.map((entry) => <tr key={entry.id}><td>{entry.user.name}<br /><small>{entry.user.email}</small></td><td>{entry.plan.name}</td><td>{entry.status}</td><td>{entry.startedAt.toLocaleString()}</td><td>{entry.expiresAt?.toLocaleString() ?? "Never"}</td><td>{entry.razorpayPaymentId ?? "—"}</td></tr>) : <tr><td colSpan={6}>No subscriptions found.</td></tr>}</tbody></table></div></div></div></section><Footer /></main>;
}
