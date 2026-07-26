import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

const articles = {
  "first-30-minutes": ["The first 30 minutes after losing something", ["Pause and retrace", "Secure anything sensitive", "Create one clear report"]],
  "write-a-useful-report": ["Write a report people can recognise", ["Describe what is visible", "Keep verification details private", "Add a useful location and time"]],
  "found-a-wallet": ["What to do when you find a wallet", ["Protect its contents", "Use a safe contact route", "Verify before the handover"]],
} as const;

export function generateStaticParams() {
  return Object.keys(articles).map(slug => ({ slug }));
}

export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug as keyof typeof articles];
  if (!article) notFound();
  return <main><Navbar /><PageHero eyebrow="Recovery guide" title={article[0]} copy="Practical, privacy-first guidance from the Khoya Paya community." /><section className="section bg-section"><article className="container public-copy-shell">{article[1].map((heading, index) => <section key={heading}><small>0{index + 1}</small><h2>{heading}</h2><p>Stay calm, share only what is useful, and keep private identifying details for ownership verification. Use platform messaging and choose a safe public handover.</p></section>)}</article></section><Footer /></main>;
}
