"use client";

import AuthLayout from "@/components/AuthLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    <main>
      <Navbar />
      <AuthLayout eyebrow="Welcome back" title="Recover access to your protected items." copy="Sign in to manage QR codes, Lost Mode, finder messages, and scan history when backend auth is connected.">
        <h2>Login</h2>
        <p>Sign in to continue to your dashboard.</p>
        {message ? <div className="auth-alert success">{message}</div> : null}
        {error ? <div className="auth-alert error">{error}</div> : null}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email<input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input type="password" placeholder="Enter password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <div className="auth-row">
            <label className="check-label"><input type="checkbox" /> Remember me</label>
            <Link href="/contact">Forgot password?</Link>
          </div>
          <button className="btn btn-primary-kp w-100" type="submit" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</button>
        </form>
        <p className="auth-switch">New to Khoya Paya? <Link href="/signup">Create an account</Link></p>
      </AuthLayout>
      <Footer />
    </main>
  );
}
