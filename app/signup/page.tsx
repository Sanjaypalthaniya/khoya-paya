"use client";

import AuthLayout from "@/components/AuthLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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

    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Valid email is required.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.acceptedTerms) {
      setError("Please agree to Terms & Privacy Policy.");
      return;
    }

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
    <main>
      <Navbar />
      <AuthLayout eyebrow="Get started" title="Create your Khoya Paya recovery profile." copy="Register now with a static preview form. Real authentication and database storage will arrive in the backend step.">
        <h2>Signup</h2>
        <p>Start protecting your first valuable item.</p>
        {message ? <div className="auth-alert success">{message}</div> : null}
        {error ? <div className="auth-alert error">{error}</div> : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Full name<input type="text" placeholder="Your full name" value={form.name} onChange={(event) => updateField("name", event.target.value)} /></label>
          <label>Email<input type="email" placeholder="you@example.com" value={form.email} onChange={(event) => updateField("email", event.target.value)} /></label>
          <label>Phone optional<input type="tel" placeholder="+91 90000 00000" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
          <label>Password<span className="password-field"><input type={showPasswords ? "text" : "password"} placeholder="Create password" value={form.password} onChange={(event) => updateField("password", event.target.value)} /><button type="button" aria-label={showPasswords ? "Hide passwords" : "Show passwords"} aria-pressed={showPasswords} onClick={() => setShowPasswords(value => !value)}>{showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          <label>Confirm password<input type={showPasswords ? "text" : "password"} placeholder="Confirm password" value={form.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} /></label>
          <label className="check-label"><input type="checkbox" checked={form.acceptedTerms} onChange={(event) => updateField("acceptedTerms", event.target.checked)} /> I agree to Terms & Privacy Policy</label>
          <button className="btn btn-primary-kp w-100" type="submit" disabled={isLoading}>{isLoading ? "Creating account..." : "Signup"}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link href="/login">Login</Link></p>
      </AuthLayout>
      <Footer />
    </main>
  );
}
