import ConversationList from "@/components/chat/ConversationList";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ChatsPage() {
  const user = await getCurrentUser();
  const conversations = user ? await prisma.conversation.findMany({ where: { ownerId: user.id }, orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }], include: { item: { select: { itemName: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { messages: { where: { senderType: "FINDER", isReadByOwner: false } } } } } }) : [];
  return <main><Navbar /><section className="section bg-section"><div className="container"><DashboardLayout active="/dashboard/chats"><div className="dash-toolbar"><div><small>{conversations.length} conversations</small><h3>Secure Chats</h3></div></div><ConversationList conversations={conversations.map((conversation) => ({ id: conversation.id, itemName: conversation.item.itemName, finderName: conversation.finderName, finderPhone: conversation.finderPhone, status: conversation.status, lastMessage: conversation.messages[0]?.message ?? null, lastMessageAt: conversation.lastMessageAt, unreadCount: conversation._count.messages }))} /></DashboardLayout></div></section><Footer /></main>;
}
