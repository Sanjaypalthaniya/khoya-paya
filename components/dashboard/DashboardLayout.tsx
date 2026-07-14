import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DashboardLayoutProps = { active: string; children: ReactNode };

const pageCopy: Record<string, [string, string]> = {
  "/dashboard": ["Overview", "A clear view of your protected items and recent recovery activity."],
  "/dashboard/items": ["My Items", "Manage every protected item and its recovery status."],
  "/dashboard/items/add": ["Add Item", "Register a valuable and make it ready for safe recovery."],
  "/dashboard/community-posts": ["Community Posts", "Manage your published posts and drafts."],
  "/dashboard/bulk-upload": ["Bulk Upload", "Import and protect multiple items in one workflow."],
  "/dashboard/bulk-qr": ["Bulk QR", "Generate recovery codes for multiple items."],
  "/dashboard/bulk-history": ["Bulk History", "Review previous imports and their results."],
  "/dashboard/notifications": ["Notifications", "Stay current with important account and recovery updates."],
  "/dashboard/messages": ["Finder Messages", "Review messages from people who found your items."],
  "/dashboard/chats": ["Secure Chats", "Chat privately with finders without exposing your contact details."],
  "/dashboard/recovery-requests": ["Recovery Requests", "Track ownership verification, meetings, returns, and completion."],
  "/dashboard/found-reports": ["Found Reports", "Review smart matches submitted by finders."],
  "/dashboard/verification": ["Verification", "Manage trust signals for your profile and important items."],
  "/dashboard/recovery-history": ["Recovery History", "Review completed and closed recovery workflows."],
  "/dashboard/scans": ["Scan History", "See when and where your recovery codes were scanned."],
  "/dashboard/billing": ["Billing", "Manage your plan, usage, and payment history."],
  "/dashboard/settings": ["Settings", "Manage your account and preferences."],
  "/dashboard/settings/notifications": ["Notification Settings", "Choose how you receive recovery alerts."],
};

export default async function DashboardLayout({ active, children }: DashboardLayoutProps) {
  const user = await getCurrentUser();
  const [itemCount, subscription] = user ? await Promise.all([
    prisma.item.count({ where: { userId: user.id } }),
    prisma.subscription.findFirst({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { createdAt: "desc" }, include: { plan: true } }),
  ]) : [0, null];
  const [title, description] = pageCopy[active] ?? ["Dashboard", "Manage your Khoya Paya workspace."];
  const planName = subscription?.plan.name ?? "Free";
  const itemLimit = subscription?.plan.itemLimit ?? 2;

  return (
    <div className="dashboard-shell dashboard-placeholder">
      <DashboardSidebar active={active} user={user} planName={planName} itemCount={itemCount} itemLimit={itemLimit} />
      <div className="dash-main">
        <header className="dashboard-header">
          <div className="dashboard-title"><span>Dashboard</span><h1>{title}</h1><p>{description}</p></div>
          <div className="dashboard-header-actions">
            <label className="dashboard-search"><Search size={18} /><input type="search" placeholder="Search workspace..." aria-label="Search workspace" /><kbd>⌘ K</kbd></label>
            {user ? <NotificationBell userId={user.id} /> : null}
            <details className="dashboard-profile">
              <summary><span>{user?.name?.charAt(0).toUpperCase() || "K"}</span><div><b>{user?.name || "Account"}</b><small>{planName} plan</small></div><ChevronDown size={16} /></summary>
              <div><Link href="/dashboard/settings">Account settings</Link><Link href="/dashboard/billing">Plan & billing</Link></div>
            </details>
          </div>
        </header>
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
