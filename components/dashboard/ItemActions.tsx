"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ItemActionsProps = {
  itemId: string;
  hasQr: boolean;
  lostModeEnabled: boolean;
  status: string;
  communityPost: { id: string; status: string } | null;
};

export default function ItemActions({ itemId, hasQr, lostModeEnabled, status, communityPost }: ItemActionsProps) {
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
    if (!window.confirm("Archive this item? Any connected public post will be closed and recovery history preserved.")) return;
    setIsBusy(true);
    const response = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    setIsBusy(false);
    if (response.ok) router.push("/dashboard/items");
  }

  return (
    <div className="item-actions">
      <Link className="btn btn-secondary-kp btn-sm-pill" href={`/dashboard/items/${itemId}`}>View</Link>
      <Link className="btn btn-secondary-kp btn-sm-pill" href={`/dashboard/items/${itemId}/edit`}>Edit</Link>
      {communityPost ? <Link className="btn btn-secondary-kp btn-sm-pill" href={`/community/posts/${communityPost.id}`}>View Feed Post</Link> : null}
      {!communityPost ? <button className="btn btn-secondary-kp btn-sm-pill" disabled={isBusy} onClick={() => { const selected = window.prompt("Publish as LOST, FOUND, or MISSING", status === "SAFE" ? "LOST" : status)?.toUpperCase(); if (["LOST", "FOUND", "MISSING"].includes(selected ?? "")) void callApi(`/api/items/${itemId}/community`, "POST", { status: selected, publishToCommunity: true }); }} type="button">Publish to Feed</button> : null}
      {communityPost && !["RECOVERED", "CLOSED"].includes(communityPost.status) ? <><button className="btn btn-secondary-kp btn-sm-pill" disabled={isBusy} onClick={() => callApi(`/api/items/${itemId}/status`, "PATCH", { status: "RECOVERED" })} type="button">Mark Recovered</button><button className="btn btn-secondary-kp btn-sm-pill" disabled={isBusy} onClick={() => callApi(`/api/items/${itemId}/community`, "DELETE")} type="button">Close Post</button></> : null}
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
