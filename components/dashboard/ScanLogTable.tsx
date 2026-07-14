import { shortUserAgent } from "@/lib/request";

type ScanLogTableProps = {
  scans: Array<{
    id: string;
    itemName: string;
    uniqueCode: string | null;
    scannedAt: string;
    userAgent: string | null;
    ipAddress: string | null;
    location: string | null;
  }>;
};

export default function ScanLogTable({ scans }: ScanLogTableProps) {
  if (!scans.length) {
    return <div className="empty-state">No QR scans yet.</div>;
  }

  return (
    <div className="scan-table-wrap">
      <table className="scan-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>QR Code</th>
            <th>Scanned</th>
            <th>User Agent</th>
            <th>IP</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.id}>
              <td>{scan.itemName}</td>
              <td>{scan.uniqueCode || "Unknown"}</td>
              <td>{new Date(scan.scannedAt).toLocaleString()}</td>
              <td>{shortUserAgent(scan.userAgent)}</td>
              <td>{scan.ipAddress || "Not saved"}</td>
              <td>{scan.location || "Not available"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
