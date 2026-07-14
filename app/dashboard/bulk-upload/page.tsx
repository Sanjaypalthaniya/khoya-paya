import BulkUploadCard from "@/components/dashboard/BulkUploadCard";
import BusinessUpgradeCard from "@/components/dashboard/BusinessUpgradeCard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { isBusinessUser } from "@/lib/business-access";

export default async function BulkUploadPage() {
  const user = await getCurrentUser();
  const hasBusinessAccess = user ? await isBusinessUser(user.id) : false;

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Bulk Upload" title="Import many items from CSV." copy="Business users can upload inventory, validate rows, and generate QR codes in one flow." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/bulk-upload">
            <div className="dash-toolbar"><div><small>Business feature</small><h3>Bulk Item Upload</h3></div><a className="btn btn-secondary-kp btn-sm-pill" href="/api/bulk/export-items">Export Items CSV</a></div>
            {hasBusinessAccess ? <BulkUploadCard /> : <BusinessUpgradeCard />}
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
