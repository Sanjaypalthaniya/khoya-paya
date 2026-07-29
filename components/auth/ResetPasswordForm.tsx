"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(token ? "" : "This reset link is incomplete. Request a new one.");
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Unable to update password.");
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update password.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-redesign recovery-redesign">
    <section className="login-form-panel">
      <div className="login-form-shell recovery-form-shell">
        <Link className="login-brand" href="/"><span>K</span><strong>Khoya Paya</strong></Link>
        {!complete ? <>
          <div className="recovery-icon"><LockKeyhole size={26} /></div>
          <div className="login-heading"><span>Secure password reset</span><h1>Choose a new password</h1><p>Use at least 8 characters and avoid a password you use on another account.</p></div>
          {error ? <div className="login-alert error" role="alert"><span>!</span>{error}</div> : null}
          <form className="login-form" onSubmit={event => void submit(event)}>
            <label htmlFor="new-password">New password</label>
            <span className="login-password-field"><input id="new-password" required minLength={8} maxLength={128} type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} disabled={busy || !token} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)}><Eye size={18} className={showPassword ? "d-none" : ""} /><EyeOff size={18} className={showPassword ? "" : "d-none"} /></button></span>
            <label htmlFor="confirm-password">Confirm new password</label>
            <input id="confirm-password" required minLength={8} maxLength={128} type="password" autoComplete="new-password" value={form.confirmPassword} onChange={event => setForm(current => ({ ...current, confirmPassword: event.target.value }))} disabled={busy || !token} />
            <button className="login-submit" type="submit" disabled={busy || !token}>{busy ? "Updating password…" : "Update password"}</button>
          </form>
          <p className="recovery-helper"><ShieldCheck size={16} />This link works once and expires after 30 minutes.</p>
        </> : <div className="recovery-sent" role="status">
          <span><CheckCircle2 size={30} /></span>
          <div className="login-heading"><span>Password updated</span><h1>You are ready to log in</h1><p>Your new password is active. Other mobile sessions have been signed out for safety.</p></div>
          <Link className="login-submit recovery-login-link" href="/login">Continue to login</Link>
        </div>}
        {!complete ? <Link className="recovery-back" href="/forgot-password"><ArrowLeft size={17} />Request another link</Link> : null}
      </div>
    </section>
    <aside className="login-visual-panel recovery-visual-panel">
      <div className="login-visual-copy"><span>Private by design</span><h2>A fresh password.<br />The same safe account.</h2><p>Your reset link is hashed, time-limited, and invalid after it is used.</p></div>
      <div className="recovery-security-card"><KeyRound size={28} /><div><strong>Secure reset</strong><span>Single-use link</span><span>30-minute expiry</span><span>Encrypted connection</span></div></div>
    </aside>
  </main>;
}
