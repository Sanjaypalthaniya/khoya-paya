import Link from "next/link";
import { ArrowRight, Clock3, MessageSquareText } from "lucide-react";
import WhatsAppButton from "@/components/chat/WhatsAppButton";
import { formatDateTime } from "@/lib/date-time";

type Conversation = { id: string; itemName: string; finderName: string | null; finderPhone: string | null; status: string; lastMessage: string | null; lastMessageAt: Date | null; unreadCount: number };
export default function ConversationList({ conversations }: { conversations: Conversation[] }) {
  if (!conversations.length) return <div className="empty-state"><MessageSquareText size={24} /><h3>No conversations yet</h3><p>Start a secure chat from a finder message.</p></div>;
  return <div className="conversation-list">{conversations.map((conversation) => (
    <article className="conversation-card" key={conversation.id}>
      <span className="message-avatar">{(conversation.finderName || "F")[0]?.toUpperCase()}</span>
      <div className="conversation-copy"><div><h3>{conversation.finderName || "Anonymous finder"}</h3><span className="status-pill">{conversation.status}</span>{conversation.unreadCount ? <b>{conversation.unreadCount} unread</b> : null}</div><small>About {conversation.itemName}</small><p>{conversation.lastMessage || "No messages yet"}</p>{conversation.lastMessageAt ? <time><Clock3 size={13} /> {formatDateTime(conversation.lastMessageAt)}</time> : null}</div>
      <div className="conversation-actions"><Link className="btn btn-primary-kp btn-sm-pill" href={`/dashboard/chats/${conversation.id}`}>Open chat <ArrowRight size={16} /></Link><WhatsAppButton phone={conversation.finderPhone} /></div>
    </article>
  ))}</div>;
}
