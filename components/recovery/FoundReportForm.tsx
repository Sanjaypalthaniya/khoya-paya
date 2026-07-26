"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, MapPin, MessageSquareText, Send, ShieldCheck, UserRound, X } from "lucide-react";
import { itemCategories } from "@/lib/validations/item";

function friendlyError(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  if (/__TURBOPACK__|PrismaClient|prisma[.$]|server[\\/]chunks|invocation in/i.test(value)) return fallback;
  return value;
}

export default function FoundReportForm({ recoveryCode = "" }: { recoveryCode?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({
    recoveryCode, category: "Other", brand: "", modelNumber: "", color: "",
    identifyingMarks: "", description: "", foundLocation: "",
    foundDate: new Date().toISOString().slice(0, 16), finderName: "",
    finderPhone: "", finderWhatsapp: "", finderEmail: "", message: "",
  });

  function field(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const imageUrls: string[] = [];
      for (const photo of photos) {
        const uploadData = new FormData();
        uploadData.set("file", photo);
        const uploadResponse = await fetch("/api/found/upload", { method: "POST", body: uploadData });
        const uploadBody = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(friendlyError(uploadBody.message, `Unable to upload ${photo.name}.`));
        imageUrls.push(uploadBody.data.finderPhotoUrl);
      }
      const response = await fetch("/api/found-reports", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrls, photoUrl: imageUrls[0] ?? "" }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(friendlyError(body.message, "Unable to notify owner. Please check the details and try again."));
        return;
      }
      if (body.data.chatToken) router.push(`/chat/finder/${body.data.chatToken}`);
      else router.push(`/report-found-item/success?id=${body.data.reportId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit report. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="enterprise-form found-report-form" onSubmit={submit}>
      {error ? <div className="auth-alert error" role="alert">{error}</div> : null}
      <header className="found-form-intro"><span><ShieldCheck size={22} /></span><div><small>Private recovery report</small><h2>Tell us what you found</h2><p>Share recognisable details only. We’ll securely match them with registered lost items.</p></div><b>01</b></header>

      <section className="found-form-section">
        <div className="found-form-section-head"><ImagePlus size={20} /><div><h3>Item details</h3><p>Information that helps the owner recognise their belonging.</p></div></div>
        <div className="found-form-grid">
          <label>Recovery ID <small>Optional</small><input value={form.recoveryCode} onChange={(e) => field("recoveryCode", e.target.value.toUpperCase())} placeholder="e.g. KP-82X4F" /></label>
          <label>Category <span>Required</span><select value={form.category} onChange={(e) => field("category", e.target.value)}>{itemCategories.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Brand <small>Optional</small><input value={form.brand} onChange={(e) => field("brand", e.target.value)} placeholder="e.g. Apple" /></label>
          <label>Model <small>Optional</small><input value={form.modelNumber} onChange={(e) => field("modelNumber", e.target.value)} placeholder="Model or variant" /></label>
          <label>Color <small>Optional</small><input value={form.color} onChange={(e) => field("color", e.target.value)} placeholder="Primary color" /></label>
          <label className="found-field-wide">Description <span>Required</span><textarea rows={4} value={form.description} onChange={(e) => field("description", e.target.value)} minLength={10} required placeholder="Describe the item’s appearance without sharing sensitive personal details." /></label>
          <label className="found-field-wide">Unique identifying marks <small>Optional</small><input value={form.identifyingMarks} onChange={(e) => field("identifyingMarks", e.target.value)} placeholder="Scratch, sticker, engraving, or another visible detail" /></label>
        </div>
      </section>

      <section className="found-form-section">
        <div className="found-form-section-head"><MapPin size={20} /><div><h3>Where and when</h3><p>Use a public area or landmark—never a private address.</p></div></div>
        <div className="found-form-grid found-form-grid-two">
          <label>Found location <span>Required</span><input value={form.foundLocation} onChange={(e) => field("foundLocation", e.target.value)} required placeholder="Area, landmark, station…" /></label>
          <label>Date &amp; time found <span>Required</span><input type="datetime-local" value={form.foundDate} onChange={(e) => field("foundDate", e.target.value)} required /></label>
        </div>
      </section>

      <section className="found-form-section">
        <div className="found-form-section-head"><UserRound size={20} /><div><h3>Your contact preferences</h3><p>Optional details used only for this secure recovery conversation.</p></div></div>
        <div className="found-form-grid found-form-grid-two">
          <label>Your name <small>Optional</small><input value={form.finderName} onChange={(e) => field("finderName", e.target.value)} placeholder="How should we address you?" /></label>
          <label>Email <small>Optional</small><input type="email" value={form.finderEmail} onChange={(e) => field("finderEmail", e.target.value)} placeholder="name@example.com" /></label>
          <label>Phone <small>Optional</small><input value={form.finderPhone} onChange={(e) => field("finderPhone", e.target.value)} placeholder="Phone number" /></label>
          <label>WhatsApp <small>Optional</small><input value={form.finderWhatsapp} onChange={(e) => field("finderWhatsapp", e.target.value)} placeholder="WhatsApp number" /></label>
        </div>
      </section>

      <section className="found-form-section">
        <div className="found-form-section-head"><Camera size={20} /><div><h3>Photos and message</h3><p>Add privacy-safe photos and explain how the owner can recover the item.</p></div></div>
        <label className="found-upload"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setPhotos(Array.from(event.target.files ?? []).slice(0, 5))} /><span><ImagePlus size={24} /></span><strong>Choose up to 5 photos</strong><small>JPG, PNG or WEBP. Avoid IDs and private information.</small></label>
        {photos.length ? <div className="found-photo-list">{photos.map((photo) => <span key={`${photo.name}-${photo.lastModified}`}><ImagePlus size={15} />{photo.name}<button type="button" aria-label={`Remove ${photo.name}`} onClick={() => setPhotos((current) => current.filter((item) => item !== photo))}><X size={14} /></button></span>)}</div> : null}
        <label className="found-message"><MessageSquareText size={18} /> Message to owner <span>Required</span><textarea rows={4} value={form.message} onChange={(e) => field("message", e.target.value)} required placeholder="Tell the owner how they can recover the item safely." /></label>
      </section>

      <footer className="found-form-submit"><div><ShieldCheck size={20} /><span><strong>Your privacy is protected</strong><small>Owner contact details remain hidden. No account is required.</small></span></div><button disabled={loading} type="submit"><Send size={17} /> {loading ? "Matching securely…" : "Notify owner securely"}</button></footer>
    </form>
  );
}
