import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="qr-pattern-layer" />
      <div className="scan-line line-one" />
      <div className="scan-line line-two" />
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <p className="hero-badge hero-reveal">Smart QR Recovery Platform</p>
            <h1 className="hero-title hero-reveal">Never Lose What Matters Again</h1>
            <p className="hero-copy hero-reveal">
              Register your valuables, generate a smart QR code, and let honest finders contact you safely when your item is lost.
            </p>
            <div className="hero-actions hero-reveal">
              <Link href="/signup" className="btn btn-primary-kp">Get Started</Link>
              <Link href="#how-it-works" className="btn btn-secondary-kp">Book a Demo</Link>
            </div>
            <div className="trust-row hero-reveal">
              <span>Download App</span>
              <span>Private by default</span>
              <span>Works across India</span>
              <span>Finder-safe contact</span>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-device-wrap parallax-soft">
              <div className="hero-orbit" />
              <div className="floating-card card-one">QR Code Active</div>
              <div className="floating-card card-two">Finder Message Received</div>
              <div className="floating-card card-three">Lost Mode On</div>
              <div className="phone-mockup hero-phone phone-float">
                <div className="phone-speaker" />
                <div className="app-screen">
                  <div className="app-header">
                    <span>Khoya Paya</span>
                    <b>Safe</b>
                  </div>
                  <div className="lost-alert">Lost Mode is on for Travel Backpack</div>
                  <div className="qr-box">
                    <div className="qr-grid" />
                  </div>
                  <div className="mini-list">
                    <span>Finder message</span>
                    <strong>New</strong>
                  </div>
                  <div className="mini-list">
                    <span>Recovery status</span>
                    <strong>Active</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="curved-transition" />
    </section>
  );
}
