"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Clock3, Copy, Mail, MapPin, MessageSquareText, Phone, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import WhatsAppButton from "@/components/chat/WhatsAppButton";

type MessageCardProps = {
  message: {
    id: string;
    itemName: string;
    finderName: string | null;
    finderPhone: string | null;
    finderEmail: string | null;
    finderMessage: string;
    finderLocation: string | null;
    finderPhotoUrl: string | null;
    status: "NEW" | "READ" | "RESOLVED" | "SPAM";
    createdAt: string;
    conversation: { id: string; finderChatUrl: string } | null;
  };
};

const actions = ["READ", "RESOLVED", "SPAM"] as const;

export default function MessageCard({ message }: MessageCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState(message.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [chat, setChat] = useState(message.conversation);

  async function updateStatus(nextStatus: typeof actions[number]) {
    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch(`/api/dashboard/messages/${message.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        setStatus(nextStatus);
      } else {
        setError("Unable to update message status.");
      }
    } catch {
      setError("Unable to update message status.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function ensureChat() {
    if (chat) return chat;
    const response = await fetch(`/api/dashboard/messages/${message.id}/start-chat`, { method: "POST" });
    const body = await response.json();
    if (!response.ok) { setError(body.message ?? "Unable to start chat."); return null; }
    const created = { id: body.data.conversationId, finderChatUrl: body.data.finderChatUrl };
    setChat(created);
    return created;
  }

  async function openChat() { const conversation = await ensureChat(); if (conversation) router.push(`/dashboard/chats/${conversation.id}`); }
  async function copyChatLink() { const conversation = await ensureChat(); if (conversation) await navigator.clipboard.writeText(conversation.finderChatUrl); }

  return (
    <article className="dashboard-message-card">
      <div className="message-card-head">
        <div className="message-sender">
          <span className="message-avatar" aria-hidden="true">{(message.finderName || "F").charAt(0).toUpperCase()}</span>
          <div>
          <small>Message about {message.itemName}</small>
          <h3>{message.finderName || "Anonymous finder"}</h3>
          </div>
        </div>
        <div className="message-card-meta">
          <span className="status-pill">{status}</span>
          <small><Clock3 size={14} /> {new Date(message.createdAt).toLocaleString()}</small>
        </div>
      </div>
      <div className="message-copy"><MessageSquareText size={18} /><p>{message.finderMessage}</p></div>
      {message.finderPhotoUrl ? (
        <a className="finder-photo-preview" href={message.finderPhotoUrl} target="_blank" rel="noreferrer">
          <Image src={message.finderPhotoUrl} alt="Finder uploaded item photo" width={640} height={400} unoptimized />
          <span>Open uploaded photo</span>
        </a>
      ) : null}
      {error ? <p className="auth-alert error" role="alert">{error}</p> : null}
      <div className="message-contact-grid">
        <div className="message-contact-item"><User size={16} /><small>Name</small><span>{message.finderName || "Not shared"}</span></div>
        <div className="message-contact-item"><Phone size={16} /><small>Phone</small><span>{message.finderPhone || "Not shared"}</span></div>
        <div className="message-contact-item"><Mail size={16} /><small>Email</small><span>{message.finderEmail || "Not shared"}</span></div>
        <div className="message-contact-item"><MapPin size={16} /><small>Location</small><span>{message.finderLocation || "Not shared"}</span></div>
      </div>
      <div className="message-actions">
        <button className="btn btn-primary-kp btn-sm-pill" onClick={openChat} type="button"><MessageSquareText size={16} /> Open chat</button>
        <button className="btn btn-secondary-kp btn-sm-pill" onClick={copyChatLink} type="button"><Copy size={16} /> Copy chat link</button>
        <WhatsAppButton phone={message.finderPhone} />
        {actions.map((action) => (
          <button className="btn btn-secondary-kp btn-sm-pill" disabled={isUpdating || status === action} onClick={() => updateStatus(action)} type="button" key={action}>
            {action === "RESOLVED" ? <ShieldCheck size={16} /> : <Check size={16} />} Mark {action.toLowerCase()}
          </button>
        ))}
      </div>
    </article>
  );
}
