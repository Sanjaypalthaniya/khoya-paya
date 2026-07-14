import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MessageCard from "@/components/dashboard/MessageCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardMessagesPage() {
  const user = await getCurrentUser();
  const messages = user
    ? await prisma.finderMessage.findMany({
        where: { item: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        include: { item: { select: { itemName: true } }, conversation: { select: { id: true, finderAccessToken: true } } },
      })
    : [];

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Finder Messages" title="Messages from people who found your items." copy="Review finder contact details, keep private recovery organized, and mark messages as read, resolved, or spam." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/messages">
              <div className="dash-toolbar">
                <div>
                  <small>{messages.length} messages</small>
                  <h3>Finder Messages</h3>
                </div>
              </div>
              <div className="dashboard-message-list">
                {messages.length ? messages.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={{
                      id: message.id,
                      itemName: message.item.itemName,
                      finderName: message.finderName,
                      finderPhone: message.finderPhone,
                      finderEmail: message.finderEmail,
                      finderMessage: message.finderMessage,
                      finderLocation: message.finderLocation,
                      finderPhotoUrl: message.finderPhotoUrl,
                      status: message.status,
                      createdAt: message.createdAt.toISOString(),
                      conversation: message.conversation ? {
                        id: message.conversation.id,
                        finderChatUrl: `${(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")}/chat/finder/${message.conversation.finderAccessToken}`,
                      } : null,
                    }}
                  />
                )) : <div className="empty-state">No finder messages yet.</div>}
              </div>
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
