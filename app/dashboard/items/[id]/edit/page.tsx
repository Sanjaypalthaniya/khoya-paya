import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ItemForm from "@/components/dashboard/ItemForm";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EditItemPageProps = { params: Promise<{ id: string }> };

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const item = user ? await prisma.item.findFirst({ where: { id, userId: user.id } }) : null;
  if (!item) notFound();

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Edit Item" title={`Edit ${item.itemName}`} copy="Update item recovery details, status, reward note, and contact preference." />
      <section className="section bg-section">
        <div className="container">
          <DashboardLayout active="/dashboard/items">
            <ItemForm mode="edit" item={{
              id: item.id,
              itemName: item.itemName,
              category: item.category,
              description: item.description,
              imageUrl: item.imageUrl,
              rewardAmount: item.rewardAmount ? item.rewardAmount.toString() : null,
              contactPreference: item.contactPreference,
              status: item.status,
            }} />
          </DashboardLayout>
        </div>
      </section>
      <Footer />
    </main>
  );
}
