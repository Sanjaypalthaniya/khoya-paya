import Link from "next/link";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";

type NotificationBellProps = {
  userId: string;
};

export default async function NotificationBell({ userId }: NotificationBellProps) {
  const [unreadCount, recent] = await Promise.all([
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="notification-bell">
      <Link className="notification-bell-button" href="/dashboard/notifications" aria-label="Notifications">
        <Bell size={19} />
        {unreadCount ? <strong>{unreadCount}</strong> : null}
      </Link>
      <div className="notification-dropdown">
        {recent.length ? recent.map((notification) => (
          <Link className={notification.isRead ? "notification-mini" : "notification-mini unread"} href={notification.link || "/dashboard/notifications"} key={notification.id}>
            <span>{notification.title}</span>
            <small>{notification.message}</small>
          </Link>
        )) : <p>No notifications yet.</p>}
        <Link className="notification-view-all" href="/dashboard/notifications">View All Notifications</Link>
      </div>
    </div>
  );
}
