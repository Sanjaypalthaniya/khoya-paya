"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void } }
}

type Props = { planSlug: string; label?: string; disabled?: boolean };

function loadCheckout() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function UpgradeButton({ planSlug, label = "Upgrade Now", disabled = false }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function checkout() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/payments/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planSlug }) });
      if (response.status === 401) { router.push(`/login?next=${encodeURIComponent("/pricing")}`); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not start checkout.");
      if (!await loadCheckout() || !window.Razorpay) throw new Error("Razorpay checkout could not be loaded.");
      const { orderId, amount, currency, key, planName, user } = result.data;
      const razorpay = new window.Razorpay({
        key, order_id: orderId, amount, currency, name: "Khoya Paya", description: planName,
        prefill: user,
        theme: { color: "#147d73" },
        handler: async (paymentResponse: Record<string, string>) => {
          const verification = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(paymentResponse) });
          const verified = await verification.json();
          if (!verification.ok) { setMessage(verified.message || "Payment verification failed."); setBusy(false); return; }
          setMessage("Payment successful. Your plan is active.");
          router.push("/dashboard/billing?upgraded=1");
          router.refresh();
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      razorpay.on("payment.failed", (failure) => { setMessage(failure.error?.description || "Payment failed. Please try again."); setBusy(false); });
      razorpay.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start checkout.");
      setBusy(false);
    }
  }

  return <div><button className="btn btn-primary-kp btn-sm-pill" type="button" onClick={checkout} disabled={disabled || busy}>{busy ? "Please wait..." : label}</button>{message ? <small className="d-block mt-2">{message}</small> : null}</div>;
}
