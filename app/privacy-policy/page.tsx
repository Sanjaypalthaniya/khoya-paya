import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

const sections = [
  ["Introduction", "This Privacy Policy explains how Khoya Paya may collect, use, and protect information when users register items, create QR codes, and receive finder messages."],
  ["Information we collect", "We may collect account details such as name, email, optional phone number, item details, QR code records, plan information, and support messages."],
  ["How we use information", "Information is used to provide item registration, QR recovery pages, finder messaging, account support, service improvement, and safety controls."],
  ["QR code and finder message privacy", "When a finder scans a QR code, they can view the recovery page and send a message. The finder does not automatically receive the owner's private phone or email."],
  ["Owner contact privacy", "The owner's phone and email are hidden by default and are not publicly shown on the QR scan page unless the owner allows that information to be shared."],
  ["Location data policy", "Khoya Paya may use approximate location or scan context in future features only when needed for recovery, alerts, abuse prevention, or user-authorized functionality."],
  ["Data security", "We design the service with access control, responsible storage practices, and privacy-first recovery flows. No digital service can guarantee absolute security."],
  ["Cookies", "Khoya Paya may use cookies or similar technologies for sessions, preferences, analytics, and service reliability when those features are added."],
  ["User rights", "Users may request access, correction, deletion, or export of their information where applicable, subject to identity verification and legal obligations."],
  ["Contact information", "For privacy questions, contact hello@khoyapaya.app."],
];

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Navbar />
      <PageHero eyebrow="Privacy Policy" title="Privacy-first recovery is the core promise." copy="Khoya Paya is designed so owners can receive help from finders without exposing personal contact details by default." />
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
