const cards = ["Finder Messages", "QR Manager", "Lost Mode", "Scan Logs", "Recovery Status"];

export default function DashboardPreview() {
  return (
    <section className="section warm-section">
      <div className="qr-strip top" />
      <div className="container">
        <div className="row align-items-end g-4 reveal-up">
          <div className="col-lg-7">
            <p className="eyebrow teal-text">Safe workspace</p>
            <h2>A workspace where owners and finders connect safely.</h2>
          </div>
          <div className="col-lg-5">
            <p className="muted">Every scan, message, QR label, and recovery status lives in one calm dashboard.</p>
          </div>
        </div>
        <div className="wide-dashboard dashboard-reveal">
          <div className="wide-sidebar">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="wide-content">
            {Array.from({ length: 7 }).map((_, index) => (
              <div className="wide-row" key={index}>
                <i />
                <b>{["Laptop bag", "School ID", "Pet tag", "Wallet", "Travel luggage", "Office key", "Document folder"][index]}</b>
                <span>{index % 2 ? "Finder waiting" : "QR active"}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="row g-3 stagger-group">
          {cards.map((card) => (
            <div className="col-md" key={card}>
              <div className="mini-feature stagger-item">{card}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
