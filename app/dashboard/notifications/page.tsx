import DashboardLayout from "@/components/dashboard/DashboardLayout";
import NotificationList from "@/components/dashboard/NotificationList";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const notifications = user
    ? await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 })
    : [];
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Notifications" title="Alerts from your recovery activity." copy="Track finder messages, QR scans, payments, and system updates in one place." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/notifications">
            <div className="dash-toolbar"><div><small>{unreadCount} unread</small><h3>All Notifications</h3></div></div>
            <NotificationList notifications={notifications.map((notification) => ({
              id: notification.id,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              link: notification.link,
              isRead: notification.isRead,
              createdAt: notification.createdAt.toISOString(),
            }))} />
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
