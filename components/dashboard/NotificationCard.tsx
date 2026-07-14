"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, Clock3, ExternalLink, Trash2 } from "lucide-react";

type NotificationCardProps = {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
  };
};

export default function NotificationCard({ notification }: NotificationCardProps) {
  const router = useRouter();

  async function markRead() {
    await fetch(`/api/notifications/${notification.id}/read`, { method: "PATCH" });
    router.refresh();
  }

  async function remove() {
    await fetch(`/api/notifications/${notification.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <article className={notification.isRead ? "notification-card" : "notification-card unread"}>
      <div className="notification-icon" aria-hidden="true"><Bell size={18} /></div>
      <div className="notification-body">
        <div className="notification-meta"><span className="status-pill">{notification.type.replaceAll("_", " ")}</span>{!notification.isRead ? <span className="unread-indicator">Unread</span> : null}</div>
        <h3>{notification.title}</h3>
        <p>{notification.message}</p>
        <small><Clock3 size={14} /> {new Date(notification.createdAt).toLocaleString()}</small>
      </div>
      <div className="message-actions">
        {notification.link ? <Link className="btn btn-primary-kp btn-sm-pill" href={notification.link}><ExternalLink size={16} /> Open</Link> : null}
        {!notification.isRead ? <button className="btn btn-secondary-kp btn-sm-pill" onClick={markRead} type="button"><Check size={16} /> Mark read</button> : null}
        <button aria-label="Delete notification" className="btn btn-danger btn-icon" onClick={remove} type="button"><Trash2 size={16} /></button>
      </div>
    </article>
  );
}
