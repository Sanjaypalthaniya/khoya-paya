const cases = ["School Bags", "Keys", "Laptops", "Wallets", "Documents", "Pets", "Travel Luggage", "Office Assets"];

export default function UseCases() {
  return (
    <section className="section sand-section">
      <div className="container">
        <div className="section-heading reveal-up">
          <p className="eyebrow teal-text">Use cases</p>
          <h2>Made for everything you do not want to lose.</h2>
        </div>
        <div className="row g-3 stagger-group">
          {cases.map((item) => (
            <div className="col-6 col-lg-3" key={item}>
              <div className="use-card stagger-item">
                <span>{item.slice(0, 1)}</span>
                <h3>{item}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
