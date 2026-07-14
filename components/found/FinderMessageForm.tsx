"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";

type FinderMessageFormProps = {
  uniqueCode: string;
};

const emptyForm = {
  finderName: "",
  finderPhone: "",
  finderEmail: "",
  finderMessage: "",
  finderLocation: "",
  finderPhotoUrl: "",
  website: "",
};

export default function FinderMessageForm({ uniqueCode }: FinderMessageFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [chatPath, setChatPath] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setChatPath("");

    if (!form.finderMessage.trim()) {
      setError("Message is required.");
      return;
    }

    if (form.finderMessage.length > 1000) {
      setError("Message must be 1000 characters or less.");
      return;
    }

    if (form.finderEmail && !form.finderEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/found/${uniqueCode}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Unable to send message.");
        return;
      }

      setMessage("Thank you. Your message has been sent safely to the owner.");
      if (data.data?.finderChatToken) setChatPath(`/chat/finder/${data.data.finderChatToken}`);
      setForm(emptyForm);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePhotoUpload(file: File | undefined) {
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/found/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message ?? "Unable to upload photo.");
        return;
      }

      updateField("finderPhotoUrl", data.data.finderPhotoUrl);
    } catch {
      setError("Photo upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="finder-form" onSubmit={handleSubmit}>
      {message ? <div className="auth-alert success" role="status">{message}</div> : null}
      {chatPath ? <a className="btn btn-secondary-kp w-100 finder-chat-link" href={chatPath}>Open your secure chat</a> : null}
      {error ? <div className="auth-alert error" role="alert">{error}</div> : null}
      <div className="row g-3">
        <div className="col-md-6">
          <label>Finder name<input value={form.finderName} onChange={(event) => updateField("finderName", event.target.value)} placeholder="Your name optional" /></label>
        </div>
        <div className="col-md-6">
          <label>Finder phone<input value={form.finderPhone} onChange={(event) => updateField("finderPhone", event.target.value)} placeholder="Phone optional" /></label>
        </div>
        <div className="col-md-6">
          <label>Finder email<input type="email" value={form.finderEmail} onChange={(event) => updateField("finderEmail", event.target.value)} placeholder="Email optional" /></label>
        </div>
        <div className="col-md-6">
          <label>Location<input value={form.finderLocation} onChange={(event) => updateField("finderLocation", event.target.value)} placeholder="Where did you find it?" /></label>
        </div>
        <div className="col-12">
          <div className="image-upload-card finder-upload-card">
            <div>
              <span className="upload-icon" aria-hidden="true"><UploadCloud size={24} /></span>
              <span className="upload-kicker">Optional photo</span>
              <h4>Share a photo of the found item or location</h4>
              <p>Only JPG, PNG, or WEBP images up to 5MB are accepted.</p>
            </div>
            <div className="upload-preview-wrap">
              {form.finderPhotoUrl ? (
                <Image className="upload-preview-image" src={form.finderPhotoUrl} alt="Finder uploaded preview" width={640} height={400} unoptimized />
              ) : (
                <div className="upload-preview-empty"><ImagePlus size={22} /><span>No photo selected</span></div>
              )}
            </div>
            <div className="upload-control-row">
              <label className="upload-file-label">
                <input
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isUploading}
                  onChange={(event) => handlePhotoUpload(event.target.files?.[0])}
                  type="file"
                />
                <UploadCloud size={16} /> {isUploading ? "Uploading..." : "Choose Photo"}
              </label>
              {form.finderPhotoUrl ? (
                <button className="btn btn-secondary-kp btn-sm-pill" onClick={() => updateField("finderPhotoUrl", "")} type="button">
                  <Trash2 size={16} /> Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="col-12">
          <label>Message<textarea rows={5} maxLength={1000} required value={form.finderMessage} onChange={(event) => updateField("finderMessage", event.target.value)} placeholder="Share how the owner can recover this item" /></label>
        </div>
      </div>
      <input aria-hidden="true" aria-label="Leave this field empty" className="hp-field" value={form.website} onChange={(event) => updateField("website", event.target.value)} tabIndex={-1} autoComplete="off" />
      <p className="finder-form-note">Phone/email are optional, but one contact method helps the owner respond safely.</p>
      <button className="btn btn-primary-kp w-100" type="submit" disabled={isLoading || isUploading}>{isLoading ? "Sending safely..." : "Send Safe Message"}</button>
    </form>
  );
}
