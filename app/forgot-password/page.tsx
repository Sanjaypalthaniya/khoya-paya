"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import "../login/login.css";
import "./recovery.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Unable to send reset link.");
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send reset link.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-redesign recovery-redesign">
    <section className="login-form-panel">
      <div className="login-form-shell recovery-form-shell">
        <Link className="login-brand" href="/"><span>K</span><strong>Khoya Paya</strong></Link>
        {!sent ? <>
          <div className="recovery-icon"><KeyRound size={26} /></div>
          <div className="login-heading"><span>Account recovery</span><h1>Forgot your password?</h1><p>Enter the email used for your Khoya Paya account. We will send you a secure reset link.</p></div>
          {error ? <div className="login-alert error" role="alert"><span>!</span>{error}</div> : null}
          <form className="login-form" onSubmit={event => void submit(event)}>
            <label htmlFor="recovery-email">Email address</label>
            <span className="recovery-input"><Mail size={18} /><input id="recovery-email" required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} disabled={busy} /></span>
            <button className="login-submit" type="submit" disabled={busy}>{busy ? "Sending secure link…" : "Send reset link"}</button>
          </form>
          <p className="recovery-helper"><ShieldCheck size={16} />For your privacy, we show the same confirmation whether or not an account exists.</p>
        </> : <div className="recovery-sent" role="status">
          <span><CheckCircle2 size={30} /></span>
          <div className="login-heading"><span>Check your inbox</span><h1>Reset link sent</h1><p>If an account exists for <strong>{email}</strong>, you will receive a one-time link that expires in 30 minutes.</p></div>
          <button className="btn btn-secondary-kp w-100" type="button" onClick={() => setSent(false)}>Try another email</button>
        </div>}
        <Link className="recovery-back" href="/login"><ArrowLeft size={17} />Back to login</Link>
      </div>
    </section>
    <aside className="login-visual-panel recovery-visual-panel">
      <div className="login-visual-copy"><span>Simple and secure</span><h2>Back into your<br />account in minutes.</h2><p>One email. One secure link. No support ticket or long verification process.</p></div>
      <div className="recovery-steps">
        <div className="active"><b>1</b><span><strong>Enter your email</strong><small>Use the address linked to your account</small></span></div>
        <div><b>2</b><span><strong>Open the secure link</strong><small>It expires automatically in 30 minutes</small></span></div>
        <div><b>3</b><span><strong>Choose a new password</strong><small>Return to your dashboard safely</small></span></div>
      </div>
    </aside>
  </main>;
}
