import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ItemForm from "@/components/dashboard/ItemForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export default function DashboardAddItemPage() {
  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Add Item" title="Register a valuable item." copy="Add safe item details and prepare it for QR-based recovery." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/items/add">
            <div className="dash-toolbar"><div><small>New protected item</small><h3>Add Item</h3></div></div>
            <ItemForm mode="create" />
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
