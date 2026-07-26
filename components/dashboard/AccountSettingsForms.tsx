"use client";

import { FormEvent, useState } from "react";

export default function AccountSettingsForms({ profile }: { profile: { name: string; email: string; phone: string | null } }) {
  const [account, setAccount] = useState({ name: profile.name, phone: profile.phone ?? "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [profileNotice, setProfileNotice] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [busy, setBusy] = useState("");
  async function submit(event: FormEvent, kind: "profile" | "password") {
    event.preventDefault(); setBusy(kind); const setter = kind === "profile" ? setProfileNotice : setPasswordNotice; setter("");
    try { const response = await fetch(`/api/settings/${kind}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(kind === "profile" ? account : password) }); const body = await response.json(); setter(body.message ?? (response.ok ? "Saved." : "Unable to save.")); if (response.ok && kind === "password") setPassword({ currentPassword: "", newPassword: "" }); } catch { setter("Unable to save. Check your connection."); } finally { setBusy(""); }
  }
  return <div className="settings-grid">
    <form className="dashboard-message-card settings-card" onSubmit={event => void submit(event, "profile")}><h3>Profile</h3><p>Your account details used across the dashboard.</p><label>Name<input required minLength={2} value={account.name} onChange={event => setAccount(current => ({ ...current, name: event.target.value }))} /></label><label>Email<input disabled value={profile.email} /></label><label>Phone<input inputMode="tel" value={account.phone} onChange={event => setAccount(current => ({ ...current, phone: event.target.value }))} /></label>{profileNotice ? <div className="form-feedback" role="status">{profileNotice}</div> : null}<button className="btn btn-primary-kp btn-sm-pill" type="submit" disabled={busy === "profile"}>Save profile</button></form>
    <form className="dashboard-message-card settings-card" onSubmit={event => void submit(event, "password")}><h3>Security</h3><p>Use at least eight characters for your new password.</p><label>Current password<input required type="password" autoComplete="current-password" value={password.currentPassword} onChange={event => setPassword(current => ({ ...current, currentPassword: event.target.value }))} /></label><label>New password<input required minLength={8} type="password" autoComplete="new-password" value={password.newPassword} onChange={event => setPassword(current => ({ ...current, newPassword: event.target.value }))} /></label>{passwordNotice ? <div className="form-feedback" role="status">{passwordNotice}</div> : null}<button className="btn btn-primary-kp btn-sm-pill" type="submit" disabled={busy === "password"}>Update password</button></form>
  </div>;
}
