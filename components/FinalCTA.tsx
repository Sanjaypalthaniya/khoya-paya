import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="final-cta" id="contact">
      <div className="container reveal-up">
        <h2>Protect your valuables before they get lost.</h2>
        <div className="hero-actions justify-content-center">
          <Link className="btn btn-primary-kp" href="/signup">Get Started</Link>
          <Link className="btn btn-accent-kp" href="/dashboard">View Dashboard</Link>
        </div>
      </div>
    </section>
  );
}
