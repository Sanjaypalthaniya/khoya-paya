const problems = [
  [
    "People lose valuables every day",
    "Bags, keys, laptops, IDs, documents, and pet tags need a return path before they disappear into uncertainty.",
  ],
  [
    "Honest finders need a safe contact method",
    "Most people want to help, but sharing personal phone numbers or email addresses can feel risky for both sides.",
  ],
  [
    "Khoya Paya connects owner and finder privately",
    "A smart QR page lets finders send a message while your default contact details stay protected.",
  ],
];

export default function ProblemSection() {
  return (
    <section className="section mint-section" id="features">
      <div className="container">
        <div className="row align-items-end g-4 mb-4">
          <div className="col-lg-7 reveal-up">
            <p className="eyebrow teal-text">The real problem</p>
            <h2>Lost items deserve a smarter way back.</h2>
          </div>
          <div className="col-lg-5 reveal-up">
            <p>Khoya Paya turns every valuable into a private, scan-ready recovery channel.</p>
          </div>
        </div>
        <div className="row g-4 stagger-group">
          {problems.map(([title, text], index) => (
            <div className="col-lg-4" key={title}>
              <div className="problem-card kp-card stagger-item">
                <span className="qr-icon">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="card-scan-line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
