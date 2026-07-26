"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight, Building2, Check, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, FileText,
  GraduationCap, Home, KeyRound, Menu, MessageCircle, QrCode,
  ShieldCheck, TrainFront, Users, X,
} from "lucide-react";

type User = { name: string };

const navLinks = [
  ["Product", "/#product"],
  ["How It Works", "/#how-it-works"],
  ["Solutions", "/#solutions"],
  ["Pricing", "/pricing"],
  ["Resources", "/#resources"],
] as const;

const faqs = [
  ["What does Khoya Paya actually do?", "It gives people a privacy-first way to report, discover, verify and recover important belongings."],
  ["Does it work on Android?", "Yes. The responsive web experience works on modern Android and iOS browsers."],
  ["Does it require a subscription or battery?", "Reporting and community search do not require a device battery. Optional QR protection plans are available for registered items."],
  ["How does it connect to my phone?", "Finders use the protected recovery page or secure messaging. Your personal contact details do not need to be public."],
  ["Will it slow down my phone or drain the battery?", "No. A Khoya Paya QR label is passive and requires no power."],
  ["Can I customise which apps are locked?", "Khoya Paya protects item recovery details rather than controlling other applications on your phone."],
  ["Can I block websites, not just apps?", "No. Khoya Paya is a recovery and community platform, not a website blocker."],
  ["What happens if I lose the disc?", "You can mark the associated item as lost and manage or replace its protection from your dashboard."],
  ["When will my order arrive?", "Delivery timing appears during checkout and depends on the selected QR product and destination."],
  ["Will I pay customs or import fees?", "Any applicable delivery or import charges are shown where available before payment."],
  ["Can I return my Khoya Paya QR?", "Please contact support with your order details so the team can confirm eligibility under the current return policy."],
  ["Is checkout secure?", "Payments use the project's configured payment provider and are verified server-side."],
] as const;

function PhoneMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`kp-phone ${compact ? "compact" : ""}`} aria-label="Khoya Paya product interface preview">
      <div className="kp-phone-notch" />
      <div className="kp-phone-top"><strong>KHoya Paya</strong><span>•••</span></div>
      <div className="kp-phone-orbit"><div><QrCode size={compact ? 28 : 42} /><span>Scan</span></div></div>
      <div className="kp-phone-sheet">
        <span>My protected items</span>
        <div><KeyRound size={15} /><p><strong>House keys</strong><small>Protected</small></p><CircleCheck size={15} /></div>
        <div><FileText size={15} /><p><strong>Travel wallet</strong><small>Safe at home</small></p><CircleCheck size={15} /></div>
      </div>
    </div>
  );
}

function Header({ user, authReady }: { user: User | null; authReady: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="kp-home-header">
      <Link className="kp-wordmark" href="/" aria-label="Khoya Paya home"><span>K</span>Khoya Paya</Link>
      <nav className="kp-nav-pill" aria-label="Primary navigation">
        {navLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <div className="kp-header-actions">
        <Link className="kp-signin" href={user ? "/dashboard" : "/login"}>{user ? "Dashboard" : "Sign in"}</Link>
        <Link className="kp-button kp-button-light kp-button-small" href={user ? "/dashboard/items/add" : "/signup"}>{user ? "Add item" : "Get Started"}</Link>
        <button className="kp-menu-button" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="kp-mobile-menu" aria-label="Mobile navigation">
        {navLinks.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        {authReady && user ? <>
          <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/dashboard/items/add" onClick={() => setOpen(false)}>Add item</Link>
        </> : authReady ? <>
          <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
          <Link href="/signup" onClick={() => setOpen(false)}>Get started</Link>
        </> : null}
      </nav>}
    </header>
  );
}

function SectionTitle({ title, copy }: { title: string; copy?: string }) {
  return <div className="kp-section-title"><h2>{title}</h2>{copy && <p>{copy}</p>}</div>;
}

export default function HomepageMinimal() {
  const caseSliderRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me", { cache: "no-store" }).then(r => r.json()).then(data => {
      if (mounted && data.success) setUser(data.user);
    }).catch(() => undefined).finally(() => {
      if (mounted) setAuthReady(true);
    });
    return () => { mounted = false; };
  }, []);

  return <main className="kp-approved-home">
    <section className="kp-hero">
      <Image src="/images/kp-home-hero.png" fill priority sizes="100vw" alt="" className="kp-hero-image" />
      <div className="kp-hero-shade" />
      <Header user={user} authReady={authReady} />
      <div className="kp-hero-copy">
        <span className="kp-kicker">Community-powered lost &amp; found</span>
        <h1>Bring Lost Things Home.<br />All in One Place.</h1>
        <div className="kp-hero-intro">
          <p>Report lost or found items, reach people nearby, verify ownership privately, and complete recovery without exposing personal details.</p>
          <div><Link className="kp-button kp-button-light" href="/dashboard/items/add">Report a Lost Item</Link><Link className="kp-text-link light" href="/report-found-item">I Found Something <ArrowUpRight size={14} /></Link></div>
        </div>
      </div>
      <div className="kp-status-rail">
        {[["Lost Item Report","Create a clear report"],["Nearby Match","Relevant reports surfaced"],["QR Scan","Private recovery route"],["Recovery Confirmed","Close the loop safely"]].map(([title, copy], i) =>
          <Link href={i === 3 ? "/dashboard/claims" : i === 2 ? "/dashboard/items" : "/lost-items"} key={title}><span className={i === 3 ? "green" : ""}>{i === 3 ? <Check size={13} /> : i + 1}</span><p><strong>{title}</strong><small>{copy}</small></p></Link>
        )}
      </div>
    </section>

    <section className="kp-trust-strip" aria-label="Platform principles">
      <p>Designed for people and places where belongings matter.</p>
      <div>{["Privacy first","Community powered","Secure verification","Safer recovery","Built for everyday life"].map((item, i) => <span key={item}>{i % 2 ? <Users size={15} /> : <ShieldCheck size={15} />}{item}</span>)}</div>
    </section>

    <section className="kp-split kp-container" id="product">
      <div className="kp-split-copy">
        <h2>A Digital Identity<br />for Every Important Item.</h2>
        <p>Register your bags, wallets, keys, electronics, documents, and pet tags before they are lost. Every item receives a unique QR recovery page that helps a finder contact you safely.</p>
        <Link className="kp-button kp-button-dark" href="/signup">Protect an Item <ArrowUpRight size={14} /></Link>
        <Link className="kp-button kp-button-outline" href="/how-it-works">See How QR Recovery Works <ArrowUpRight size={14} /></Link>
      </div>
      <div className="kp-split-photo"><Image src="/images/kp-home-lifestyle.png" fill sizes="(max-width: 700px) 100vw, 50vw" alt="Everyday valuables arranged on a walnut table" /></div>
    </section>

    <section className="kp-how kp-container" id="how-it-works">
      <SectionTitle title="How it works." copy="A simple recovery journey—from reporting an item to bringing it safely home." />
      <div className="kp-step-grid">
        {[
          ["01","Report the Item","Add a photo, category, description, last-known place, and the details that are safe to share.",<FileText key="i" />],
          ["02","Reach the Right People","Your public-safe post becomes discoverable through search and nearby community members.",<MessageCircle key="i" />],
          ["03","Verify and Recover","Connect privately, confirm ownership, arrange a safe return, and close the item as recovered.",<ShieldCheck key="i" />],
        ].map(([n, title, copy, icon]) => <article key={String(n)}><span>{n}</span><h3>{title}</h3><p>{copy}</p><div className="kp-step-visual">{icon}<div className="mini-lines"><i /><i /><i /></div></div></article>)}
      </div>
      <Link className="kp-button kp-button-dark kp-centered-button" href="/how-it-works">See the Complete Recovery Journey <ArrowUpRight size={14} /></Link>
    </section>

    <section className="kp-dashboard-section">
      <div className="kp-container kp-dashboard-grid">
        <div>
          <SectionTitle title="Everything You Need. In One Quiet Dashboard." />
          <div className="kp-chips">{["My Items","Community Feed","Nearby","Messages","Claims","QR Scans"].map(x => <span key={x}>{x}</span>)}</div>
          <h3>One view. Every recovery step.</h3>
          <p>Manage registered items, community posts, scans, conversations, claims, and recovery progress from one simple dashboard.</p>
          <Link className="kp-button kp-button-dark" href="/dashboard">Explore the Dashboard <ArrowUpRight size={14} /></Link>
        </div>
        <PhoneMockup />
      </div>
    </section>

    <section className="kp-recovery kp-container">
      <Image src="/images/kp-home-hero.png" fill sizes="100vw" alt="" />
      <div className="kp-recovery-overlay" />
      <div className="kp-recovery-copy">
        <h2>Lost-Item Recovery<br />Shouldn’t Feel Scattered.</h2>
        <p>Khoya Paya connects protection, reporting, discovery, verification, and recovery into one structured process.</p>
        <span>Reported → Discovered → Claim Received → Verified → Recovered</span>
      </div>
      <div className="kp-fact-grid">
        {[["Item Status","Safe, Lost, Found, Missing and Recovered"],["Up to 8 Images","Add clear visual information to help people recognise an item"],["Secure Recovery Thread","Keep owner and finder communication connected to the item"],["Public Contact Details","Phone numbers and addresses stay private by default"]].map(([title, copy]) => <article key={title}><strong>{title}</strong><p>{copy}</p></article>)}
      </div>
    </section>

    <section className="kp-use-cases" id="solutions">
      <div className="kp-use-cases-heading kp-container">
        <SectionTitle title="Make Recovery Easier Wherever Life Happens." copy="Manage registered items, community posts, scans, conversations, claims, and recovery progress from one simple dashboard." />
        <div className="kp-slider-controls" aria-label="Use case slider controls">
          <button type="button" aria-label="Previous use cases" onClick={() => caseSliderRef.current?.scrollBy({ left: -420, behavior: "smooth" })}><ChevronLeft size={19} /></button>
          <button type="button" aria-label="Next use cases" onClick={() => caseSliderRef.current?.scrollBy({ left: 420, behavior: "smooth" })}><ChevronRight size={19} /></button>
        </div>
      </div>
      <div className="kp-case-grid" ref={caseSliderRef}>
        {[
          ["Families","Protect wallets, keys, bags, phones, documents and other everyday essentials.",Home],
          ["Schools and Colleges","Create an organised lost-and-found system for students, staff and campus belongings.",GraduationCap],
          ["Apartments and Societies","Connect residents, guards, and management through one community recovery network.",Building2],
          ["Offices and Businesses","Manage employee belongings, visitor items, and workplace lost-and-found records.",Users],
          ["Travel and Transport","Support safer item recovery across cabs, stations, hotels and shared journeys.",TrainFront],
        ].map(([title, copy], i) => <article key={String(title)} className={`case-${i}`}><div className="kp-case-image"><Image src="/images/kp-home-lifestyle.png" fill sizes="(max-width: 600px) 78vw, 320px" alt="" /></div><h3>{String(title)}</h3><p>{String(copy)}</p></article>)}
      </div>
    </section>

    <section className="kp-faq kp-container">
      <SectionTitle title="Questions, answered." />
      <div>{faqs.map(([q,a]) => <details key={q}><summary>{q}<ChevronDown size={16} /></summary><p>{a}</p></details>)}</div>
    </section>

    <section className="kp-protection kp-container">
      <div className="kp-protection-visual"><QrCode size={80} /><span>Protected with Khoya Paya</span></div>
      <div><span className="kp-kicker dark">QR item protection</span><h2>Protect the Things<br />That Move with You.</h2><p>Register everyday essentials today and give them a safer path back when they go missing.</p><Link className="kp-button kp-button-dark" href="/signup">Register Your First Item <ArrowUpRight size={14} /></Link></div>
    </section>

    <section className="kp-journal kp-container" id="resources">
      <div className="kp-journal-heading"><SectionTitle title="From the Community." copy="Short, practical reads about safer reporting, useful item details, and thoughtful recovery." /><Link href="/how-it-works">View All Resources <ArrowUpRight size={14} /></Link></div>
      <div className="kp-article-grid">
        {[
          ["What to Do in the First 30 Minutes After Losing Something","/how-it-works"],
          ["How to Create a Lost Item Report People Can Actually Recognise","/lost-items"],
          ["What to Do When You Find Someone’s Wallet","/report-found-item"],
        ].map(([title, href], i) => <article key={title}><Link href={href} className={`kp-article-image crop-${i}`}><Image src="/images/kp-home-lifestyle.png" fill sizes="33vw" alt="" /><span>Recovery guide</span></Link><h3><Link href={href}>{title}</Link></h3><p>A practical checklist to help you reduce risk, protect personal information, and publish a useful report.</p><Link href={href}>Read the Guide <ArrowUpRight size={13} /></Link></article>)}
      </div>
    </section>

    <footer className="kp-home-footer">
      <div className="kp-container kp-footer-grid">
        <div><Link className="kp-wordmark footer-mark" href="/"><span>K</span>Khoya Paya</Link><p>A community-powered platform helping lost belongings find a safer path home.</p><small>Privacy. Contact. Recovery.</small></div>
        {[
          ["Product",[["Community Feed","/lost-items"],["Search Items","/lost-items"],["Nearby Items","/lost-items"],["QR Protection","/dashboard/items"],["Recovery Dashboard","/dashboard"]]],
          ["Report",[["Report Lost Item","/dashboard/items/add"],["Report Found Item","/report-found-item"],["Report Missing Pet","/dashboard/items/add"],["Report Document","/dashboard/items/add"],["Report Vehicle","/dashboard/items/add"]]],
          ["Solutions",[["Individuals","/#solutions"],["Families","/#solutions"],["Schools and Colleges","/#solutions"],["Apartments and Societies","/#solutions"],["Offices and Businesses","/#solutions"],["Travel and Transport","/#solutions"]]],
          ["Resources",[["How It Works","/how-it-works"],["Safety Center","/privacy-policy"],["Help Center","/faq"],["Community Guidelines","/terms-and-conditions"],["Journal","/#resources"]]],
        ].map(([heading, links]) => <nav key={String(heading)} aria-label={`${heading} links`}><strong>{String(heading)}</strong>{(links as string[][]).map(([label,href]) => <Link key={label} href={href}>{label}</Link>)}</nav>)}
      </div>
      <div className="kp-container kp-footer-bottom"><span>© {new Date().getFullYear()} Khoya Paya. All rights reserved.</span><div><Link href="/privacy-policy">Privacy</Link><Link href="/terms-and-conditions">Terms</Link></div></div>
    </footer>
  </main>;
}
