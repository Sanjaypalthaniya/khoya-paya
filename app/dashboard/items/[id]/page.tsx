import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ItemActions from "@/components/dashboard/ItemActions";
import QRCodePreview from "@/components/dashboard/QRCodePreview";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ItemDetailPageProps = { params: Promise<{ id: string }> };

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const item = user ? await prisma.item.findFirst({
    where: { id, userId: user.id },
    include: {
      qrCode: true,
      finderMessages: { orderBy: { createdAt: "desc" }, take: 5 },
      scanLogs: { orderBy: { scannedAt: "desc" }, take: 5 },
    },
  }) : null;

  if (!item) notFound();

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Item Details" title={item.itemName} copy="Review item details, QR status, Lost Mode, recent scans, and finder messages." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/items">
            <div className="dash-toolbar">
              <div><small>{item.category}</small><h3>{item.itemName}</h3></div>
              <ItemActions itemId={item.id} hasQr={Boolean(item.qrCode)} lostModeEnabled={item.lostModeEnabled} />
            </div>
            <div className="item-detail-grid">
              <article className="dashboard-message-card">
                {item.imageUrl ? <Image className="item-detail-image" src={item.imageUrl} alt={item.itemName} width={720} height={480} unoptimized /> : <div className="item-detail-image item-detail-fallback">No item image uploaded</div>}
                <StatusBadge status={item.status} />
                <p>{item.description || "No description added."}</p>
                <div className="message-contact-grid">
                  <span>Lost Mode: {item.lostModeEnabled ? "On" : "Off"}</span>
                  <span>Reward: {item.rewardAmount ? `Rs ${item.rewardAmount}` : "Not set"}</span>
                  <span>Contact: {item.contactPreference}</span>
                  <span>Created: {item.createdAt.toLocaleDateString()}</span>
                </div>
              </article>
              <article className="dashboard-message-card">
                <h3>QR Connection</h3>
                {item.qrCode ? (
                  <>
                    {item.qrCode.imageUrl ? <QRCodePreview imageUrl={item.qrCode.imageUrl} publicUrl={item.qrCode.publicUrl} /> : null}
                    <Link className="btn btn-primary-kp btn-sm-pill" href={`/dashboard/items/${item.id}/qr`}>Open QR Page</Link>
                  </>
                ) : (
                  <p>No QR generated yet. Use the Generate QR action to connect this item with the public finder page.</p>
                )}
              </article>
            </div>
            <div className="recent-activity-grid">
              <article className="recent-card">
                <h3>Recent finder messages</h3>
                {item.finderMessages.length ? item.finderMessages.map((message) => <div className="recent-row" key={message.id}><strong>{message.status}</strong><span>{message.finderMessage}</span></div>) : <p>No messages yet.</p>}
              </article>
              <article className="recent-card">
                <h3>Recent scan logs</h3>
                {item.scanLogs.length ? item.scanLogs.map((scan) => <div className="recent-row" key={scan.id}><strong>{scan.scannedAt.toLocaleString()}</strong><span>{scan.ipAddress || "IP not saved"}</span></div>) : <p>No scans yet.</p>}
              </article>
            </div>
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
