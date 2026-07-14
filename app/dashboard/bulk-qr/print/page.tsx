import BusinessUpgradeCard from "@/components/dashboard/BusinessUpgradeCard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import QRPrintSheet from "@/components/dashboard/QRPrintSheet";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { isBusinessUser } from "@/lib/business-access";
import { prisma } from "@/lib/prisma";

type QRPrintPageProps = {
  searchParams: { ids?: string };
};

export default async function QRPrintPage({ searchParams }: QRPrintPageProps) {
  const user = await getCurrentUser();
  const hasBusinessAccess = user ? await isBusinessUser(user.id) : false;
  const ids = searchParams.ids?.split(",").filter(Boolean) ?? [];
  const items = user && hasBusinessAccess
    ? await prisma.item.findMany({
        where: { userId: user.id, ...(ids.length ? { id: { in: ids } } : {}), qrCode: { isNot: null } },
        orderBy: { createdAt: "desc" },
        include: { qrCode: true },
      })
    : [];

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Print QR Sheet" title="Printable QR code sheet." copy="A4-friendly labels for business inventory, schools, offices, and hosted assets." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/bulk-qr">
            {hasBusinessAccess ? <QRPrintSheet items={items.map((item) => ({ id: item.id, itemName: item.itemName, category: item.category, qrCode: item.qrCode }))} /> : <BusinessUpgradeCard />}
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
