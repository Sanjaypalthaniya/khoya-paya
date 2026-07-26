import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function ForgotPasswordPage() {
  return <main><Navbar /><AuthLayout eyebrow="Account recovery" title="Recover access without exposing your account." copy="Password-reset delivery is not configured in this project yet. Support can help verify the next safe step."><h2>Forgot your password?</h2><p>For account safety, do not share your current password, OTP, or recovery codes.</p><div className="auth-alert">Automated password reset is not currently available.</div><div className="auth-form"><Link className="btn btn-primary-kp w-100" href="/contact">Contact account support</Link><Link className="btn btn-secondary-kp w-100" href="/login">Return to login</Link></div></AuthLayout><Footer /></main>;
}
