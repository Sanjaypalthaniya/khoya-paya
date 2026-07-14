"use client";

import { useState } from "react";
import CSVPreviewTable from "@/components/dashboard/CSVPreviewTable";

type UploadSummary = {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  generatedQrCount: number;
  errors: Array<{ rowNumber: number; errors: string[] }>;
};

export default function BulkUploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [generateQr, setGenerateQr] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [error, setError] = useState("");

  async function importCsv() {
    if (!file) {
      setError("Choose a CSV file first.");
      return;
    }

    setError("");
    setSummary(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("generateQr", String(generateQr));

      const response = await fetch("/api/bulk/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Bulk import failed.");
        return;
      }

      setSummary(data.data);
    } catch {
      setError("Bulk import failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const previewRows = summary?.errors.map((entry) => ({ rowNumber: entry.rowNumber, raw: {}, errors: entry.errors })) ?? [];

  return (
    <article className="dashboard-message-card bulk-upload-card">
      {error ? <div className="auth-alert error">{error}</div> : null}
      {summary ? <div className="auth-alert success">Imported {summary.importedCount} items. Failed rows: {summary.failedCount}. QR generated: {summary.generatedQrCount}.</div> : null}
      <div className="bulk-upload-drop">
        <span className="status-pill">CSV Import</span>
        <h3>Upload business inventory CSV</h3>
        <p>Use the template headers exactly. Max 500 rows and 2MB CSV file size.</p>
        <input accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
        <small>{file ? file.name : "No CSV selected"}</small>
      </div>
      <label className="check-label bulk-check">
        <input checked={generateQr} onChange={(event) => setGenerateQr(event.target.checked)} type="checkbox" />
        Generate QR codes automatically after import
      </label>
      <div className="message-actions">
        <a className="btn btn-secondary-kp btn-sm-pill" href="/api/bulk/template">Download CSV Template</a>
        <button className="btn btn-primary-kp btn-sm-pill" disabled={isLoading} onClick={importCsv} type="button">{isLoading ? "Importing..." : "Import Valid Items"}</button>
      </div>
      <CSVPreviewTable rows={previewRows} />
    </article>
  );
}
