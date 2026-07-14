"use client";

import { useState } from "react";
import { Ban, RotateCcw, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatOwnerActions({ conversationId, status }: { conversationId: string; status: "OPEN" | "CLOSED" | "SPAM" | "RECOVERED" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function update(nextStatus: "OPEN" | "CLOSED" | "SPAM") {
    setLoading(true);
    const response = await fetch(`/api/dashboard/chats/${conversationId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    setLoading(false);
    if (response.ok) router.refresh();
  }
  return <div className="message-actions">{status !== "OPEN" ? <button className="btn btn-secondary-kp btn-sm-pill" disabled={loading} onClick={() => update("OPEN")} type="button"><RotateCcw size={16} /> Reopen</button> : <button className="btn btn-secondary-kp btn-sm-pill" disabled={loading} onClick={() => update("CLOSED")} type="button"><Ban size={16} /> Close</button>}<button className="btn btn-danger btn-sm-pill" disabled={loading || status === "SPAM"} onClick={() => update("SPAM")} type="button"><ShieldX size={16} /> Mark spam</button></div>;
}
