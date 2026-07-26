"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Clock3,
  FileSearch,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type Claim = {
  id: string;
  publicClaimId: string;
  claimType: string;
  status: string;
  post: { title: string };
  otherParticipant: { displayName?: string; name?: string };
  submittedAt: string | null;
  nextAction: string;
};

const filters = [
  "",
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFICATION_PENDING",
  "VERIFIED",
  "RETURN_ARRANGEMENT_PENDING",
  "RECOVERY_CONFIRMED",
  "REJECTED",
  "DISPUTED",
];

const label = (value: string) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ClaimsDashboard() {
  const [items, setItems] = useState<Claim[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/claims${filter ? `?status=${filter}` : ""}`,
        { cache: "no-store" },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Unable to load claims.");
      setItems(body.data.items);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load claims.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, [load]);

  return (
    <section className="claims-dashboard" aria-labelledby="claims-list-title">
      <div className="claims-toolbar">
        <div>
          <span className="claims-eyebrow">Case management</span>
          <h2 id="claims-list-title">Recovery cases</h2>
          <p>Track verification, return arrangements, and completed recoveries.</p>
        </div>
        <button className="claims-refresh" type="button" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={18} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="claims-filters" aria-label="Filter claims by status">
        {filters.map((value) => (
          <button
            type="button"
            className={filter === value ? "active" : ""}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            key={value || "ALL"}
          >
            {value ? label(value) : "All cases"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="claims-grid" aria-label="Loading claims">
          {[0, 1, 2].map((item) => <div className="claim-card claim-card-skeleton" key={item} />)}
        </div>
      ) : error ? (
        <div className="claims-state claims-state-error" role="alert">
          <FileSearch size={30} aria-hidden="true" />
          <h3>We couldn’t load your cases</h3>
          <p>{error}</p>
          <button type="button" onClick={() => void load()}>Try again</button>
        </div>
      ) : items.length ? (
        <div className="claims-grid">
          {items.map((claim) => (
            <article className="claim-card" key={claim.id}>
              <div className="claim-card-top">
                <span className={`claim-status claim-status-${claim.status.toLowerCase()}`}>
                  {label(claim.status)}
                </span>
                <span className="claim-reference">{claim.publicClaimId}</span>
              </div>
              <div className="claim-card-icon"><ShieldCheck size={22} aria-hidden="true" /></div>
              <p className="claim-type">{label(claim.claimType)}</p>
              <h3>{claim.post.title}</h3>
              <p className="claim-participant">
                With {claim.otherParticipant.name ?? claim.otherParticipant.displayName ?? "Participant"}
              </p>
              <div className="claim-next-action">
                <span>Next step</span>
                <strong>{claim.nextAction}</strong>
              </div>
              <footer>
                <span><Clock3 size={17} aria-hidden="true" />{claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : "Not submitted"}</span>
                <Link href={`/dashboard/claims/${claim.id}`}>
                  View case <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="claims-state">
          <div className="claims-state-icon"><ShieldCheck size={34} aria-hidden="true" /></div>
          <span className="claims-eyebrow">You’re all caught up</span>
          <h3>{filter ? `No ${label(filter).toLowerCase()} cases` : "No recovery cases yet"}</h3>
          <p>
            {filter
              ? "There are no cases matching this status. Choose another filter to continue."
              : "Claims and verified found-item responses will appear here with clear, private next steps."}
          </p>
          {filter ? (
            <button type="button" onClick={() => setFilter("")}>View all cases</button>
          ) : (
            <Link href="/community">Explore community reports</Link>
          )}
        </div>
      )}
    </section>
  );
}
