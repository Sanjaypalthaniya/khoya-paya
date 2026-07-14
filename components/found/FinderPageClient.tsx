"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FinderMessageForm from "@/components/found/FinderMessageForm";
import PrivacyNotice from "@/components/found/PrivacyNotice";

type FinderPageClientProps = {
  uniqueCode: string;
  item: {
    itemName: string;
    category: string;
    status: string;
    lostModeEnabled: boolean;
    rewardAmount: string | null;
  };
};

export default function FinderPageClient({ uniqueCode, item }: FinderPageClientProps) {
  const [reportReason, setReportReason] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  useEffect(() => {
    const storageKey = `khoya_paya_scan_logged_${uniqueCode}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    fetch(`/api/found/${uniqueCode}/scan`, { method: "POST" })
      .then(() => sessionStorage.setItem(storageKey, "true"))
      .catch(() => undefined);
  }, [uniqueCode]);

  async function submitReport() {
    setReportMessage("");

    if (!reportReason.trim()) {
      setReportMessage("Please add a reason before reporting.");
      return;
    }

    try {
      const response = await fetch(`/api/found/${uniqueCode}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportReason }),
      });
      const data = await response.json();
      setReportMessage(data.message ?? (response.ok ? "Report submitted." : "Unable to submit report."));

      if (response.ok) {
        setReportReason("");
      }
    } catch {
      setReportMessage("Unable to submit report right now.");
    }
  }

  return (
    <main className="found-page">
      <div className="qr-pattern-layer" />
      <div className="container position-relative">
        <header className="found-header">
          <Link className="brand" href="/"><span className="brand-mark">K</span> Khoya Paya</Link>
          <span>Safe QR recovery</span>
        </header>
        <section className="found-hero">
          <div>
            <span className="hero-badge">You found an item registered on Khoya Paya</span>
            <h1>Help this item get back safely.</h1>
            <p>Send a secure message to the owner. Their phone and email are never shown publicly on this page.</p>
          </div>
          <div className="found-item-card">
            <div className="qr-box"><div className="qr-grid" /></div>
            <h2>{item.itemName}</h2>
            <div className="found-meta">
              <span>{item.category}</span>
              <span>{item.status}</span>
            </div>
            {item.lostModeEnabled && item.rewardAmount ? (
              <div className="reward-pill">Reward note: Rs {item.rewardAmount}</div>
            ) : null}
          </div>
        </section>
        <section className="row g-4 align-items-start found-content">
          <div className="col-lg-7">
            <div className="finder-form-card">
              <h2>Send owner a safe message</h2>
              <FinderMessageForm uniqueCode={uniqueCode} />
            </div>
          </div>
          <div className="col-lg-5">
            <PrivacyNotice />
            <div className="abuse-card">
              <h3>Report an issue</h3>
              <p>If this QR page is being misused, submit a quick report.</p>
              <textarea rows={4} value={reportReason} onChange={(event) => setReportReason(event.target.value)} placeholder="Reason for report" />
              <button className="btn btn-secondary-kp btn-sm-pill" type="button" onClick={submitReport}>Submit Report</button>
              {reportMessage ? <small>{reportMessage}</small> : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
