import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ScanLogTable from "@/components/dashboard/ScanLogTable";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardScansPage() {
  const user = await getCurrentUser();
  const scans = user
    ? await prisma.scanLog.findMany({
        where: { item: { userId: user.id } },
        orderBy: { scannedAt: "desc" },
        include: {
          item: { select: { itemName: true } },
          qrCode: { select: { uniqueCode: true } },
        },
      })
    : [];

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Scan History" title="Every QR scan, safely logged." copy="See when your registered item QR codes are scanned, including browser details and IP data when available." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/scans">
              <div className="dash-toolbar">
                <div>
                  <small>{scans.length} scan logs</small>
                  <h3>QR Scan History</h3>
                </div>
              </div>
              <ScanLogTable scans={scans.map((scan) => ({
                id: scan.id,
                itemName: scan.item.itemName,
                uniqueCode: scan.qrCode?.uniqueCode ?? null,
                scannedAt: scan.scannedAt.toISOString(),
                userAgent: scan.userAgent,
                ipAddress: scan.ipAddress,
                location: scan.location,
              }))} />
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
