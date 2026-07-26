"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
const reasons = [
  ["SPAM", "Spam"],
  ["FRAUD", "Fake or fraud"],
  ["WRONG_CATEGORY", "Wrong category"],
  ["ADULT_CONTENT", "Adult content"],
  ["VIOLENCE", "Violence"],
  ["HARASSMENT", "Harassment"],
  ["COPYRIGHT", "Copyright"],
  ["WRONG_INFORMATION", "Wrong information"],
  ["UNSAFE_CONTENT", "Unsafe content"],
  ["DUPLICATE_CONTENT", "Duplicate content"],
  ["ITEM_ALREADY_RECOVERED", "Item already recovered"],
  ["IMPERSONATION", "Impersonation"],
  ["PRIVACY_VIOLATION", "Privacy violation"],
  ["SCAM_OR_PAYMENT_REQUEST", "Scam or payment request"],
  ["OTHER", "Other"],
];
export default function ReportModal({
  targetType,
  targetId,
  onClose,
  onSuccess,
}: {
  targetType: "POST" | "COMMENT" | "USER";
  targetId: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("select,button,input,textarea")?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = [...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]),select:not([disabled]),textarea:not([disabled]),input:not([disabled])")];
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/community/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details: details.trim() || undefined,
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          response.status === 401
            ? "Log in to submit a report."
            : body.message || "Unable to submit report.",
        );
      onSuccess?.();
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to submit report.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="composer-modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        ref={dialogRef}
        className="composer-modal report-dialog"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
      >
        <header>
          <h2 id="report-title">Report {targetType.toLowerCase()}</h2>
          <button type="button" aria-label="Close report dialog" disabled={busy} onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <p>
          Your report is confidential. The reported user will not see your
          identity.
        </p>
        <label className="report-confirm">
          Reason
          <select
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">Choose a reason</option>
            {reasons.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Optional details
          <textarea
            maxLength={1000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />{" "}
          I believe this report is accurate.
        </label>
        {error && <p role="alert">{error}</p>}
        <footer>
          <button type="button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={busy || !reason || !confirmed}>
            {busy ? "Submitting…" : "Submit report"}
          </button>
        </footer>
      </form>
    </div>
  );
}
