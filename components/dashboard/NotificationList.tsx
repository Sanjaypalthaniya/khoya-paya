"use client";

import { useRouter } from "next/navigation";
import NotificationCard from "@/components/dashboard/NotificationCard";
import { BellOff, CheckCheck } from "lucide-react";

type NotificationListProps = {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
  }>;
};

export default function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    router.refresh();
  }

  return (
    <div className="notification-list">
      <div className="message-actions notification-list-actions">
        <button className="btn btn-secondary-kp btn-sm-pill" onClick={markAllRead} type="button"><CheckCheck size={16} /> Mark all read</button>
      </div>
      {notifications.length ? notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />) : <div className="empty-state"><BellOff size={24} /><h3>You’re all caught up</h3><p>New recovery and account alerts will appear here.</p></div>}
    </div>
  );
}
