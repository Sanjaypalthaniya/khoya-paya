import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClaimsDashboard from "@/components/claims/ClaimsDashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function ClaimsPage() {
  if (!(await getCurrentUser())) redirect("/login");

  return (
    <main className="claims-page">
      <DashboardLayout active="/dashboard/claims">
        <section className="claims-trust-banner">
          <div className="claims-trust-icon"><ShieldCheck size={26} aria-hidden="true" /></div>
          <div>
            <span>Protected recovery workflow</span>
            <h2>Every case stays private, guided, and traceable.</h2>
            <p>Review ownership safely, arrange a public handover, and keep every important step in one secure record.</p>
          </div>
          <div className="claims-private-note"><LockKeyhole size={18} aria-hidden="true" /> Private by design</div>
        </section>
        <ClaimsDashboard />
      </DashboardLayout>
    </main>
  );
}
