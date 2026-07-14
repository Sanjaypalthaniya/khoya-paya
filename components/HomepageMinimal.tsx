"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell, BriefcaseBusiness, Car, ChevronRight, CircleHelp,
  Clock3, FileText, Home, KeyRound, MapPin,
  Menu, MessageCircle, PawPrint, Plus, QrCode, Search, ShieldCheck,
  Smartphone, Sparkles, Trophy, UserRound, Users, WalletCards, X,
} from "lucide-react";
import CommunityFeed from "@/components/community/CommunityFeed";

type User = { name: string; email?: string };
type LinkItem = { label: string; href: string };

const marketingLinks: LinkItem[] = [
  { label: "Home", href: "/" }, { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" }, { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

const categories = [
  ["Mobile", Smartphone], ["Wallet", WalletCards], ["Keys", KeyRound], ["Documents", FileText],
  ["Bags", BriefcaseBusiness], ["Pets", PawPrint], ["Vehicles", Car], ["Electronics", QrCode], ["Other", Plus],
] as const;

function Brand() {
  return <Link className="community-brand" href="/" aria-label="Khoya Paya home"><span aria-hidden="true">K</span><strong>Khoya Paya</strong></Link>;
}

function CommunityHeader({ user }: { user: User | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", close);
    drawerRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [menuOpen]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/"); router.refresh();
  }

  return <>
    <header className="community-header">
      <div className="community-container community-header-inner">
        <Brand />
        <form className="community-global-search" action="/lost-items" role="search">
          <Search size={18} aria-hidden="true" /><label className="visually-hidden" htmlFor="global-search">Search lost and found items</label>
          <input id="global-search" name="q" type="search" placeholder="Search lost items, locations or IDs" />
        </form>
        <nav className="community-desktop-nav" aria-label="Primary navigation">
          {marketingLinks.map((item) => <Link className={pathname === item.href ? "active" : ""} aria-current={pathname === item.href ? "page" : undefined} href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
        <div className="community-header-actions">
          <Link className="icon-button search-trigger" href="/lost-items" aria-label="Search lost items"><Search size={20} /></Link>
          {user && <Link className="icon-button" href="/dashboard/notifications" aria-label="Notifications"><Bell size={20} /></Link>}
          {user ? <Link className="header-avatar" href="/dashboard" aria-label="Open dashboard">{user.name.charAt(0).toUpperCase()}</Link> : <><Link className="header-login" href="/login">Log in</Link><Link className="community-button small" href="/signup">Sign up</Link></>}
          <button className="icon-button menu-trigger" type="button" aria-expanded={menuOpen} aria-controls="community-drawer" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
        </div>
      </div>
    </header>
    {menuOpen && <button className="community-drawer-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    <div className={`community-drawer ${menuOpen ? "is-open" : ""}`} id="community-drawer" ref={drawerRef} aria-hidden={!menuOpen}>
      <div className="drawer-heading"><Brand /><button className="icon-button" type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
      <nav aria-label="Mobile navigation">{marketingLinks.map((item) => <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ChevronRight size={17} /></Link>)}</nav>
      <div className="drawer-actions">{user ? <><Link className="community-button" href="/dashboard">Dashboard</Link><button className="community-button secondary" type="button" onClick={logout}>Log out</button></> : <><Link className="community-button" href="/signup">Create account</Link><Link className="community-button secondary" href="/login">Log in</Link></>}</div>
    </div>
  </>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="community-section-heading"><div>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>;
}

function LeftSidebar({ user }: { user: User | null }) {
  const links = [
    ["Home", "/", Home], ["Community", "/#community-feed", Users], ["Nearby", "/lost-items", MapPin],
    ["My posts", "/dashboard/community-posts", FileText], ["My QR items", "/dashboard/items", QrCode],
    ["Messages", "/dashboard/messages", MessageCircle], ["Scan history", "/dashboard/scans", Clock3],
    ["Success stories", "/#success-stories", Trophy], ["Pricing", "/pricing", Sparkles], ["How It Works", "/how-it-works", CircleHelp],
  ] as const;
  return <aside className="community-left" aria-label="Community shortcuts">
    <div className="community-card mini-profile"><span className="community-avatar">{user?.name.charAt(0).toUpperCase() || <UserRound size={21} />}</span><div><strong>{user?.name || "Welcome, neighbour"}</strong><small>{user ? "Your recovery hub" : "Join the recovery network"}</small></div></div>
    <nav className="community-side-nav">{links.map(([label, href, Icon], i) => <Link className={i === 0 ? "active" : ""} href={href} key={label}><Icon size={19} />{label}</Link>)}</nav>
    <div className="quick-report"><strong>Quick report</strong><Link className="lost" href="/dashboard/items/add">Report lost item</Link><Link className="found" href="/report-found-item">Report found item</Link></div>
  </aside>;
}

function RightSidebar() {
  return <aside className="community-right" aria-label="Community highlights">
    <section className="community-card side-card"><SectionHeading eyebrow="This week" title="Top helpers" /><ol className="helper-list"><li><span>AM</span><div><strong>Aarav M.</strong><small>12 helpful responses</small></div><Trophy size={18} /></li><li><span>NS</span><div><strong>Neha S.</strong><small>9 helpful responses</small></div><Trophy size={18} /></li><li><span>RK</span><div><strong>Rohan K.</strong><small>7 helpful responses</small></div><Trophy size={18} /></li></ol></section>
    <section className="community-card side-card"><SectionHeading eyebrow="Near you" title="Trending locations" /><div className="location-list"><Link href="/lost-items?q=station"><MapPin size={16} />Railway stations<span>24</span></Link><Link href="/lost-items?q=market"><MapPin size={16} />Local markets<span>18</span></Link><Link href="/lost-items?q=campus"><MapPin size={16} />Campuses<span>11</span></Link></div></section>
    <section className="community-card protection-card"><ShieldCheck size={25} /><h2>Protect what matters</h2><p>Create a private QR recovery link for everyday valuables.</p><Link href="/pricing">Explore QR plans <ChevronRight size={16} /></Link></section>
  </aside>;
}

export default function HomepageMinimal() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { let mounted = true; fetch("/api/auth/me", { cache: "no-store" }).then(async (r) => ({ ok: r.ok, data: await r.json() })).then(({ ok, data }) => { if (mounted && ok && data.success) setUser(data.user); }).catch(() => undefined); return () => { mounted = false; }; }, []);

  return <main className="community-home">
    <CommunityHeader user={user} />
    <section className="community-hero">
      <div className="community-container hero-grid"><div><span className="hero-kicker"><Users size={15} />India&apos;s community recovery network</span><h1>Lost something?<br /><em>Let your community help.</em></h1><p>Report lost or found items, search nearby posts, and protect valuables with private QR recovery.</p><div className="hero-actions"><Link className="community-button lost-action" href="/dashboard/items/add">Report lost item</Link><Link className="community-button found-action" href="/report-found-item">Report found item</Link><Link className="community-button secondary" href="/recover"><QrCode size={18} />Scan or enter QR</Link></div></div><form className="hero-search" action="/lost-items" role="search"><label htmlFor="hero-search">Search Lost &amp; Found</label><div><Search size={20} /><input id="hero-search" name="q" type="search" placeholder="Try “black wallet in Pune”" /><button type="submit">Search</button></div><small><ShieldCheck size={14} />Privacy-safe public listings</small></form></div>
    </section>

    <section className="community-categories" aria-labelledby="category-title"><div className="community-container"><SectionHeading title="Quick categories" action={<Link href="/lost-items">View all <ChevronRight size={16} /></Link>} /><div className="category-row">{categories.map(([label, Icon]) => <Link href={`/lost-items?category=${encodeURIComponent(label)}`} key={label}><span><Icon size={20} /></span>{label}</Link>)}</div></div></section>

    <div className="community-container community-layout">
      <LeftSidebar user={user} />
      <div id="community-feed"><CommunityFeed initials={user?.name.charAt(0).toUpperCase() || "U"} /></div>
      <RightSidebar />
    </div>

    <section className="compact-marketing" id="success-stories"><div className="community-container"><SectionHeading eyebrow="Community momentum" title="Small actions. Real reunions." /><div className="stats-grid"><article><strong>Privacy first</strong><span>Owner contact details stay hidden</span></article><article><strong>QR powered</strong><span>One scan opens a safe recovery route</span></article><article><strong>Community led</strong><span>Helpful local reports improve the odds</span></article><article><strong>Built for trust</strong><span>Verification and secure messaging included</span></article></div></div></section>
    <section className="how-preview"><div className="community-container"><SectionHeading eyebrow="Simple by design" title="From missing to reunited" action={<Link href="/how-it-works">How it works <ChevronRight size={16} /></Link>} /><div className="steps-grid">{[["1", "Share safely", "Create a privacy-safe lost or found report."], ["2", "Connect securely", "Use finder messaging without exposing personal details."], ["3", "Recover confidently", "Verify, coordinate, and mark the item recovered."]].map(([n,t,c]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{c}</p></article>)}</div></div></section>
    <section className="qr-preview"><div className="community-container qr-preview-inner"><div><span className="hero-kicker light"><QrCode size={15} />QR protection</span><h2>Give honest finders a safe way to reach you.</h2><p>Attach a unique Khoya Paya QR to bags, keys, documents, pet collars, and more.</p><div><Link className="community-button light-button" href="/signup">Protect an item</Link><Link className="text-link-light" href="/pricing">See pricing <ChevronRight size={16} /></Link></div></div><div className="qr-demo" aria-label="QR protection illustration"><QrCode size={118} /><span><ShieldCheck size={18} />Private contact enabled</span></div></div></section>
    <section className="safety-faq"><div className="community-container safety-grid"><div><ShieldCheck size={30} /><span>Safety &amp; privacy</span><h2>Your details are yours.</h2><p>Finders communicate through safe platform flows. Phone numbers and email addresses do not need to be posted publicly.</p><Link href="/privacy-policy">Read our privacy policy</Link></div><div><SectionHeading eyebrow="Common questions" title="Good to know" />{[["Is it free to report an item?", "Yes. Public found-item reporting does not require an account, and core registration is available on the free plan."], ["What if my item has no QR?", "Use the public found report or search nearby lost listings."], ["Can a finder see my phone number?", "No. Safe messaging is designed to protect owner contact details."]].map(([q,a],i) => <details key={q} open={i===0}><summary>{q}<Plus size={18} /></summary><p>{a}</p></details>)}</div></div></section>
    <footer className="community-footer"><div className="community-container"><div className="footer-main"><div><Brand /><p>Community-powered lost and found with private QR recovery.</p></div><nav aria-label="Footer navigation">{marketingLinks.slice(1).map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}<Link href="/lost-items">Lost items</Link><Link href="/report-found-item">Report found</Link><Link href="/privacy-policy">Privacy</Link><Link href="/terms-and-conditions">Terms</Link></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Khoya Paya</span><span>Find less. Recover more.</span></div></div></footer>
    <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation"><Link className="active" href="/"><Home size={20} /><span>Home</span></Link><Link href="/lost-items"><Search size={20} /><span>Search</span></Link><Link className="create" href="/dashboard/items/add"><Plus size={23} /><span>Create</span></Link><Link href="/dashboard/messages"><MessageCircle size={20} /><span>Messages</span></Link><Link href={user ? "/dashboard" : "/login"}><UserRound size={20} /><span>Profile</span></Link></nav>
  </main>;
}
