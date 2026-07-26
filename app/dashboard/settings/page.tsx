import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import AccountSettingsForms from "@/components/dashboard/AccountSettingsForms";
import NotificationPreferencesForm from "@/components/dashboard/NotificationPreferencesForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();
  const settings = user ? await prisma.user.findUnique({ where: { id: user.id }, select: { name: true, email: true, phone: true, emailAlertsEnabled: true, whatsappAlertsEnabled: true, smsAlertsEnabled: true, qrScanAlertsEnabled: true, finderMessageAlertsEnabled: true, paymentAlertsEnabled: true, whatsappNumber: true, smsNumber: true } }) : null;
  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Settings" title="Account and notification settings." copy="Keep your profile, password and recovery alerts up to date." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/settings">
              {settings ? <><AccountSettingsForms profile={settings} /><div className="dash-toolbar"><div><small>Communication</small><h3>Notification preferences</h3></div></div><NotificationPreferencesForm preferences={settings} /></> : <div className="empty-state">Log in to manage settings.</div>}
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
