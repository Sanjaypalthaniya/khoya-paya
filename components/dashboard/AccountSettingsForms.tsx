"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Trash2, X } from "lucide-react";

type DeletionState = {
  reason: string;
  feedback: string;
  password: string;
  confirmation: string;
  understandsPermanent: boolean;
};

export default function AccountSettingsForms({ profile }: { profile: { name: string; email: string; phone: string | null } }) {
  const [account, setAccount] = useState({ name: profile.name, phone: profile.phone ?? "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [profileNotice, setProfileNotice] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState("");
  const [deletion, setDeletion] = useState<DeletionState>({ reason: "", feedback: "", password: "", confirmation: "", understandsPermanent: false });
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!deleteOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelDeleteRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && busy !== "delete") setDeleteOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [deleteOpen, busy]);

  async function submit(event: FormEvent, kind: "profile" | "password") {
    event.preventDefault();
    setBusy(kind);
    const setter = kind === "profile" ? setProfileNotice : setPasswordNotice;
    setter("");
    try {
      const response = await fetch(`/api/settings/${kind}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(kind === "profile" ? account : password) });
      const body = await response.json();
      setter(body.message ?? (response.ok ? "Saved." : "Unable to save."));
      if (response.ok && kind === "password") setPassword({ currentPassword: "", newPassword: "" });
    } catch {
      setter("Unable to save. Check your connection.");
    } finally {
      setBusy("");
    }
  }

  async function deleteAccount(event: FormEvent) {
    event.preventDefault();
    setBusy("delete");
    setDeleteNotice("");
    try {
      const response = await fetch("/api/settings/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(deletion) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Unable to delete account.");
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setDeleteNotice(cause instanceof Error ? cause.message : "Unable to delete account.");
      setBusy("");
    }
  }

  const canDelete = Boolean(deletion.reason && deletion.password && deletion.confirmation === "DELETE" && deletion.understandsPermanent);

  return <div className="settings-grid">
    <form className="dashboard-message-card settings-card" onSubmit={event => void submit(event, "profile")}><h3>Profile</h3><p>Your account details used across the dashboard.</p><label>Name<input required minLength={2} value={account.name} onChange={event => setAccount(current => ({ ...current, name: event.target.value }))} /></label><label>Email<input disabled value={profile.email} /></label><label>Phone<input inputMode="tel" value={account.phone} onChange={event => setAccount(current => ({ ...current, phone: event.target.value }))} /></label>{profileNotice ? <div className="form-feedback" role="status">{profileNotice}</div> : null}<button className="btn btn-primary-kp btn-sm-pill" type="submit" disabled={busy === "profile"}>Save profile</button></form>
    <form className="dashboard-message-card settings-card" onSubmit={event => void submit(event, "password")}><h3>Security</h3><p>Use at least eight characters for your new password.</p><label>Current password<input required type="password" autoComplete="current-password" value={password.currentPassword} onChange={event => setPassword(current => ({ ...current, currentPassword: event.target.value }))} /></label><label>New password<input required minLength={8} type="password" autoComplete="new-password" value={password.newPassword} onChange={event => setPassword(current => ({ ...current, newPassword: event.target.value }))} /></label>{passwordNotice ? <div className="form-feedback" role="status">{passwordNotice}</div> : null}<button className="btn btn-primary-kp btn-sm-pill" type="submit" disabled={busy === "password"}>Update password</button></form>
    <section className="dashboard-message-card settings-card danger-zone"><span className="danger-zone-icon"><ShieldAlert size={22} /></span><div><h3>Delete account</h3><p>Permanently remove your profile, items, posts, messages, and recovery activity. This action cannot be undone.</p></div><button className="btn btn-danger btn-sm-pill" type="button" onClick={() => setDeleteOpen(true)}><Trash2 size={17} />Delete my account</button></section>
    {deleteOpen ? <div className="account-action-backdrop" onMouseDown={event => event.target === event.currentTarget && busy !== "delete" && setDeleteOpen(false)}>
      <form className="account-action-dialog delete-account-dialog" onSubmit={event => void deleteAccount(event)} role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-copy">
        <header><span className="danger"><Trash2 size={22} /></span><div><small>Permanent action</small><h2 id="delete-title">Delete your account?</h2></div><button type="button" aria-label="Close delete account dialog" disabled={busy === "delete"} onClick={() => setDeleteOpen(false)}><X size={20} /></button></header>
        <p id="delete-copy">Answer the questions below to confirm this request and help prevent accidental deletion.</p>
        <div className="delete-account-fields">
          <label>Why are you leaving?<select required value={deletion.reason} onChange={event => setDeletion(current => ({ ...current, reason: event.target.value }))}><option value="">Choose a reason</option><option value="NOT_USING">I no longer use Khoya Paya</option><option value="PRIVACY">I have privacy concerns</option><option value="MISSING_FEATURES">Features I need are missing</option><option value="TOO_DIFFICULT">The service is difficult to use</option><option value="OTHER">Another reason</option></select></label>
          <label>What could we improve? <small>Optional</small><textarea rows={3} maxLength={500} value={deletion.feedback} onChange={event => setDeletion(current => ({ ...current, feedback: event.target.value }))} /></label>
          <label>Current password<input required type="password" autoComplete="current-password" value={deletion.password} onChange={event => setDeletion(current => ({ ...current, password: event.target.value }))} /></label>
          <label>Type <strong>DELETE</strong> to confirm<input required autoComplete="off" value={deletion.confirmation} onChange={event => setDeletion(current => ({ ...current, confirmation: event.target.value }))} /></label>
          <label className="delete-understanding"><input type="checkbox" checked={deletion.understandsPermanent} onChange={event => setDeletion(current => ({ ...current, understandsPermanent: event.target.checked }))} /><span>I understand that my account and associated data will be permanently deleted and cannot be recovered.</span></label>
        </div>
        {deleteNotice ? <p className="account-action-error" role="alert">{deleteNotice}</p> : null}
        <footer><button ref={cancelDeleteRef} className="btn btn-secondary-kp btn-sm-pill" type="button" disabled={busy === "delete"} onClick={() => setDeleteOpen(false)}>Keep my account</button><button className="btn btn-danger btn-sm-pill" type="submit" disabled={!canDelete || busy === "delete"}>{busy === "delete" ? "Deleting…" : "Permanently delete"}</button></footer>
      </form>
    </div> : null}
  </div>;
}
