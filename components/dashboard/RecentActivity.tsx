type RecentActivityProps = {
  items?: Array<{ id: string; itemName: string; createdAt: string }>;
  scans: Array<{ id: string; itemName: string; scannedAt: string }>;
  messages: Array<{ id: string; itemName: string; finderMessage: string; createdAt: string }>;
};

export default function RecentActivity({ items = [], scans, messages }: RecentActivityProps) {
  return (
    <div className="recent-activity-grid">
      <article className="recent-card">
        <h3>Recent items</h3>
        {items.length ? items.map((item) => (
          <div className="recent-row" key={item.id}>
            <strong>{item.itemName}</strong>
            <span>{new Date(item.createdAt).toLocaleString()}</span>
          </div>
        )) : <p>No items yet.</p>}
      </article>
      <article className="recent-card">
        <h3>Recent scans</h3>
        {scans.length ? scans.map((scan) => (
          <div className="recent-row" key={scan.id}>
            <strong>{scan.itemName}</strong>
            <span>{new Date(scan.scannedAt).toLocaleString()}</span>
          </div>
        )) : <p>No scans yet.</p>}
      </article>
      <article className="recent-card">
        <h3>Recent finder messages</h3>
        {messages.length ? messages.map((message) => (
          <div className="recent-row" key={message.id}>
            <strong>{message.itemName}</strong>
            <span>{message.finderMessage}</span>
          </div>
        )) : <p>No finder messages yet.</p>}
      </article>
    </div>
  );
}
