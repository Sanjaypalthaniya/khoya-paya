"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
export default function RecoverySearch() {
  const router = useRouter(); const [code, setCode] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); const clean = code.trim(); if (clean) router.push(`/recover/${encodeURIComponent(clean)}`); }
  return <form className="recovery-search-card" onSubmit={submit}><label>Enter Recovery ID<input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="KP-82X4F" maxLength={24} required /></label><button className="btn btn-primary-kp" type="submit"><Search size={17} /> Find item</button></form>;
}
