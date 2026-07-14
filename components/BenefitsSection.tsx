const benefits = [
  "Private contact system",
  "Safe QR-based recovery",
  "Real-time scan alerts",
  "Lost Mode with reward option",
  "Works for bags, keys, laptops, school items, pets, documents, and more",
];

export default function BenefitsSection() {
  return (
    <section className="section sand-section">
      <div className="container">
        <div className="row align-items-center g-5 benefits-layout">
          <div className="col-lg-5 reveal-up">
            <p className="eyebrow teal-text">Safety first</p>
            <h2>Built for safe and simple recovery.</h2>
            <p>Every detail is designed to help owners and finders coordinate without exposing private contact details too early.</p>
          </div>
          <div className="col-lg-7">
            <div className="benefit-grid stagger-group">
              {benefits.map((benefit) => (
                <div className="benefit-card kp-card stagger-item" key={benefit}>
                  <span className="mini-qr" />
                  <h3>{benefit}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
