"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";

type Message = { id: string; senderType: "OWNER" | "FINDER" | "SYSTEM" | "ADMIN"; message: string; createdAt: string };

export default function ChatWindow({ initialMessages, initialStatus, fetchUrl, sendUrl, readUrl, viewer }: {
  initialMessages: Message[]; initialStatus: "OPEN" | "CLOSED" | "SPAM" | "RECOVERED"; fetchUrl: string; sendUrl: string; readUrl: string; viewer: "OWNER" | "FINDER";
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(fetchUrl, { cache: "no-store", signal });
      const body = await response.json();
      if (!response.ok) return;
      setMessages(body.data.conversation.messages);
      setStatus(body.data.conversation.status);
      await fetch(readUrl, { method: "PATCH", signal });
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      // A temporary polling failure must not interrupt the active chat.
    }
  }, [fetchUrl, readUrl]);
  useEffect(() => {
    const controller = new AbortController();
    const initialTimer = window.setTimeout(() => void load(controller.signal), 0);
    const timer = window.setInterval(() => void load(controller.signal), 5000);
    return () => {
      controller.abort();
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [load]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);
  async function send(message: string) {
    setError("");
    try {
      const response = await fetch(sendUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
      const body = await response.json();
      if (!response.ok) { setError(body.message ?? "Unable to send message."); return false; }
      setMessages((current) => current.some((entry) => entry.id === body.data.message.id)
        ? current
        : [...current, body.data.message]);
      return true;
    } catch { setError("Unable to send message. Please try again."); return false; }
  }
  return (
    <section className="chat-window">
      <div className="chat-stream" aria-live="polite">
        {messages.map((message) => <ChatMessageBubble key={message.id} message={message} viewer={viewer} />)}
        <div ref={endRef} />
      </div>
      {status !== "OPEN" ? <div className="chat-closed-note">This conversation is {status.toLowerCase()}. New replies are disabled.</div> : null}
      {error ? <div className="auth-alert error" role="alert">{error}</div> : null}
      <ChatInput disabled={status !== "OPEN"} onSend={send} />
    </section>
  );
}
