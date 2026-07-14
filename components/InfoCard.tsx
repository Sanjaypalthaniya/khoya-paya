type InfoCardProps = {
  icon: string;
  title: string;
  copy: string;
};

export default function InfoCard({ icon, title, copy }: InfoCardProps) {
  return (
    <article className="info-card">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
    </article>
  );
}
