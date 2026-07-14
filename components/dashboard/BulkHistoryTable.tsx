type BulkHistoryTableProps = {
  logs: Array<{
    id: string;
    fileName: string | null;
    totalRows: number;
    importedCount: number;
    failedCount: number;
    createdAt: Date;
  }>;
};

export default function BulkHistoryTable({ logs }: BulkHistoryTableProps) {
  return (
    <div className="scan-table-wrap">
      <table className="scan-table">
        <thead><tr><th>Date</th><th>File</th><th>Total</th><th>Imported</th><th>Failed</th></tr></thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.createdAt.toLocaleString()}</td>
              <td>{log.fileName || "CSV import"}</td>
              <td>{log.totalRows}</td>
              <td>{log.importedCount}</td>
              <td>{log.failedCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
