import Link from "next/link";

type EmptyStateProps = {
  title: string;
  copy: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({ title, copy, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{copy}</p>
      {actionLabel && actionHref ? <Link className="btn btn-primary-kp btn-sm-pill" href={actionHref}>{actionLabel}</Link> : null}
    </div>
  );
}
