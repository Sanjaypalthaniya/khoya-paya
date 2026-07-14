"use client";

type PreviewRow = {
  rowNumber: number;
  raw: Record<string, string>;
  errors: string[];
};

type CSVPreviewTableProps = {
  rows: PreviewRow[];
};

export default function CSVPreviewTable({ rows }: CSVPreviewTableProps) {
  if (!rows.length) return null;

  return (
    <div className="scan-table-wrap">
      <table className="scan-table bulk-table">
        <thead>
          <tr>
            <th>Row</th>
            <th>Item</th>
            <th>Category</th>
            <th>Status</th>
            <th>Validation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rowNumber}>
              <td>{row.rowNumber}</td>
              <td>{row.raw.itemName || "-"}</td>
              <td>{row.raw.category || "-"}</td>
              <td>{row.raw.status || "-"}</td>
              <td>{row.errors.length ? <span className="bulk-error-text">{row.errors.join(", ")}</span> : <span className="bulk-ok-text">Valid</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
