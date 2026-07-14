"use client";

import { FormEvent, useState } from "react";

type Preferences = {
  emailAlertsEnabled: boolean;
  whatsappAlertsEnabled: boolean;
  smsAlertsEnabled: boolean;
  qrScanAlertsEnabled: boolean;
  finderMessageAlertsEnabled: boolean;
  paymentAlertsEnabled: boolean;
  whatsappNumber: string | null;
  smsNumber: string | null;
};

export default function NotificationPreferencesForm({ preferences }: { preferences: Preferences }) {
  const [form, setForm] = useState({
    ...preferences,
    whatsappNumber: preferences.whatsappNumber ?? "",
    smsNumber: preferences.smsNumber ?? "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateBoolean(field: keyof Preferences, value: boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message ?? "Unable to save preferences.");
        return;
      }
      setMessage("Notification preferences saved.");
    } catch {
      setError("Unable to save preferences.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="dashboard-message-card notification-preferences-form" onSubmit={handleSubmit}>
      {message ? <div className="auth-alert success">{message}</div> : null}
      {error ? <div className="auth-alert error">{error}</div> : null}
      {[
        ["emailAlertsEnabled", "Email alerts"],
        ["whatsappAlertsEnabled", "WhatsApp alerts"],
        ["smsAlertsEnabled", "SMS alerts"],
        ["finderMessageAlertsEnabled", "Finder message alerts"],
        ["qrScanAlertsEnabled", "QR scan alerts"],
        ["paymentAlertsEnabled", "Payment alerts"],
      ].map(([field, label]) => (
        <label className="check-label" key={field}>
          <input checked={Boolean(form[field as keyof Preferences])} onChange={(event) => updateBoolean(field as keyof Preferences, event.target.checked)} type="checkbox" />
          {label}
        </label>
      ))}
      <label>WhatsApp Number<input value={form.whatsappNumber} onChange={(event) => setForm((current) => ({ ...current, whatsappNumber: event.target.value }))} placeholder="+919999999999" /></label>
      <label>SMS Number<input value={form.smsNumber} onChange={(event) => setForm((current) => ({ ...current, smsNumber: event.target.value }))} placeholder="+919999999999" /></label>
      <button className="btn btn-primary-kp btn-sm-pill" disabled={isLoading} type="submit">{isLoading ? "Saving..." : "Save Preferences"}</button>
    </form>
  );
}
