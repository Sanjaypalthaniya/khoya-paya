import Link from "next/link";

type CTASectionProps = {
  title: string;
  copy: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export default function CTASection({
  title,
  copy,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className="mini-cta">
      <div className="container">
        <div className="mini-cta-panel">
          <div>
            <span className="eyebrow teal-text">Ready when you are</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </div>
          <div className="hero-actions">
            <Link className="btn btn-primary-kp" href={primaryHref}>{primaryLabel}</Link>
            {secondaryLabel && secondaryHref ? (
              <Link className="btn btn-secondary-kp" href={secondaryHref}>{secondaryLabel}</Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
