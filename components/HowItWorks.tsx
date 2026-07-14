const steps = [
  ["Register your item", "Add the item name, photo, and recovery instructions."],
  ["Generate a unique QR code", "Every valuable gets a private recovery link."],
  ["Stick it on your item", "Use labels for bags, keys, laptops, pets, and assets."],
  ["Get contacted when found", "Finder messages arrive safely in your workspace."],
];

export default function HowItWorks() {
  return (
    <section className="section bg-section" id="how-it-works">
      <div className="container">
        <div className="section-heading reveal-up">
          <p className="eyebrow teal-text">How it works</p>
          <h2>Four simple steps to protect your items.</h2>
        </div>
        <div className="timeline-wrap stagger-group">
          {steps.map(([title, text], index) => (
            <div className="timeline-card stagger-item" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
