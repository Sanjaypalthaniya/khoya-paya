import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { getUserActiveSubscription } from "@/lib/business-access";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UpgradeButton from "@/components/billing/UpgradeButton";
import { redirect } from "next/navigation";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/billing");
  const subscription = await getUserActiveSubscription(user.id);
  const itemCount = await prisma.item.count({ where: { userId: user.id } });
  const freePlan = await prisma.plan.findFirst({ where: { slug: "free" } });
  const plan = subscription?.plan ?? freePlan;
  const upgradePlans = await prisma.plan.findMany({ where: { isActive: true, slug: { in: ["premium-monthly", "premium-yearly", "business-monthly"] } }, orderBy: { price: "asc" } });
  const payments = await prisma.payment.findMany({ where: { userId: user.id }, include: { plan: true }, orderBy: { createdAt: "desc" }, take: 10 });

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Billing" title="Plan and usage." copy="Review your current item limit and upgrade for business bulk tools." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/billing">
            <article className="dashboard-message-card">
              <span className="status-pill">{subscription?.status ?? "FREE"}</span>
              <h3>{plan?.name ?? "Free"}</h3>
              <p>{itemCount} / {plan?.itemLimit ?? 2} items used</p>
              <div className="usage-bar"><span style={{ width: `${Math.min(100, (itemCount / (plan?.itemLimit ?? 2)) * 100)}%` }} /></div>
              <div className="message-actions mt-3">
                <Link className="btn btn-primary-kp btn-sm-pill" href="/pricing">View Plans</Link>
                <Link className="btn btn-secondary-kp btn-sm-pill" href="/dashboard/bulk-upload">Open Bulk Tools</Link>
              </div>
            </article>
            <div className="row g-4 mt-1">
              {upgradePlans.map((upgradePlan) => <div className="col-md-4" key={upgradePlan.id}><article className="dashboard-message-card h-100"><span className="status-pill">{upgradePlan.billingCycle}</span><h3>{upgradePlan.name}</h3><p>₹{Number(upgradePlan.price).toLocaleString("en-IN")} · {upgradePlan.itemLimit} items</p><UpgradeButton planSlug={upgradePlan.slug} label={plan?.id === upgradePlan.id ? "Current Plan" : "Upgrade"} disabled={plan?.id === upgradePlan.id} /></article></div>)}
            </div>
            <article className="dashboard-message-card mt-4"><h3>Payment history</h3><div className="scan-table-wrap"><table className="scan-table"><thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Status</th><th>Payment ID</th></tr></thead><tbody>{payments.length ? payments.map((payment) => <tr key={payment.id}><td>{payment.createdAt.toLocaleString()}</td><td>{payment.plan.name}</td><td>{payment.currency} {Number(payment.amount).toLocaleString("en-IN")}</td><td>{payment.status}</td><td>{payment.razorpayPaymentId ?? "—"}</td></tr>) : <tr><td colSpan={5}>No payments yet.</td></tr>}</tbody></table></div></article>
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
