"use client";

import { DragEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { contactPreferences, itemCategories, itemStatusValues } from "@/lib/validations/item";
import { Check, ImagePlus, LockKeyhole, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";

type ItemFormProps = {
  mode: "create" | "edit";
  item?: {
    id: string;
    itemName: string;
    category: string;
    description: string;
    imageUrl: string | null;
    rewardAmount: string | null;
    contactPreference: string;
    status: string;
    brand?: string | null; modelNumber?: string | null; color?: string | null; identifyingMarks?: string | null;
    lastSeenLocation?: string | null; publicSearchVisible?: boolean; qrRecoveryEnabled?: boolean;
  };
};

export default function ItemForm({ mode, item }: ItemFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    itemName: item?.itemName ?? "",
    category: item?.category ?? "Bag",
    description: item?.description ?? "",
    imageUrl: item?.imageUrl ?? "",
    rewardAmount: item?.rewardAmount ?? "",
    contactPreference: item?.contactPreference ?? "Message Only",
    status: item?.status ?? "SAFE",
    brand: item?.brand ?? "", modelNumber: item?.modelNumber ?? "", color: item?.color ?? "", identifyingMarks: item?.identifyingMarks ?? "",
    lastSeenLocation: item?.lastSeenLocation ?? "", publicSearchVisible: item?.publicSearchVisible ?? false, qrRecoveryEnabled: item?.qrRecoveryEnabled ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(mode === "create" ? "/api/items" : `/api/items/${item?.id}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rewardAmount: form.rewardAmount ? Number(form.rewardAmount) : null,
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setError(data?.message ?? "Unable to save item. Please try again.");
        return;
      }

      router.push(mode === "create" ? "/dashboard/items" : `/dashboard/items/${item?.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageUpload(file: File | undefined) {
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setError(data?.message ?? "Unable to upload image.");
        return;
      }

      updateField("imageUrl", data.data.imageUrl);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleImageUpload(event.dataTransfer.files?.[0]);
  }

  return (
    <form className="item-form premium-item-form" onSubmit={handleSubmit}>
      {error ? <div className="auth-alert error" role="alert">{error}</div> : null}
      <section className="form-section-card">
        <div className="form-section-head"><span><ImagePlus size={20} /></span><div><h3>Basic information</h3><p>The details that help you identify this item.</p></div><small>01</small></div>
        <div className="row g-4">
          <div className="col-md-6"><label>Item name <small>Required</small><input value={form.itemName} onChange={(event) => updateField("itemName", event.target.value)} placeholder="e.g. Black leather backpack" required /></label></div>
          <div className="col-md-6"><label>Category<select value={form.category} onChange={(event) => updateField("category", event.target.value)}>{itemCategories.map((category) => <option key={category}>{category}</option>)}</select></label></div>
          <div className="col-12"><label>Description <small>Optional</small><textarea rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Add color, brand, model, or other identifying details..." /><em>Clear details make verification easier during recovery.</em></label></div>
          <div className="col-md-4"><label>Brand <small>Optional</small><input value={form.brand} onChange={(event) => updateField("brand", event.target.value)} /></label></div>
          <div className="col-md-4"><label>Model <small>Optional</small><input value={form.modelNumber} onChange={(event) => updateField("modelNumber", event.target.value)} /></label></div>
          <div className="col-md-4"><label>Color <small>Optional</small><input value={form.color} onChange={(event) => updateField("color", event.target.value)} /></label></div>
          <div className="col-12"><label>Unique identifying marks <small>Optional</small><textarea rows={2} value={form.identifyingMarks} onChange={(event) => updateField("identifyingMarks", event.target.value)} placeholder="Scratch, sticker, engraving or another private identifier" /></label></div>
        </div>
      </section>

      <section className="form-section-card">
        <div className="form-section-head"><span><UploadCloud size={20} /></span><div><h3>Images</h3><p>Add a clear photo to make identification easier.</p></div><small>02</small></div>
        <div className={`premium-upload-zone ${isDragging ? "is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
          {form.imageUrl ? <div className="premium-upload-preview"><Image src={form.imageUrl} alt="Item preview" width={720} height={480} unoptimized /><button type="button" onClick={() => updateField("imageUrl", "")}><Trash2 size={17} /> Delete image</button></div> : <><span className="upload-illustration"><UploadCloud size={30} /></span><h4>Drag and drop your image here</h4><p>JPG, PNG or WEBP · Maximum 5MB</p><label className="upload-file-label"><input accept="image/jpeg,image/png,image/webp" disabled={isUploading} onChange={(event) => handleImageUpload(event.target.files?.[0])} type="file" />{isUploading ? "Uploading image..." : "Browse files"}</label></>}
          {isUploading ? <div className="upload-progress"><i /><span>Uploading securely…</span></div> : null}
        </div>
        <label className="manual-image-url">Or paste an image URL <small>Optional</small><input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} placeholder="https://example.com/item.jpg" /></label>
      </section>

      <section className="form-section-card">
        <div className="form-section-head"><span><ShieldCheck size={20} /></span><div><h3>Recovery information</h3><p>Choose how a finder can help return your item.</p></div><small>03</small></div>
        <div className="row g-4">
          <div className="col-md-6"><label>Reward amount <small>Optional</small><div className="input-prefix"><span>₹</span><input type="number" min="0" value={form.rewardAmount} onChange={(event) => updateField("rewardAmount", event.target.value)} placeholder="0" /></div><em>You can change or remove this later.</em></label></div>
          <div className="col-md-6"><label>Contact preference<select value={form.contactPreference} onChange={(event) => updateField("contactPreference", event.target.value)}>{contactPreferences.map((preference) => <option key={preference}>{preference}</option>)}</select><em>Your private contact details remain protected.</em></label></div>
        </div>
      </section>

      <section className="form-section-card">
        <div className="form-section-head"><span><LockKeyhole size={20} /></span><div><h3>Security</h3><p>Set the item’s current recovery status.</p></div><small>04</small></div>
        <label>Status<select value={form.status} onChange={(event) => updateField("status", event.target.value)}>{itemStatusValues.map((status) => <option key={status}>{status}</option>)}</select><em><LockKeyhole size={14} /> Only you can change this status from your dashboard.</em></label>
        <label className="mt-3">Last seen location <small>Optional</small><input value={form.lastSeenLocation} onChange={(event) => updateField("lastSeenLocation", event.target.value)} /></label>
        <div className="form-check-row"><label><input type="checkbox" checked={form.publicSearchVisible} onChange={(event) => updateField("publicSearchVisible", event.target.checked)} /> Show this item in public lost-item search</label><label><input type="checkbox" checked={form.qrRecoveryEnabled} onChange={(event) => updateField("qrRecoveryEnabled", event.target.checked)} /> Enable QR recovery</label></div>
      </section>

      <div className="form-action-bar"><div><Check size={17} /><span>Your changes are saved securely.</span></div><button className="btn btn-secondary-kp" type="button" onClick={() => router.back()}>Cancel</button><button className="btn btn-primary-kp" disabled={isLoading || isUploading} type="submit">{isLoading ? "Saving..." : mode === "create" ? "Add protected item" : "Save changes"}</button></div>
    </form>
  );
}
