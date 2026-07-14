import Link from "next/link";

export default function AppDownloadSection() {
  return (
    <section className="section app-download-section">
      <div className="container">
        <div className="row align-items-center g-5 flex-lg-row-reverse">
          <div className="col-lg-5 reveal-up">
            <p className="eyebrow teal-text">Mobile app</p>
            <h2>Recover faster with the app.</h2>
            <p>Manage your items, get scan alerts, and respond to finder messages anytime.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary-kp" href="/signup">Download for Android</Link>
              <Link className="btn btn-secondary-kp dark" href="/signup">Download for iPhone</Link>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="app-showcase">
              <div className="app-blob" />
              <div className="scan-mini-card floating-card-slow">
                <div className="qr-grid tiny" />
                <span>Scan to contact owner</span>
              </div>
              <div className="phone-mockup app-phone phone-float">
                <div className="phone-speaker" />
                <div className="app-screen">
                  <div className="app-header">
                    <span>Items</span>
                    <b>Alert</b>
                  </div>
                  <div className="alert-card">Lost Mode active: Laptop Bag</div>
                  <div className="mini-list"><span>Finder message</span><strong>New</strong></div>
                  <div className="mini-list"><span>QR preview</span><strong>Ready</strong></div>
                  <div className="qr-box small"><div className="qr-grid" /></div>
                </div>
              </div>
              <div className="app-notification-card">A finder scanned your QR code 2 minutes ago.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
