"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell, Box, ChevronRight, CircleDollarSign, Clock3, FileUp, Grid2X2,
  History, LayoutDashboard, MessagesSquare, MessageSquareText, Plus, Settings, SearchCheck,
  ShieldCheck, Sparkles, X,
} from "lucide-react";

const links = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Items", href: "/dashboard/items", icon: Box },
  { label: "Add Item", href: "/dashboard/items/add", icon: Plus },
  { label: "Community Posts", href: "/dashboard/community-posts", icon: FileUp },
  { label: "Bulk Upload", href: "/dashboard/bulk-upload", icon: FileUp },
  { label: "Bulk QR", href: "/dashboard/bulk-qr", icon: Grid2X2 },
  { label: "Bulk History", href: "/dashboard/bulk-history", icon: History },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Finder Messages", href: "/dashboard/messages", icon: MessageSquareText },
  { label: "Chats", href: "/dashboard/chats", icon: MessagesSquare },
  { label: "Recovery Requests", href: "/dashboard/recovery-requests", icon: History },
  { label: "Found Reports", href: "/dashboard/found-reports", icon: SearchCheck },
  { label: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
  { label: "Scan History", href: "/dashboard/scans", icon: Clock3 },
  { label: "Billing", href: "/dashboard/billing", icon: CircleDollarSign },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type Props = {
  active: string;
  user?: { name: string; email: string } | null;
  planName?: string;
  itemCount?: number;
  itemLimit?: number;
};

export default function DashboardSidebar({ active, user, planName = "Free", itemCount = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "KP";

  return (
    <>
      <button className="dashboard-mobile-trigger" type="button" onClick={() => setOpen(true)} aria-label="Open dashboard menu">
        <Grid2X2 size={19} /> Menu
      </button>
      {open ? <button className="dashboard-sidebar-backdrop" aria-label="Close dashboard menu" onClick={() => setOpen(false)} /> : null}
      <aside className={`dashboard-sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand-row">
          <Link className="sidebar-brand" href="/"><span>K</span>Khoya Paya</Link>
          <button className="sidebar-close" type="button" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <div className="sidebar-user-card">
          <span className="sidebar-avatar">{initials}</span>
          <div><strong>{user?.name || "Khoya Paya User"}</strong><small>{planName} plan</small></div>
          <ChevronRight size={16} />
          <div className="sidebar-user-stats">
            <span><b>{itemCount}</b>Protected</span><span><b>∞</b>Core items</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          <span className="sidebar-label">Workspace</span>
          {links.map(({ label, href, icon: Icon }) => (
            <Link className={active === href ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-plan-card">
          <div className="sidebar-plan-head"><span><Sparkles size={16} /> Current plan</span><b>{planName}</b></div>
          <div className="sidebar-usage-copy"><span>Item registration</span><span>Unlimited</span></div>
          <Link href="/dashboard/billing"><ShieldCheck size={17} /> Upgrade plan</Link>
        </div>
      </aside>
    </>
  );
}
