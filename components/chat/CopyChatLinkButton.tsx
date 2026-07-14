"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyChatLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  return <button className="btn btn-secondary-kp btn-sm-pill" onClick={copy} type="button">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy finder link"}</button>;
}
