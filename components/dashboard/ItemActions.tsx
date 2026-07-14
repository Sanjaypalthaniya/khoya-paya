"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ItemActionsProps = {
  itemId: string;
  hasQr: boolean;
  lostModeEnabled: boolean;
};

export default function ItemActions({ itemId, hasQr, lostModeEnabled }: ItemActionsProps) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);

  async function callApi(path: string, method = "POST", body?: unknown) {
    setIsBusy(true);
    try {
      const response = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.ok) router.refresh();
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteItem() {
    if (!window.confirm("Delete this item and related recovery data?")) return;
    setIsBusy(true);
    const response = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    setIsBusy(false);
    if (response.ok) router.push("/dashboard/items");
  }

  return (
    <div className="item-actions">
      <Link className="btn btn-secondary-kp btn-sm-pill" href={`/dashboard/items/${itemId}`}>View</Link>
      <Link className="btn btn-secondary-kp btn-sm-pill" href={`/dashboard/items/${itemId}/edit`}>Edit</Link>
      <button className="btn btn-secondary-kp btn-sm-pill" disabled={isBusy} onClick={() => callApi(`/api/items/${itemId}/lost-mode`, "PATCH", { lostModeEnabled: !lostModeEnabled })} type="button">
        {lostModeEnabled ? "Disable Lost Mode" : "Enable Lost Mode"}
      </button>
      {hasQr ? (
        <Link className="btn btn-primary-kp btn-sm-pill" href={`/dashboard/items/${itemId}/qr`}>View QR</Link>
      ) : (
        <button className="btn btn-primary-kp btn-sm-pill" disabled={isBusy} onClick={() => callApi(`/api/items/${itemId}/generate-qr`)} type="button">Generate QR</button>
      )}
      <button className="btn btn-secondary-kp btn-sm-pill" disabled={isBusy} onClick={deleteItem} type="button">Delete</button>
    </div>
  );
}
