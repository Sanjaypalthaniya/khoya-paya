const features = [
  "Manage all items in one place",
  "Download QR anytime",
  "View scan activity",
  "Reply to finder messages",
  "Mark item as recovered",
];

export default function FeatureShowcase() {
  return (
    <section className="section bg-section">
      <div className="container">
        <div className="section-heading reveal-up">
          <p className="eyebrow teal-text">Owner dashboard</p>
          <h2>Register once. Recover faster.</h2>
        </div>
        <div className="dashboard-shell kp-dashboard dashboard-reveal">
          <aside>
            <b>Khoya Paya</b>
            {["My Items", "QR Code", "Scan History", "Finder Messages", "Lost Mode Toggle", "Recovery Status"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </aside>
          <div className="dash-main">
            <div className="dash-toolbar">
              <div>
                <small>Recovery workspace</small>
                <h3>My Items</h3>
              </div>
              <button>Lost Mode On</button>
            </div>
            <div className="dash-grid">
              <div className="item-card active">Laptop Bag <small>QR active</small></div>
              <div className="item-card">House Keys <small>2 scans</small></div>
              <div className="item-card">Pet Tag <small>Recovered</small></div>
            </div>
            <div className="dashboard-lower">
              <div className="qr-panel"><div className="qr-grid" /><span>QR Code</span></div>
              <div className="message-card">Finder message: &quot;I scanned your item near the library.&quot;</div>
            </div>
          </div>
        </div>
        <div className="feature-pills stagger-group">
          {features.map((feature) => (
            <span className="stagger-item" key={feature}>{feature}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
