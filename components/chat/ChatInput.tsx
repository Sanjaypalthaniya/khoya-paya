"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ disabled, onSend }: { disabled?: boolean; onSend: (message: string) => Promise<boolean> }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = message.trim();
    if (!value || disabled || sending) return;
    setSending(true);
    try {
      if (await onSend(value)) setMessage("");
    } finally {
      setSending(false);
    }
  }
  return (
    <form className="chat-input" onSubmit={submit}>
      <textarea aria-label="Chat message" disabled={disabled || sending} maxLength={1000} onChange={(event) => setMessage(event.target.value)} placeholder={disabled ? "This conversation is closed" : "Write a secure message…"} rows={2} value={message} />
      <button className="btn btn-primary-kp" disabled={disabled || sending || !message.trim()} type="submit"><Send size={17} /> {sending ? "Sending…" : "Send"}</button>
    </form>
  );
}
