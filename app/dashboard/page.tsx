import BusinessUpgradeCard from "@/components/dashboard/BusinessUpgradeCard";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import RecentActivity from "@/components/dashboard/RecentActivity";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Box, CircleCheck, Clock3, Eye, MapPin,
  MessageCircle, Plus, QrCode, ScanLine, ShieldCheck, Sparkles,
  TriangleAlert, Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { isBusinessUser } from "@/lib/business-access";
import { prisma } from "@/lib/prisma";
import "./dashboard-overview.css";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const hasBusinessAccess = user ? await isBusinessUser(user.id) : false;
  const reputation = user ? await prisma.trustProfile.findUnique({ where: { userId: user.id }, select: { trustScore: true, trustLevel: true, pointsBalance: true, verifiedReturns: true } }) : null;

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

  const primaryCards = [
    { label: "Protected items", value: totalItems, note: `${safeItems} currently safe`, icon: Box, href: "/dashboard/items", tone: "blue" },
    { label: "Items needing attention", value: lostItems, note: `${foundItems} marked found`, icon: TriangleAlert, href: "/dashboard/items", tone: "orange" },
    { label: "QR scans", value: qrScans, note: `${qrGenerated} active QR codes`, icon: ScanLine, href: "/dashboard/scans", tone: "violet" },
    { label: "Finder messages", value: newMessages, note: `${finderMessages} messages in total`, icon: MessageCircle, href: "/dashboard/messages", tone: "green" },
  ];

  const supportingCards = [
    { label: "Active chats", value: activeChats, icon: Users, href: "/dashboard/chats" },
    { label: "Unread messages", value: unreadChatMessages, icon: Eye, href: "/dashboard/chats" },
    { label: "Trust score", value: reputation?.trustScore ?? 0, icon: ShieldCheck, href: "/dashboard/verification" },
    { label: "Community points", value: reputation?.pointsBalance ?? 0, icon: Sparkles, href: "/community" },
    { label: "Verified returns", value: reputation?.verifiedReturns ?? 0, icon: BadgeCheck, href: "/dashboard/recovery-history" },
  ];

  return (
    <main className="overview-page">
      <DashboardLayout active="/dashboard">
        <section className="overview-welcome">
          <div>
            <span className="overview-eyebrow"><CircleCheck size={14} /> Recovery workspace</span>
            <h2>Good to see you{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</h2>
            <p>Everything important—protected items, scans, messages and recoveries—in one focused view.</p>
          </div>
          <div className="overview-welcome-actions">
            <Link className="overview-secondary-action" href="/lost-items"><MapPin size={17} /> Explore nearby</Link>
            <Link className="overview-primary-action" href="/dashboard/items/add"><Plus size={17} /> Add an item</Link>
          </div>
        </section>

        <section className="overview-section" aria-labelledby="overview-summary-title">
          <div className="overview-section-heading">
            <div><span>At a glance</span><h2 id="overview-summary-title">Your recovery summary</h2></div>
            <Link href="/dashboard/items">View all items <ArrowRight size={15} /></Link>
          </div>
          <div className="overview-primary-grid">
            {primaryCards.map(({ label, value, note, icon: Icon, href, tone }) => (
              <Link className={`overview-primary-card ${tone}`} href={href} key={label}>
                <span className="overview-card-icon"><Icon size={20} /></span>
                <div><strong>{value}</strong><h3>{label}</h3><p>{note}</p></div>
                <ArrowRight className="overview-card-arrow" size={17} />
              </Link>
            ))}
          </div>
          <div className="overview-support-grid">
            {supportingCards.map(({ label, value, icon: Icon, href }) => (
              <Link href={href} key={label}><span><Icon size={17} /></span><div><strong>{value}</strong><small>{label}</small></div><ArrowRight size={14} /></Link>
            ))}
          </div>
        </section>

        <section className="overview-trust-panel">
          <div className="overview-trust-icon"><ShieldCheck size={23} /></div>
          <div><span>Trust profile</span><h2>{reputation?.trustLevel?.replaceAll("_", " ") ?? "New member"}</h2><p>Your trust score reflects verified platform activity. It supports safer decisions but does not guarantee identity.</p></div>
          <div className="overview-trust-score"><strong>{reputation?.trustScore ?? 0}</strong><span>Trust score</span></div>
          <Link href="/dashboard/verification">Improve profile <ArrowRight size={14} /></Link>
        </section>

        <section className="overview-section">
          <div className="overview-section-heading">
            <div><span>Latest activity</span><h2>What happened recently</h2></div>
          </div>
          <RecentActivity
            items={recentItems.map((item) => ({ id: item.id, itemName: item.itemName, createdAt: item.createdAt.toISOString() }))}
            scans={recentScans.map((scan) => ({ id: scan.id, itemName: scan.item.itemName, scannedAt: scan.scannedAt.toISOString() }))}
            messages={recentMessages.map((message) => ({ id: message.id, itemName: message.item.itemName, finderMessage: message.finderMessage, createdAt: message.createdAt.toISOString() }))}
          />
        </section>

        <section className="overview-bottom-grid">
          <div className="overview-quick-panel">
            <span>Quick actions</span><h2>Move a recovery forward.</h2>
            <div>
              <Link href="/dashboard/items/add"><Plus size={18} /><span><strong>Register an item</strong><small>Create its protected recovery record</small></span><ArrowRight size={15} /></Link>
              <Link href="/dashboard/scans"><QrCode size={18} /><span><strong>Review QR scans</strong><small>See when protected items were scanned</small></span><ArrowRight size={15} /></Link>
              <Link href="/dashboard/messages"><MessageCircle size={18} /><span><strong>Open finder messages</strong><small>Respond without exposing contact details</small></span><ArrowRight size={15} /></Link>
            </div>
          </div>
          <div className="overview-business-panel">
            {hasBusinessAccess ? (
              <div className="business-tools-grid">
                <Link className="business-tool-card" href="/dashboard/bulk-upload"><strong>Bulk Upload</strong><span>Import CSV items</span></Link>
                <Link className="business-tool-card" href="/dashboard/bulk-qr"><strong>Bulk QR Generate</strong><span>Create QR assets</span></Link>
                <a className="business-tool-card" href="/api/bulk/export-items"><strong>Export Items</strong><span>Download inventory CSV</span></a>
                <Link className="business-tool-card" href="/dashboard/bulk-qr/print"><strong>Print QR Sheet</strong><span>A4 QR labels</span></Link>
              </div>
            ) : <BusinessUpgradeCard />}
          </div>
        </section>

        <section className="overview-closing">
          <div><span><Clock3 size={14} /> Ready when you are</span><h2>One calm place for every recovery step.</h2><p>Review messages, check scan activity, and keep important items protected.</p></div>
          <Link href="/dashboard/messages">View messages <ArrowRight size={16} /></Link>
        </section>
      </DashboardLayout>
    </main>
  );
}
