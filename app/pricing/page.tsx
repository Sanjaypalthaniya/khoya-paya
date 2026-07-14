import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import PricingCards from "@/components/PricingCards";

const faqs = [
  ["Can I start free?", "Yes. The Free plan is designed for basic item registration and QR recovery previews."],
  ["Is owner contact public?", "No. Phone and email stay hidden by default unless the owner allows sharing."],
  ["Do businesses get bulk QR codes?", "Yes. Business plans support bulk QR codes, team workflows, and asset tracking."],
];

export default function PricingPage() {
  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Pricing" title="Choose protection that fits your items." copy="Start small, upgrade for Lost Mode and scan alerts, or build a business recovery workflow for schools, offices, and teams." />
      <section className="pricing-section bg-section">
        <div className="container">
          <PricingCards />
          <div className="faq-mini">
            <div className="section-heading">
              <span className="eyebrow teal-text">FAQ</span>
              <h2>Plan questions, answered simply.</h2>
            </div>
            <div className="row g-4">
              {faqs.map(([question, answer]) => (
                <div className="col-md-4" key={question}>
                  <article className="info-card h-100">
                    <h3>{question}</h3>
                    <p>{answer}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <CTASection title="Need QR protection for a school or office?" copy="Talk to us about bulk codes, dashboards, and asset tracking workflows." primaryLabel="Contact Us" primaryHref="/contact" />
      <Footer />
    </main>
  );
}
