import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

const sections = [
  ["Acceptance of terms", "By using Khoya Paya, you agree to these terms and any future service policies that apply to your account or plan."],
  ["Use of Khoya Paya service", "The service is intended to help users register items, create QR codes, receive finder messages, and coordinate lost item recovery."],
  ["User responsibilities", "Users are responsible for providing accurate item information, keeping account details current, and using recovery features respectfully."],
  ["QR code usage", "QR codes should be attached only to items you own or are authorized to manage. Do not use QR codes for misleading, harmful, or unlawful purposes."],
  ["Finder message responsibility", "Finders are expected to send honest, safe, and relevant messages. Abuse, harassment, spam, or fraudulent recovery claims are prohibited."],
  ["Lost item recovery limitation", "Khoya Paya improves the chance of recovery but cannot guarantee that a lost item will be found, returned, or returned in original condition."],
  ["Prohibited use", "Do not use the service for fraud, stalking, illegal tracking, impersonation, data scraping, harmful content, or attempts to bypass privacy controls."],
  ["Account security", "Users are responsible for protecting login credentials and notifying Khoya Paya if unauthorized account activity is suspected."],
  ["Paid plans if applicable", "Premium or Business features may be subject to plan limits, pricing, renewal, cancellation, and availability terms shown at purchase."],
  ["Limitation of liability", "Khoya Paya is not liable for lost items, finder conduct, third-party actions, indirect damages, or recovery outcomes beyond what applicable law requires."],
  ["Changes to terms", "We may update these terms as the product evolves. Continued use of the service after changes means you accept the updated terms."],
  ["Contact", "For terms-related questions, contact hello@khoyapaya.app."],
];

export default function TermsPage() {
  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Terms and Conditions" title="Clear rules for safe item recovery." copy="These terms define responsible use of Khoya Paya QR codes, finder messaging, accounts, and future paid plans." />
      <section className="section bg-section">
        <div className="container">
          <article className="legal-card">
            {sections.map(([title, copy]) => (
              <section key={title}>
                <h2>{title}</h2>
                <p>{copy}</p>
              </section>
            ))}
          </article>
        </div>
      </section>
      <Footer />
    </main>
  );
}
