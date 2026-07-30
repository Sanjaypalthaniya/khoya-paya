import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import "../login/login.css";
import "../forgot-password/recovery.css";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <ResetPasswordForm token={token} />;
}
