"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  LocateFixed,
  MessageCircle,
  QrCode,
  ShieldCheck,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";
import "../login/login.css";
import "./signup.css";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.name.trim()) return setError("Full name is required.");
    if (!form.email.includes("@")) return setError("Valid email is required.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!form.acceptedTerms) return setError("Please agree to Terms & Privacy Policy.");

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Unable to create account.");
        return;
      }

      setMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => router.push("/login"), 900);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-redesign signup-redesign">
      <section className="login-form-panel" aria-labelledby="signup-title">
        <div className="login-form-shell">
          <Link className="login-brand" href="/" aria-label="Khoya Paya home">
            <span aria-hidden="true">K</span><strong>Khoya Paya</strong>
          </Link>
          <div className="login-heading">
            <span>Start protecting today</span>
            <h1 id="signup-title">Create account</h1>
            <p>Join Khoya Paya and keep every recovery detail in one secure place.</p>
          </div>
          {message ? <div className="login-alert success" role="status"><Check size={17} />{message}</div> : null}
          {error ? <div className="login-alert error" id="signup-error" role="alert"><span aria-hidden="true">!</span>{error}</div> : null}
          <form className="login-form" onSubmit={handleSubmit} aria-describedby={error ? "signup-error" : undefined}>
            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" type="text" autoComplete="name" placeholder="Your full name" value={form.name} onChange={(event) => updateField("name", event.target.value)} disabled={isLoading} />
            <label htmlFor="signup-email">Email</label>
            <input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(event) => updateField("email", event.target.value)} disabled={isLoading} />
            <label htmlFor="signup-phone">Phone <small>optional</small></label>
            <input id="signup-phone" type="tel" autoComplete="tel" placeholder="+91 90000 00000" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} disabled={isLoading} />
            <label htmlFor="signup-password">Password</label>
            <span className="login-password-field">
              <input id="signup-password" type={showPasswords ? "text" : "password"} autoComplete="new-password" placeholder="Minimum 8 characters" value={form.password} onChange={(event) => updateField("password", event.target.value)} disabled={isLoading} />
              <button type="button" aria-label={showPasswords ? "Hide passwords" : "Show passwords"} aria-pressed={showPasswords} onClick={() => setShowPasswords((value) => !value)} disabled={isLoading}>{showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </span>
            <label htmlFor="signup-confirm-password">Confirm password</label>
            <input id="signup-confirm-password" type={showPasswords ? "text" : "password"} autoComplete="new-password" placeholder="Enter password again" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} disabled={isLoading} />
            <label className="login-check signup-terms">
              <input type="checkbox" checked={form.acceptedTerms} onChange={(event) => updateField("acceptedTerms", event.target.checked)} disabled={isLoading} />
              <span>I agree to the <Link href="/terms-and-conditions">Terms</Link> and <Link href="/privacy-policy">Privacy Policy</Link></span>
            </label>
            <button className="login-submit" type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? <><span className="login-spinner" aria-hidden="true" />Creating account…</> : "Create account"}
            </button>
          </form>
          <p className="login-switch">Already have an account? <Link href="/login">Log in</Link></p>
          <div className="login-privacy"><ShieldCheck size={17} /><p>Your personal details stay private and are used only to secure your account and recoveries.</p><Link href="/privacy-policy">Privacy policy</Link></div>
        </div>
      </section>

      <aside className="login-visual-panel" aria-label="Khoya Paya protected account illustration">
        <div className="login-visual-copy"><span>Ready from day one</span><h2>Your valuables.<br />Protected together.</h2></div>
        <div className="recovery-visual" aria-hidden="true">
          <div className="recovery-orbit orbit-one" />
          <div className="recovery-orbit orbit-two" />
          <div className="recovery-phone">
            <div className="recovery-phone-notch" />
            <div className="recovery-phone-head"><strong>Khoya Paya</strong><ShieldCheck size={14} /></div>
            <div className="recovery-item"><span><WalletCards size={24} /></span><div><small>Your first item</small><strong>Everyday wallet</strong></div></div>
            <div className="recovery-timeline">
              <div className="complete"><i><UserRoundCheck size={12} /></i><span><strong>Account secured</strong><small>Private profile created</small></span></div>
              <div className="complete"><i><QrCode size={12} /></i><span><strong>QR protection ready</strong><small>Add and protect an item</small></span></div>
              <div className="active"><i><LocateFixed size={12} /></i><span><strong>Recovery network</strong><small>Help is always close</small></span></div>
            </div>
            <div className="recovery-confirmed"><Check size={16} /><span><small>Protection</small><strong>Ready to get started</strong></span></div>
          </div>
          <div className="visual-card qr-card"><span><QrCode size={23} /></span><div><small>Secure QR</small><strong>Protect every item</strong></div></div>
          <div className="visual-card message-card"><span><MessageCircle size={21} /></span><div><small>Private contact</small><strong>Connect without exposure</strong></div></div>
          <div className="visual-card key-card"><ShieldCheck size={20} /><span>Privacy protected</span></div>
        </div>
        <p className="login-visual-note"><ShieldCheck size={15} /> Your contact details are never shown publicly.</p>
      </aside>
    </main>
  );
}
