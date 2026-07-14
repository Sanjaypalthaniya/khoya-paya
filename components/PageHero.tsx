type PageHeroProps = {
  eyebrow: string;
  title: string;
  copy: string;
};

export default function PageHero({ eyebrow, title, copy }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="qr-pattern-layer" />
      <div className="container position-relative">
        <div className="page-hero-content">
          <span className="hero-badge">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{copy}</p>
        </div>
      </div>
    </section>
  );
}
