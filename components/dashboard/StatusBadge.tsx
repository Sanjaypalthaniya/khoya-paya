type StatusBadgeProps = {
  status: "SAFE" | "LOST" | "FOUND" | string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>;
}
