type AdminNotificationsTableProps = {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    isRead: boolean;
    createdAt: Date;
    user: { name: string; email: string };
  }>;
};

export default function AdminNotificationsTable({ notifications }: AdminNotificationsTableProps) {
  return (
    <div className="scan-table-wrap">
      <table className="scan-table">
        <thead><tr><th>User</th><th>Type</th><th>Title</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          {notifications.map((notification) => (
            <tr key={notification.id}>
              <td>{notification.user.name}<br /><small>{notification.user.email}</small></td>
              <td>{notification.type}</td>
              <td>{notification.title}</td>
              <td>{notification.isRead ? "Read" : "Unread"}</td>
              <td>{notification.createdAt.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
