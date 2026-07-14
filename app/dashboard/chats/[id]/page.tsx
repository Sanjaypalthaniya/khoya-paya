import { notFound } from "next/navigation";
import ChatOwnerActions from "@/components/chat/ChatOwnerActions";
import ChatWindow from "@/components/chat/ChatWindow";
import CopyChatLinkButton from "@/components/chat/CopyChatLinkButton";
import VerificationPanel from "@/components/chat/VerificationPanel";
import WhatsAppButton from "@/components/chat/WhatsAppButton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { getFinderChatUrl } from "@/lib/chat";
import { prisma } from "@/lib/prisma";

export default async function OwnerChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const user = await getCurrentUser();
  const conversation = user ? await prisma.conversation.findFirst({ where: { id, ownerId: user.id }, include: { item: { select: { itemName: true, category: true } }, messages: { orderBy: { createdAt: "asc" } } } }) : null;
  if (!conversation) notFound();
  await prisma.chatMessage.updateMany({ where: { conversationId: id, senderType: "FINDER", isReadByOwner: false }, data: { isReadByOwner: true, status: "READ" } });
  return <main><Navbar /><section className="section bg-section"><div className="container"><DashboardLayout active="/dashboard/chats"><div className="chat-detail-header"><div><span className="status-pill">{conversation.status}</span><h3>{conversation.finderName || "Anonymous finder"}</h3><p>Secure conversation about {conversation.item.itemName} · {conversation.item.category}</p></div><div className="message-actions"><CopyChatLinkButton url={getFinderChatUrl(conversation.finderAccessToken)} /><WhatsAppButton phone={conversation.finderPhone} /><ChatOwnerActions conversationId={id} status={conversation.status} /></div></div><VerificationPanel mode="OWNER" conversationId={id} /><ChatWindow initialMessages={conversation.messages.map((message) => ({ id: message.id, senderType: message.senderType, message: message.message, createdAt: message.createdAt.toISOString() }))} initialStatus={conversation.status} fetchUrl={`/api/dashboard/chats/${id}`} sendUrl={`/api/dashboard/chats/${id}/messages`} readUrl={`/api/dashboard/chats/${id}/read`} viewer="OWNER" /></DashboardLayout></div></section><Footer /></main>;
}
