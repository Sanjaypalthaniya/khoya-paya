import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminPaymentsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();
  const payments = await prisma.payment.findMany({ include: { user: true, plan: true }, orderBy: { createdAt: "desc" } });
  return <main><Navbar /><PageHero eyebrow="Admin" title="Payments." copy="Audit Razorpay orders, paid transactions, and failures." /><section className="section bg-section"><div className="container"><div className="message-actions mb-3"><Link href="/admin/subscriptions" className="btn btn-secondary-kp btn-sm-pill">View Subscriptions</Link></div><div className="dashboard-message-card"><div className="scan-table-wrap"><table className="scan-table"><thead><tr><th>Date</th><th>User</th><th>Plan</th><th>Amount</th><th>Status</th><th>Order ID</th><th>Payment ID</th></tr></thead><tbody>{payments.length ? payments.map((entry) => <tr key={entry.id}><td>{entry.createdAt.toLocaleString()}</td><td>{entry.user.name}<br /><small>{entry.user.email}</small></td><td>{entry.plan.name}</td><td>{entry.currency} {Number(entry.amount).toLocaleString("en-IN")}</td><td>{entry.status}</td><td>{entry.razorpayOrderId}</td><td>{entry.razorpayPaymentId ?? "—"}</td></tr>) : <tr><td colSpan={7}>No payments found.</td></tr>}</tbody></table></div></div></div></section><Footer /></main>;
}
