import DashboardLayout from "@/components/dashboard/DashboardLayout";
import QRCodePreview from "@/components/dashboard/QRCodePreview";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ItemQrPageProps = { params: Promise<{ id: string }> };

export default async function ItemQrPage({ params }: ItemQrPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const item = user ? await prisma.item.findFirst({ where: { id, userId: user.id }, include: { qrCode: true } }) : null;
  if (!item) notFound();

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="QR Code" title={`${item.itemName} QR Code`} copy="Download, copy, or open the public finder URL connected to this item." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/items">
            {item.qrCode?.imageUrl ? (
              <>
                <QRCodePreview imageUrl={item.qrCode.imageUrl} publicUrl={item.qrCode.publicUrl} />
                <div className="item-actions justify-content-center mt-4">
                  <Link className="btn btn-secondary-kp btn-sm-pill" href={`/dashboard/items/${item.id}`}>Back to Item</Link>
                  <Link className="btn btn-primary-kp btn-sm-pill" href={item.qrCode.publicUrl}>Open Public Finder Page</Link>
                </div>
              </>
            ) : (
              <div className="empty-state"><h3>No QR code yet</h3><p>Generate a QR from the item detail page first.</p><Link className="btn btn-primary-kp btn-sm-pill" href={`/dashboard/items/${item.id}`}>Back to Item</Link></div>
            )}
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
