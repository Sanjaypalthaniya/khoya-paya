import Link from "next/link";

const plans = [
  ["Free", "Start simple", ["2 registered items", "Basic QR code", "Finder message support"]],
  ["Premium", "For everyday protection", ["More registered items", "Lost Mode", "Scan alerts", "Reward note", "QR PDF download"]],
  ["Business", "For teams and campuses", ["Bulk QR codes", "School/office dashboard", "Team management", "Priority support"]],
];

export default function PricingSection() {
  return (
    <section className="pricing-section mint-section" id="pricing">
      <div className="container">
        <div className="section-heading reveal-up">
          <p className="eyebrow teal-text">Pricing</p>
          <h2>Pricing that scales with your needs.</h2>
        </div>
        <div className="row g-4 stagger-group">
          {plans.map(([name, subtitle, items], index) => (
            <div className="col-lg-4" key={name as string}>
              <div className={`pricing-card stagger-item ${index === 1 ? "featured" : ""}`}>
                {index === 1 ? <div className="popular-badge">Most Popular</div> : null}
                <span className="plan-name">{name as string}</span>
                <h3>{subtitle as string}</h3>
                <ul>
                  {(items as string[]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link className={index === 1 ? "btn btn-accent-kp" : "btn btn-primary-kp"} href="/signup">Choose Plan</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
