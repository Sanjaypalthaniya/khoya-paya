"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, X } from "lucide-react";

type LogoutContextValue = { requestLogout: () => void };
const LogoutContext = createContext<LogoutContextValue | null>(null);

export function LogoutProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, busy]);

  function requestLogout() {
    setError("");
    setOpen(true);
  }

  async function confirmLogout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      setOpen(false);
      router.replace("/login");
      router.refresh();
    } catch {
      setError("We could not log you out. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <LogoutContext.Provider value={{ requestLogout }}>
    {children}
    {open ? <div className="logout-modal-layer" onMouseDown={event => event.target === event.currentTarget && !busy && setOpen(false)}>
      <section className="logout-modal-card" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title" aria-describedby="logout-modal-copy">
        <button className="logout-modal-close" type="button" aria-label="Close logout confirmation" disabled={busy} onClick={() => setOpen(false)}><X size={19} /></button>
        <div className="logout-modal-visual"><span><LogOut size={27} /></span><i><ShieldCheck size={15} /></i></div>
        <div className="logout-modal-copy">
          <span>Secure sign out</span>
          <h2 id="logout-modal-title">Ready to log out?</h2>
          <p id="logout-modal-copy">Your account stays protected. You will need to sign in again to access your dashboard.</p>
        </div>
        {error ? <p className="logout-modal-error" role="alert">{error}</p> : null}
        <footer>
          <button ref={cancelRef} className="logout-stay-button" type="button" disabled={busy} onClick={() => setOpen(false)}>Stay logged in</button>
          <button className="logout-confirm-button" type="button" disabled={busy} onClick={() => void confirmLogout()}>{busy ? "Logging out…" : <><LogOut size={17} />Log out</>}</button>
        </footer>
      </section>
    </div> : null}
  </LogoutContext.Provider>;
}

export default function LogoutButton({ className = "" }: { className?: string; onComplete?: () => void }) {
  const context = useContext(LogoutContext);
  if (!context) throw new Error("LogoutButton must be used inside LogoutProvider.");
  return <button className={className} type="button" onClick={context.requestLogout}><LogOut size={17} aria-hidden="true" />Logout</button>;
}
