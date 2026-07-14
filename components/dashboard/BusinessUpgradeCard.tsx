import Link from "next/link";

type BusinessUpgradeCardProps = {
  title?: string;
  copy?: string;
};

export default function BusinessUpgradeCard({
  title = "Need bulk QR for school or office?",
  copy = "Bulk upload, QR ZIP downloads, and printable QR sheets are available on the Business plan.",
}: BusinessUpgradeCardProps) {
  return (
    <article className="dashboard-message-card business-upgrade-card">
      <span className="status-pill">Business Tools</span>
      <h3>{title}</h3>
      <p>{copy}</p>
      <Link className="btn btn-primary-kp btn-sm-pill" href="/pricing">Upgrade to Business</Link>
    </article>
  );
}
