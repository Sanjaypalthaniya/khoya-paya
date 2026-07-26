"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell, Box, ChevronRight, CircleDollarSign, Clock3, FileUp, Grid2X2,
  History, LayoutDashboard, MessagesSquare, MessageSquareText, Newspaper, Plus, Settings, SearchCheck,
  ShieldCheck, Sparkles, X,
} from "lucide-react";

const linkGroups = [
  { label: "Workspace", links: [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Feed", href: "/dashboard/feed", icon: Newspaper },
    { label: "My Items", href: "/dashboard/items", icon: Box },
    { label: "Add Item", href: "/dashboard/items/add", icon: Plus },
    { label: "Community Posts", href: "/dashboard/community-posts", icon: FileUp },
  ]},
  { label: "Recovery", links: [
    { label: "Claims & Returns", href: "/dashboard/claims", icon: ShieldCheck },
    { label: "Finder Messages", href: "/dashboard/messages", icon: MessageSquareText },
    { label: "Secure Chats", href: "/dashboard/chats", icon: MessagesSquare },
    { label: "Recovery Requests", href: "/dashboard/recovery-requests", icon: History },
    { label: "Found Reports", href: "/dashboard/found-reports", icon: SearchCheck },
    { label: "Scan History", href: "/dashboard/scans", icon: Clock3 },
  ]},
  { label: "Manage", links: [
    { label: "Bulk Upload", href: "/dashboard/bulk-upload", icon: FileUp },
    { label: "Bulk QR", href: "/dashboard/bulk-qr", icon: Grid2X2 },
    { label: "Bulk History", href: "/dashboard/bulk-history", icon: History },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Verification", href: "/dashboard/verification", icon: ShieldCheck },
    { label: "Billing", href: "/dashboard/billing", icon: CircleDollarSign },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ]},
];

type Props = {
  active: string;
  user?: { name: string; email: string } | null;
  planName?: string;
  itemCount?: number;
  itemLimit?: number;
};

export default function DashboardSidebar({ active, user, planName = "Free", itemCount = 0, itemLimit = 2 }: Props) {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "KP";
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button className="dashboard-mobile-trigger" type="button" onClick={() => setOpen(true)} aria-label="Open dashboard menu">
        <Grid2X2 size={19} /> Menu
      </button>
      {open ? <button className="dashboard-sidebar-backdrop" type="button" aria-label="Close dashboard menu" onClick={() => setOpen(false)} /> : null}
      <aside className={`dashboard-sidebar ${open ? "is-open" : ""}`} ref={sidebarRef} aria-label="Dashboard sidebar">
        <div className="sidebar-brand-row">
          <Link className="sidebar-brand" href="/"><span>K</span>Khoya Paya</Link>
          <button className="sidebar-close" type="button" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>

        <div className="sidebar-user-card">
          <span className="sidebar-avatar">{initials}</span>
          <div><strong>{user?.name || "Khoya Paya User"}</strong><small>{planName} plan</small></div>
          <ChevronRight size={16} />
          <div className="sidebar-user-stats">
            <span><b>{itemCount}</b>Protected</span><span><b>{itemLimit}</b>Plan limit</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {linkGroups.map(group => <div className="sidebar-nav-group" key={group.label}>
            <span className="sidebar-label">{group.label}</span>
            {group.links.map(({ label, href, icon: Icon }) => (
              <Link className={active === href ? "active" : ""} href={href} key={href} onClick={() => setOpen(false)}>
                <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
              </Link>
            ))}
          </div>)}
        </nav>

        <div className="sidebar-plan-card">
          <div className="sidebar-plan-head"><span><Sparkles size={16} /> Current plan</span><b>{planName}</b></div>
          <div className="sidebar-usage-copy"><span>Item registration</span><span>{itemCount} of {itemLimit}</span></div>
          <Link href="/dashboard/billing"><ShieldCheck size={17} /> Upgrade plan</Link>
        </div>
      </aside>
    </>
  );
}
