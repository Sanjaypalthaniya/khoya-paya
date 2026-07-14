"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type BulkQRItem = {
  id: string;
  itemName: string;
  category: string;
  status: string;
  hasQr: boolean;
};

type BulkQRSelectorProps = {
  items: BulkQRItem[];
};

export default function BulkQRSelector({ items }: BulkQRSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [qrFilter, setQrFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const categories = Array.from(new Set(items.map((item) => item.category)));
  const statuses = Array.from(new Set(items.map((item) => item.status)));
  const filteredItems = useMemo(() => items.filter((item) => {
    if (qrFilter === "generated" && !item.hasQr) return false;
    if (qrFilter === "missing" && item.hasQr) return false;
    if (category !== "all" && item.category !== category) return false;
    if (status !== "all" && item.status !== status) return false;
    return true;
  }), [items, qrFilter, category, status]);

  function toggle(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
  }

  async function generateQr(allMissing = false) {
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/bulk/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: selectedIds, generateForAllMissing: allMissing }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message ?? "QR generation failed.");
        return;
      }
      setMessage(`Generated ${data.data.generated.length} QR codes. Skipped ${data.data.skipped.length}.`);
    } catch {
      setError("QR generation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function downloadZip() {
    setError("");
    const response = await fetch("/api/bulk/download-qr-zip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: selectedIds.length ? selectedIds : filteredItems.map((item) => item.id) }),
    });
    if (!response.ok) {
      setError("ZIP download failed. Select items with generated QR codes.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "khoya-paya-qr-codes.zip";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className="dashboard-message-card">
      {message ? <div className="auth-alert success">{message}</div> : null}
      {error ? <div className="auth-alert error">{error}</div> : null}
      <div className="bulk-filter-row">
        <select value={qrFilter} onChange={(event) => setQrFilter(event.target.value)}><option value="all">All QR states</option><option value="generated">QR generated</option><option value="missing">QR not generated</option></select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((entry) => <option key={entry}>{entry}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((entry) => <option key={entry}>{entry}</option>)}</select>
      </div>
      <div className="message-actions">
        <button className="btn btn-primary-kp btn-sm-pill" disabled={isLoading || !selectedIds.length} onClick={() => generateQr(false)} type="button">Generate Selected</button>
        <button className="btn btn-secondary-kp btn-sm-pill" disabled={isLoading} onClick={() => generateQr(true)} type="button">Generate All Missing</button>
        <button className="btn btn-secondary-kp btn-sm-pill" onClick={downloadZip} type="button">Download QR ZIP</button>
        <Link className="btn btn-secondary-kp btn-sm-pill" href={`/dashboard/bulk-qr/print?ids=${selectedIds.join(",")}`}>Print Sheet</Link>
      </div>
      <div className="scan-table-wrap">
        <table className="scan-table bulk-table">
          <thead><tr><th>Select</th><th>Item</th><th>Category</th><th>Status</th><th>QR</th></tr></thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td><input checked={selectedIds.includes(item.id)} onChange={() => toggle(item.id)} type="checkbox" /></td>
                <td>{item.itemName}</td>
                <td>{item.category}</td>
                <td>{item.status}</td>
                <td>{item.hasQr ? "Generated" : "Missing"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
