"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Check, Eye, EyeOff, KeyRound, LocateFixed, MessageCircle, QrCode, ShieldCheck, WalletCards } from "lucide-react";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Unable to login.");
        return;
      }

      setMessage("Login successful. Redirecting...");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-redesign">
      <section className="login-form-panel" aria-labelledby="login-title">
        <div className="login-form-shell">
          <Link className="login-brand" href="/" aria-label="Khoya Paya home"><span aria-hidden="true">K</span><strong>Khoya Paya</strong></Link>
          <div className="login-heading">
            <span>Secure account access</span>
            <h1 id="login-title">Welcome back</h1>
            <p>Log in to manage your items, messages and recovery activity.</p>
          </div>
          {message ? <div className="login-alert success" role="status"><Check size={17} />{message}</div> : null}
          {error ? <div className="login-alert error" id="login-error" role="alert"><span aria-hidden="true">!</span>{error}</div> : null}
          <form className="login-form" onSubmit={handleSubmit} aria-describedby={error ? "login-error" : undefined}>
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error) || undefined} disabled={isLoading} />
            <label htmlFor="login-password">Password</label>
            <span className="login-password-field">
              <input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error) || undefined} disabled={isLoading} />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} disabled={isLoading}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </span>
            <div className="login-options">
              <label className="login-check"><input type="checkbox" disabled={isLoading} /> <span>Remember me</span></label>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
            <button className="login-submit" type="submit" disabled={isLoading} aria-busy={isLoading}>{isLoading ? <><span className="login-spinner" aria-hidden="true" />Logging in…</> : "Login"}</button>
          </form>
          <p className="login-switch">New to Khoya Paya? <Link href="/signup">Create an account</Link></p>
          <div className="login-privacy"><ShieldCheck size={17} /><p>Your password is sent only to the secure login endpoint. Khoya Paya never displays it publicly.</p><Link href="/privacy-policy">Privacy policy</Link></div>
        </div>
      </section>
      <aside className="login-visual-panel" aria-label="Khoya Paya secure recovery illustration">
        <div className="login-visual-copy"><span>Private by design</span><h2>A safe path from<br />lost to recovered.</h2></div>
        <div className="recovery-visual" aria-hidden="true">
          <div className="recovery-orbit orbit-one" />
          <div className="recovery-orbit orbit-two" />
          <div className="recovery-phone">
            <div className="recovery-phone-notch" />
            <div className="recovery-phone-head"><strong>Khoya Paya</strong><ShieldCheck size={14} /></div>
            <div className="recovery-item"><span><WalletCards size={24} /></span><div><small>Protected item</small><strong>Everyday wallet</strong></div></div>
            <div className="recovery-timeline">
              <div className="complete"><i><Check size={12} /></i><span><strong>Item reported</strong><small>Details secured</small></span></div>
              <div className="complete"><i><LocateFixed size={12} /></i><span><strong>Finder connected</strong><small>Approximate location</small></span></div>
              <div className="active"><i><MessageCircle size={12} /></i><span><strong>Private message</strong><small>Contact stays protected</small></span></div>
            </div>
            <div className="recovery-confirmed"><Check size={16} /><span><small>Status</small><strong>Recovery confirmed</strong></span></div>
          </div>
          <div className="visual-card qr-card"><span><QrCode size={23} /></span><div><small>Secure QR</small><strong>Scan to help return</strong></div></div>
          <div className="visual-card message-card"><span><MessageCircle size={21} /></span><div><small>Finder message</small><strong>“I found your item.”</strong></div></div>
          <div className="visual-card key-card"><KeyRound size={20} /><span>Owner verified</span></div>
        </div>
        <p className="login-visual-note"><ShieldCheck size={15} /> Personal contact details stay private throughout recovery.</p>
      </aside>
    </main>
  );
}
