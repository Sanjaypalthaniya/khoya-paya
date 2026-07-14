import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function AdminBulkActivityPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptions: { where: { status: "ACTIVE" }, include: { plan: true }, take: 1, orderBy: { createdAt: "desc" } },
      bulkImportLogs: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Admin" title="Bulk activity." copy="Monitor business CSV imports and failed row counts." />
      <section className="section bg-section">
        <div className="container">
          <div className="dashboard-message-card">
            <div className="dash-toolbar"><div><small>{users.length} users</small><h3>Bulk Activity</h3></div></div>
            <div className="scan-table-wrap">
              <table className="scan-table">
                <thead><tr><th>User</th><th>Business</th><th>Uploads</th><th>Imported</th><th>Failed</th><th>Last Upload</th></tr></thead>
                <tbody>
                  {users.map((entry) => {
                    const imported = entry.bulkImportLogs.reduce((sum, log) => sum + log.importedCount, 0);
                    const failed = entry.bulkImportLogs.reduce((sum, log) => sum + log.failedCount, 0);
                    return (
                      <tr key={entry.id}>
                        <td>{entry.name}<br /><small>{entry.email}</small></td>
                        <td>{entry.subscriptions[0]?.plan.name.toLowerCase().includes("business") ? "Yes" : "No"}</td>
                        <td>{entry.bulkImportLogs.length}</td>
                        <td>{imported}</td>
                        <td>{failed}</td>
                        <td>{entry.bulkImportLogs[0]?.createdAt.toLocaleString() ?? "Never"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
