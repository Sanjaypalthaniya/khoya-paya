import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EmptyState from "@/components/dashboard/EmptyState";
import ItemCard from "@/components/dashboard/ItemCard";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardItemsPage() {
  const user = await getCurrentUser();
  const items = user
    ? await prisma.item.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: { qrCode: { select: { id: true } } },
      })
    : [];

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="My Items" title="Manage your protected items." copy="Add valuables, generate recovery QR codes, and control Lost Mode from one dashboard." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/items">
            <div className="dash-toolbar">
              <div><small>{items.length} registered items</small><h3>My Items</h3></div>
              <Link className="btn btn-primary-kp btn-sm-pill" href="/dashboard/items/add">Add Your First Item</Link>
            </div>
            {items.length ? (
              <div className="dashboard-item-grid">
                {items.map((item) => <ItemCard item={item} key={item.id} />)}
              </div>
            ) : (
              <EmptyState title="No items registered yet" copy="Create your first item and generate a private recovery QR code." actionLabel="Add Your First Item" actionHref="/dashboard/items/add" />
            )}
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
