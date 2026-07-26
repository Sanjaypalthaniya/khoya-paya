import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { prisma } from "@/lib/prisma";
import { safePublicText } from "@/lib/public-content";

export default async function LostItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category } = await searchParams;
  const items = await prisma.item.findMany({
    where: {
      status: "LOST",
      publicSearchVisible: true,
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { itemName: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { lastSeenLocation: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    take: 30,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="lost-items-page">
      <Navbar />
      <PageHero
        eyebrow="Community recovery"
        title="Public lost items."
        copy="Search privacy-safe listings and use the Recovery ID to notify an owner securely."
      />
      <section className="section bg-section">
        <div className="container">
          <form className="recovery-search-card">
            <label>
              <span className="visually-hidden">Search lost items</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by item, category, colour or location"
              />
            </label>
            <button className="btn btn-primary-kp" type="submit">
              Search
            </button>
          </form>
          {items.length ? (
            <div className="lost-items-grid">
              {items.map((item) => (
                <article className="lost-item-card" key={item.id}>
                  <span className="status-pill">{item.category}</span>
                  <h2>{safePublicText(item.itemName, "Lost item")}</h2>
                  <p>
                    {safePublicText(
                      item.description,
                      "No public description was provided.",
                    )}
                  </p>
                  <small>
                    Last seen:{" "}
                    {safePublicText(
                      item.lastSeenLocation,
                      "Location not shared",
                    )}
                  </small>
                  <Link
                    className="btn btn-secondary-kp"
                    href={`/recover/${item.recoveryCode}`}
                  >
                    I found this item
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="feed-state lost-items-empty">
              <strong>No lost items found</strong>
              <p>Try another item name, category, colour or location.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
