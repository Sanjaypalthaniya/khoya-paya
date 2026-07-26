type RecentActivityProps = {
  items?: Array<{ id: string; itemName: string; createdAt: string }>;
  scans: Array<{ id: string; itemName: string; scannedAt: string }>;
  messages: Array<{ id: string; itemName: string; finderMessage: string; createdAt: string }>;
};

export default function RecentActivity({ items = [], scans, messages }: RecentActivityProps) {
  const groups = [
    { title: "Recent items", href: "/dashboard/items", icon: Box, entries: items.map(item => ({ id: item.id, title: item.itemName, copy: new Date(item.createdAt).toLocaleString() })), empty: "Register an item to start protecting it." },
    { title: "Recent scans", href: "/dashboard/scans", icon: QrCode, entries: scans.map(scan => ({ id: scan.id, title: scan.itemName, copy: new Date(scan.scannedAt).toLocaleString() })), empty: "QR scan activity will appear here." },
    { title: "Finder messages", href: "/dashboard/messages", icon: MessageCircle, entries: messages.map(message => ({ id: message.id, title: message.itemName, copy: message.finderMessage })), empty: "New finder messages will appear here." },
  ];
  return (
    <div className="recent-activity-grid">
      {groups.map(({ title, href, icon: Icon, entries, empty }) => <article className="recent-card overview-recent-card" key={title}>
        <header><span><Icon size={18} /></span><h3>{title}</h3><Link href={href} aria-label={`View all ${title.toLowerCase()}`}><ArrowRight size={16} /></Link></header>
        <div className="overview-recent-list">
          {entries.length ? entries.map(entry => <div className="recent-row" key={entry.id}><strong>{entry.title}</strong><span>{entry.copy}</span></div>) : <div className="overview-recent-empty"><Icon size={20} /><p>{empty}</p></div>}
        </div>
      </article>)}
    </div>
  );
}
import Link from "next/link";
import { ArrowRight, Box, MessageCircle, QrCode } from "lucide-react";
