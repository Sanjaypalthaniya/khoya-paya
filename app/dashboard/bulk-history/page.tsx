import BulkHistoryTable from "@/components/dashboard/BulkHistoryTable";
import BusinessUpgradeCard from "@/components/dashboard/BusinessUpgradeCard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { isBusinessUser } from "@/lib/business-access";
import { prisma } from "@/lib/prisma";

export default async function BulkHistoryPage() {
  const user = await getCurrentUser();
  const hasBusinessAccess = user ? await isBusinessUser(user.id) : false;
  const logs = user && hasBusinessAccess ? await prisma.bulkImportLog.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }) : [];

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Bulk History" title="Previous bulk imports." copy="Review CSV import counts, failures, and import dates." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/bulk-history">
            <div className="dash-toolbar"><div><small>{logs.length} imports</small><h3>Bulk Upload History</h3></div></div>
            {hasBusinessAccess ? <BulkHistoryTable logs={logs} /> : <BusinessUpgradeCard />}
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
