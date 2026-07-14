import BulkQRSelector from "@/components/dashboard/BulkQRSelector";
import BusinessUpgradeCard from "@/components/dashboard/BusinessUpgradeCard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isBusinessUser } from "@/lib/business-access";
import { prisma } from "@/lib/prisma";

export default async function BulkQRPage() {
  const user = await getCurrentUser();
  const hasBusinessAccess = user ? await isBusinessUser(user.id) : false;
  const items = user && hasBusinessAccess
    ? await prisma.item.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { qrCode: true } })
    : [];

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Bulk QR" title="Generate and download QR codes in bulk." copy="Filter items, generate missing QR codes, and download printable QR assets." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/bulk-qr">
            <div className="dash-toolbar"><div><small>{items.length} items</small><h3>Bulk QR Management</h3></div><Link className="btn btn-secondary-kp btn-sm-pill" href="/dashboard/bulk-qr/print">Open Print Sheet</Link></div>
            {hasBusinessAccess ? (
              <BulkQRSelector items={items.map((item) => ({ id: item.id, itemName: item.itemName, category: item.category, status: item.status, hasQr: Boolean(item.qrCode) }))} />
            ) : <BusinessUpgradeCard />}
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
