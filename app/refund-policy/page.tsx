import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";

export default function RefundPolicyPage() {
  return <main><Navbar /><PageHero eyebrow="Refund policy" title="Clear support for payment questions." copy="Refund eligibility depends on the purchased plan, fulfilment state, and applicable consumer protections." /><section className="section bg-section"><article className="container legal-card"><section><h2>Requesting a refund</h2><p>Contact support with the email used for purchase, transaction reference, and a short explanation. Never send payment PINs, OTPs, or full card details.</p></section><section><h2>Digital services</h2><p>Eligibility may depend on whether paid QR or account services have already been activated or substantially used.</p></section><section><h2>Processing</h2><p>Approved refunds are returned through the original payment method where supported. Provider processing times may apply.</p></section></article></section><Footer /></main>;
}
