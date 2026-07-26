"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { CommunityPostType } from "@/lib/community/types";

function claimType(type: CommunityPostType) {
  return type.startsWith("FOUND") ? "THIS_IS_MINE" : "I_FOUND_THIS";
}

export default function ClaimModal({ postId, postType, onClose }: {
  postId: string;
  postType: CommunityPostType;
  onClose: () => void;
}) {
  const [publicMessage, setPublicMessage] = useState("");
  const [privateMessage, setPrivateMessage] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ deepLink: string } | null>(null);
  const dialogRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("textarea,button,input")?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = [...dialogRef.current.querySelectorAll<HTMLElement>("a,button:not([disabled]),textarea:not([disabled]),input:not([disabled])")];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
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
  }, [busy, onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/community/posts/${postId}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimType: claimType(postType),
          publicMessage,
          privateMessage: privateMessage || undefined,
          approximateLocation: location || undefined,
          clientRequestId: crypto.randomUUID(),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Unable to submit claim.");
      setSuccess(body.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit claim.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="composer-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && !busy && onClose()}>
    <form ref={dialogRef} className="composer-modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="claim-modal-title" aria-describedby="claim-modal-safety">
      <header><h2 id="claim-modal-title">{postType.startsWith("FOUND") ? "This may be my item" : "I found this item"}</h2></header>
      {success ? <>
        <p role="status">Your claim was submitted privately. Verification details are never shown publicly.</p>
        <a className="btn btn-primary-kp" href={success.deepLink}>Continue verification</a>
      </> : <>
        <p id="claim-modal-safety">Do not include passwords, PINs, full identity numbers, phone numbers, email, or exact home addresses.</p>
        <label>Public-safe summary<textarea autoFocus required minLength={10} maxLength={1000} value={publicMessage} onChange={event => setPublicMessage(event.target.value)} aria-invalid={Boolean(error) || undefined} /></label>
        <label>Private verification context (optional)<textarea maxLength={2000} value={privateMessage} onChange={event => setPrivateMessage(event.target.value)} /></label>
        <label>Approximate area (optional)<input maxLength={200} value={location} onChange={event => setLocation(event.target.value)} /></label>
        {error && <p role="alert">{error}</p>}
      </>}
      <footer><button type="button" disabled={busy} onClick={onClose}>Close</button>{!success && <button type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit privately"}</button>}</footer>
    </form>
  </div>;
}
