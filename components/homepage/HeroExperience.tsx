"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, CheckCircle2, Heart, HelpCircle, LockKeyhole, MapPin,
  MessageCircle, PackageSearch, QrCode, ScanLine, ShieldCheck, Sparkles,
  Users,
} from "lucide-react";

type ImpactSnapshot = {
  counters: { itemsRecovered?: number; peopleHelped?: number; trustedMembers?: number; verifiedRecoveries?: number; helpRequestsSolved?: number; lostPetsReunited?: number };
  recentRecoveries: Array<{ id: string; title: string; itemCategory: string; city: string | null; state: string | null }>;
  returnedItems: Array<{ id: string; title: string; itemCategory: string; city: string | null; state: string | null }>;
};

export default function HeroExperience({ signedIn = false }: { signedIn?: boolean }) {
  const [impact, setImpact] = useState<ImpactSnapshot | null>(null);
  useEffect(() => { let active=true;fetch("/api/community/impact",{cache:"no-store"}).then(response=>response.ok?response.json():null).then(body=>{if(active&&body?.data)setImpact(body.data)}).catch(()=>undefined);return()=>{active=false}},[]);
  const activities = useMemo(() => {
    const recovery = impact?.recentRecoveries.map(item => `${humanCategory(item.itemCategory)} recovered${place(item)}`) ?? [];
    const returned = impact?.returnedItems.map(item => `${humanCategory(item.itemCategory)} returned${place(item)}`) ?? [];
    const community = [
      impact?.counters.helpRequestsSolved ? `${impact.counters.helpRequestsSolved.toLocaleString("en-IN")} help requests resolved` : null,
      impact?.counters.lostPetsReunited ? `${impact.counters.lostPetsReunited.toLocaleString("en-IN")} lost pets reunited` : null,
      impact?.counters.verifiedRecoveries ? `${impact.counters.verifiedRecoveries.toLocaleString("en-IN")} recoveries verified` : null,
    ].filter((item): item is string => Boolean(item));
    const result=[...recovery,...returned,...community];
    return result.length ? result : ["Your report could be the next success story", "A safe recovery community is ready to help", "Every honest finder can make a difference"];
  }, [impact]);

  return <>
    <section className="world-hero">
      <div className="community-container world-hero-grid">
        <div className="world-hero-copy">
          <span className="world-hero-kicker"><i/><Heart size={15}/>A safer way to bring important things home</span>
          <h1>Recover What Matters.<br/><em>Help Someone Today.</em></h1>
          <p>Losing something important feels personal. Finding it should feel possible. Khoya Paya connects owners, honest finders and caring neighbours—without putting private contact details in public.</p>
          <div className="world-hero-ctas"><Link className="world-primary-cta" href="/signup">Create your recovery account <ArrowRight size={18}/></Link><Link className="world-secondary-cta" href="/how-it-works">See how recovery works</Link></div>
          <div className="world-quick-actions" aria-label="Quick recovery actions"><Link className="quick-scan" href="/recover"><QrCode size={20}/><span><strong>Quick QR Scan</strong><small>Scan or enter a code</small></span></Link><Link className="quick-lost" href={signedIn?"/dashboard/items/add":"/signup"}><PackageSearch size={20}/><span><strong>Lost Report</strong><small>Start searching safely</small></span></Link><Link className="quick-found" href="/report-found-item"><CheckCircle2 size={20}/><span><strong>Found Report</strong><small>Help return an item</small></span></Link><Link className="quick-help" href={signedIn?"/dashboard/community-posts":"/signup"}><HelpCircle size={20}/><span><strong>Need Help</strong><small>Ask the community</small></span></Link></div>
          <div className="world-hero-stats" aria-label="Live community statistics"><Stat value={impact?.counters.itemsRecovered} label="Items recovered"/><Stat value={impact?.counters.peopleHelped} label="People helped"/><Stat value={impact?.counters.trustedMembers} label="Trusted members"/><span className="stats-trust"><ShieldCheck size={16}/>Live platform records</span></div>
        </div>

        <div className="world-hero-art" aria-label="Private QR recovery illustration">
          <div className="art-glow"/>
          <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
          <div className="art-note note-owner"><span>AK</span><div><strong>Owner protected</strong><small>Contact stays private</small></div><LockKeyhole size={17}/></div>
          <div className="art-note note-found"><span><CheckCircle2 size={19}/></span><div><strong>Item found</strong><small>Safe message received</small></div></div>
          <div className="art-note note-community"><Users size={18}/><span><strong>Community powered</strong><small>Real people. Helpful actions.</small></span></div>
          <div className="recovery-device">
            <div className="device-top"><span/><span/><span/></div>
            <div className="device-shield"><ShieldCheck size={22}/></div>
            <span className="device-label">PRIVATE RECOVERY LINK</span>
            <div className="art-qr"><QrCode size={126}/><i><ScanLine size={22}/></i></div>
            <strong>Scan to return safely</strong>
            <p>No phone number shown. No personal data exposed.</p>
            <div className="device-message"><MessageCircle size={16}/><span>Secure message ready</span><Sparkles size={14}/></div>
          </div>
          <div className="art-location"><MapPin size={17}/><span>Recovery route active</span></div>
        </div>
      </div>
    </section>
    <LiveActivityTicker activities={activities}/>
  </>;
}

function Stat({ value, label }: { value?: number; label: string }) { return <div><strong>{typeof value==="number"?value.toLocaleString("en-IN"):"—"}</strong><small>{label}</small></div>; }
function place(item:{city:string|null;state:string|null}){const location=[item.city,item.state].filter(Boolean).join(", ");return location?` in ${location}`:" through the community"}
function humanCategory(value:string){return value.toLowerCase().replaceAll("_"," ").replace(/\b\w/g,letter=>letter.toUpperCase())}
function LiveActivityTicker({activities}:{activities:string[]}){const repeated=[...activities,...activities];return <section className="live-activity" aria-label="Live community activity"><div className="live-label"><i/><span>Live Activity</span></div><div className="live-track-shell"><div className="live-track">{repeated.map((activity,index)=><span key={`${activity}-${index}`}><CheckCircle2 size={15}/>{activity}<b>•</b></span>)}</div></div></section>}
