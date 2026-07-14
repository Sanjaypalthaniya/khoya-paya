"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    return href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();

        if (isMounted && response.ok && data.success) {
          setUser(data.user);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.replace("/");
    router.refresh();
  }

  return (
    <nav className="kp-navbar" aria-label="Primary navigation">
      <div className="container d-flex align-items-center justify-content-between">
        <Link className="brand" href="/">
          <span className="brand-mark">K</span> Khoya Paya
        </Link>
        <div className="nav-links d-none d-lg-flex">
          {links.map((link) => (
            <Link className={isActive(link.href) ? "active" : ""} href={link.href} key={link.label} aria-current={isActive(link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="nav-actions d-none d-md-flex">
          {!isCheckingAuth && user ? (
            <>
              <Link className="btn btn-primary-kp btn-sm-pill" href="/dashboard">Dashboard</Link>
              <button className="btn btn-secondary-kp btn-sm-pill" type="button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="link-button" href="/login">Login</Link>
              <Link className="btn btn-primary-kp btn-sm-pill" href="/signup">Get Started</Link>
            </>
          )}
        </div>
        <button className={`hamburger d-lg-none ${isMenuOpen ? "is-open" : ""}`} type="button" aria-label={isMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMenuOpen} aria-controls="mobile-navigation" onClick={() => setIsMenuOpen((open) => !open)}>
          <span />
          <span />
        </button>
      </div>
      <div className={`mobile-navigation d-lg-none ${isMenuOpen ? "is-open" : ""}`} id="mobile-navigation" aria-hidden={!isMenuOpen}>
        <div className="container">
          {links.map((link) => <Link className={isActive(link.href) ? "active" : ""} href={link.href} key={link.label} aria-current={isActive(link.href) ? "page" : undefined} onClick={() => setIsMenuOpen(false)}>{link.label}</Link>)}
          <div className="mobile-nav-actions">
            {!isCheckingAuth && user ? <><Link className="btn btn-primary-kp btn-sm-pill" href="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link><button className="btn btn-secondary-kp btn-sm-pill" type="button" onClick={handleLogout}>Logout</button></> : !isCheckingAuth ? <><Link className="link-button" href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link><Link className="btn btn-primary-kp btn-sm-pill" href="/signup" onClick={() => setIsMenuOpen(false)}>Get Started</Link></> : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
