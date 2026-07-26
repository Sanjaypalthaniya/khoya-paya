import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export type EditorialSection = {
  title: string;
  copy: string;
  icon?: LucideIcon;
  href?: string;
  linkLabel?: string;
};

export default function PublicEditorialPage({
  eyebrow,
  title,
  copy,
  sections,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  sections: EditorialSection[];
}) {
  return <main>
    <Navbar />
    <PageHero eyebrow={eyebrow} title={title} copy={copy} />
    <section className="section bg-section">
      <div className="container public-editorial-grid">
        {sections.map(({ title: heading, copy: body, icon: Icon, href, linkLabel }) =>
          <article className="public-editorial-card" key={heading}>
            {Icon && <Icon aria-hidden="true" />}
            <h2>{heading}</h2>
            <p>{body}</p>
            {href && <Link href={href}>{linkLabel || "Read more"} →</Link>}
          </article>)}
      </div>
    </section>
    <Footer />
  </main>;
}
