import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Check, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";

export default async function VerificationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await prisma.user.findUnique({ where: { id: user.id }, include: { verificationRequests: { orderBy: { createdAt: "desc" } } } });
  const latest = profile?.verificationRequests[0];
  const steps = ["Review profile", "Add supporting information", "Submit verification", "Pending review", "Approved or rejected", "Safe recovery ready"];
  const active = latest ? latest.status === "APPROVED" ? 5 : latest.status === "PENDING" ? 3 : 2 : 0;
  return <main><Navbar /><section className="section bg-section"><div className="container"><DashboardLayout active="/dashboard/verification">
    <article className="dashboard-message-card verification-overview"><div className="verification-panel-head"><ShieldCheck size={26} /><div><span>Trust &amp; verification</span><h3>Your recovery trust profile</h3><p>Verification adds context during recovery. It never guarantees that a person or transaction is safe.</p></div></div><div className="trust-grid"><div><small>Verification level</small><strong>{profile?.verificationLevel ?? "UNVERIFIED"}</strong></div><div><small>Trust score</small><strong>{profile?.trustScore ?? 0}</strong><em>Earned through verified account and recovery signals</em></div><div><small>Email</small><strong>{profile?.emailVerifiedAt ? "Verified" : "Pending"}</strong></div><div><small>Mobile</small><strong>{profile?.mobileVerifiedAt ? "Verified" : "Pending"}</strong></div></div></article>
    <article className="dashboard-message-card verification-workflow"><div className="verification-workflow-head"><FileCheck2 /><div><h3>Verification progress</h3><p>Backend decisions remain unchanged. This view only clarifies the existing process.</p></div></div><ol>{steps.map((step, index) => <li className={index < active ? "complete" : index === active ? "active" : ""} key={step}><span>{index < active ? <Check size={16} /> : index + 1}</span><div><strong>{step}</strong><small>{index === active ? "Current step" : index < active ? "Completed" : "Not started"}</small></div></li>)}</ol><div className="verification-privacy"><LockKeyhole size={18} /><p>Documents and ownership answers are used for verification only. Avoid uploading passwords, payment PINs, or unnecessary identity data.</p></div></article>
  </DashboardLayout></div></section><Footer /></main>;
}
