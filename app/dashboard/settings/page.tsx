import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export default function DashboardSettingsPage() {
  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Settings" title="Dashboard settings placeholder." copy="Account and notification settings will be added in a future step." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/settings">
              <div className="empty-state">Settings placeholder for the next backend step.</div>
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
