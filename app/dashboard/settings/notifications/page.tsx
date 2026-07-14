import DashboardLayout from "@/components/dashboard/DashboardLayout";
import NotificationPreferencesForm from "@/components/dashboard/NotificationPreferencesForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const preferences = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      emailAlertsEnabled: true,
      whatsappAlertsEnabled: true,
      smsAlertsEnabled: true,
      qrScanAlertsEnabled: true,
      finderMessageAlertsEnabled: true,
      paymentAlertsEnabled: true,
      whatsappNumber: true,
      smsNumber: true,
    },
  });

  if (!preferences) notFound();

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Notification Settings" title="Choose how Khoya Paya alerts you." copy="Control in-app, email, WhatsApp, SMS, finder message, QR scan, and payment alerts." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/settings">
            <div className="dash-toolbar"><div><small>Preferences</small><h3>Notification Alerts</h3></div></div>
            <NotificationPreferencesForm preferences={preferences} />
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
