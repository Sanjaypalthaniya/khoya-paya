import AdminNotificationsTable from "@/components/admin/AdminNotificationsTable";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function AdminNotificationsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Admin" title="Platform notifications." copy="Review notification delivery and read state across users." />
      <section className="section bg-section">
        <div className="container">
          <article className="dashboard-message-card">
            <div className="dash-toolbar"><div><small>{notifications.length} latest</small><h3>Notifications</h3></div></div>
            <AdminNotificationsTable notifications={notifications} />
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
