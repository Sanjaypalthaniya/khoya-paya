import { redirect } from "next/navigation";
import ClaimDetail from "@/components/claims/ClaimDetail";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getCurrentUser } from "@/lib/auth";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ claimId: string }>;
}) {
  if (!(await getCurrentUser())) redirect("/login");
  const { claimId } = await params;

  return (
    <main className="claims-page">
      <DashboardLayout active="/dashboard/claims">
        <ClaimDetail claimId={claimId} />
      </DashboardLayout>
    </main>
  );
}
