import CTASection from "@/components/CTASection";
import BusinessUpgradeCard from "@/components/dashboard/BusinessUpgradeCard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RecentActivity from "@/components/dashboard/RecentActivity";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isBusinessUser } from "@/lib/business-access";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const hasBusinessAccess = user ? await isBusinessUser(user.id) : false;

  const [totalItems, safeItems, lostItems, foundItems, qrGenerated, qrScans, finderMessages, newMessages, activeChats, unreadChatMessages, recentItems, recentScans, recentMessages] = user
    ? await Promise.all([
        prisma.item.count({ where: { userId: user.id } }),
        prisma.item.count({ where: { userId: user.id, status: "SAFE" } }),
        prisma.item.count({ where: { userId: user.id, status: "LOST" } }),
        prisma.item.count({ where: { userId: user.id, status: "FOUND" } }),
        prisma.qRCode.count({ where: { item: { userId: user.id } } }),
        prisma.scanLog.count({ where: { item: { userId: user.id } } }),
        prisma.finderMessage.count({ where: { item: { userId: user.id } } }),
        prisma.finderMessage.count({ where: { item: { userId: user.id }, status: "NEW" } }),
        prisma.conversation.count({ where: { ownerId: user.id, status: "OPEN" } }),
        prisma.chatMessage.count({ where: { conversation: { ownerId: user.id }, senderType: "FINDER", isReadByOwner: false } }),
        prisma.item.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, itemName: true, createdAt: true },
        }),
        prisma.scanLog.findMany({
          where: { item: { userId: user.id } },
          orderBy: { scannedAt: "desc" },
          take: 5,
          include: { item: { select: { itemName: true } } },
        }),
        prisma.finderMessage.findMany({
          where: { item: { userId: user.id } },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { item: { select: { itemName: true } } },
        }),
      ])
    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [], [], []];

  const cards = [
    ["Total Items", totalItems],
    ["Safe Items", safeItems],
    ["Lost Items", lostItems],
    ["Found Items", foundItems],
    ["QR Generated", qrGenerated],
    ["QR Scans", qrScans],
    ["Finder Messages", finderMessages],
    ["New Messages", newMessages],
    ["Active Chats", activeChats],
    ["Unread Chat Messages", unreadChatMessages],
  ];

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Dashboard" title={`Welcome back${user?.name ? `, ${user.name}` : ""}`} copy="Track items, finder messages, and QR scan activity from your protected dashboard." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard">
              <div className="dash-toolbar">
                <div>
                  <small>Protected dashboard</small>
                  <h3>Your recovery workspace</h3>
                </div>
                <Link className="btn btn-primary-kp btn-sm-pill" href="/dashboard/items/add">Add Your First Item</Link>
              </div>
              <div className="dashboard-card-grid">
                {cards.map(([label, value]) => (
                  <article className="item-card" key={label}>
                    <span className="mini-qr" />
                    <h3>{value}</h3>
                    <small>{label}</small>
                  </article>
                ))}
              </div>
              <RecentActivity
                items={recentItems.map((item) => ({ id: item.id, itemName: item.itemName, createdAt: item.createdAt.toISOString() }))}
                scans={recentScans.map((scan) => ({ id: scan.id, itemName: scan.item.itemName, scannedAt: scan.scannedAt.toISOString() }))}
                messages={recentMessages.map((message) => ({ id: message.id, itemName: message.item.itemName, finderMessage: message.finderMessage, createdAt: message.createdAt.toISOString() }))}
              />
              <div className="business-tools-grid">
                {hasBusinessAccess ? (
                  <>
                    <Link className="business-tool-card" href="/dashboard/bulk-upload"><strong>Bulk Upload</strong><span>Import CSV items</span></Link>
                    <Link className="business-tool-card" href="/dashboard/bulk-qr"><strong>Bulk QR Generate</strong><span>Create and download QR assets</span></Link>
                    <a className="business-tool-card" href="/api/bulk/export-items"><strong>Export Items</strong><span>Download inventory CSV</span></a>
                    <Link className="business-tool-card" href="/dashboard/bulk-qr/print"><strong>Print QR Sheet</strong><span>A4 QR labels</span></Link>
                  </>
                ) : (
                  <BusinessUpgradeCard />
                )}
              </div>
          </DashboardLayout>
        </div>
      </section>
      <CTASection title="Ready to grow this dashboard?" copy="Finder messages and scan history are now live. Item and QR workflows can be expanded next." primaryLabel="View Messages" primaryHref="/dashboard/messages" secondaryLabel="View Scans" secondaryHref="/dashboard/scans" />
      <Footer />
    </main>
  );
}
