"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Award, CheckCircle2, ChevronRight, HeartHandshake, HelpCircle, Medal,
  PawPrint, RefreshCw, ShieldCheck, Sparkles, Trophy, UserCheck, Users,
} from "lucide-react";

type ImpactData = {
  counters: Record<string, number>;
  heroes: Array<{ rank: number; score: number; id: string; name: string; initials: string; trustScore: number; location: string; badge: string | null }>;
  recentRecoveries: Array<{ id: string; title: string; itemCategory: string; city: string | null; state: string | null; recoveredAt: string | null; author: { name: string }; image: string | null; imageAlt: string }>;
  returnedItems: Array<{ id: string; title: string; itemCategory: string; city: string | null; state: string | null; recoveredAt: string | null; updatedAt: string }>;
  achievements: Array<{ code: string; name: string; description: string; target: number; completedCount: number }>;
  updatedAt: string;
};

const metrics = [
  ["itemsRecovered", "Items Recovered", CheckCircle2], ["peopleHelped", "People Helped", Users],
  ["helpRequestsSolved", "Help Requests Solved", HelpCircle], ["verifiedRecoveries", "Verified Recoveries", ShieldCheck],
  ["communityHeroes", "Community Heroes", Trophy], ["trustedMembers", "Trusted Members", UserCheck],
  ["bloodRequestsCompleted", "Blood Requests Completed", HeartHandshake], ["lostPetsReunited", "Lost Pets Reunited", PawPrint],
  ["communityPosts", "Community Posts", Sparkles], ["successStories", "Success Stories", Award],
] as const;

export default function CommunityImpact() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const response = await fetch("/api/community/impact", { cache: "no-store" });
      if (!response.ok) throw new Error("Impact unavailable");
      const body = await response.json();
      setData(body.data); setError(false);
    } catch { setError(true); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const response = await fetch("/api/community/impact", { cache: "no-store" });
        if (!response.ok) throw new Error("Impact unavailable");
        const body = await response.json();
        if (active) { setData(body.data); setError(false); }
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  return <section className="community-impact" aria-labelledby="impact-title">
    <div className="community-container">
      <header className="impact-heading"><div><span><HeartHandshake size={16}/>Community impact, updated live</span><h2 id="impact-title">Trust you can see.<br/><em>Kindness you can measure.</em></h2><p>Every number represents a real action recorded on Khoya Paya—from a helpful post to a verified return.</p></div><div className="impact-live"><i/><span>{data ? `Updated ${relativeTime(data.updatedAt)}` : "Connecting to the community"}</span><button type="button" aria-label="Refresh community impact" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "spin" : ""} size={16}/></button></div></header>

      {loading && !data ? <ImpactSkeleton/> : error && !data ? <div className="impact-unavailable"><ShieldCheck size={30}/><strong>Community impact will be back shortly.</strong><p>The recovery experience remains available while live totals reconnect.</p><button type="button" onClick={() => void load()}>Try again</button></div> : data && <>
        <div className="impact-metrics">{metrics.map(([key,label,Icon],index)=><MetricCard key={key} value={data.counters[key] ?? 0} label={label} icon={Icon} delay={index * 35}/>)}</div>

        <div className="impact-feature-grid">
          <article className="impact-panel heroes-panel"><div className="impact-panel-heading"><div><span>Today&apos;s heroes</span><h3>People turning care into action</h3></div><Trophy size={25}/></div>{data.heroes.length ? <div className="hero-podium">{data.heroes.slice(0,3).map(hero=><div className={`hero-rank rank-${hero.rank}`} key={hero.id}><span className="hero-medal">{hero.rank===1?<Trophy size={18}/>:<Medal size={18}/>}</span><strong className="impact-avatar">{hero.initials}</strong><b>{hero.name}</b><small>{hero.badge || `${hero.trustScore} trust score`}</small><em>#{hero.rank}</em></div>)}</div> : <EmptyMini copy="The first community hero is waiting to be recognised."/>}</article>

          <article className="impact-panel helpers-panel"><div className="impact-panel-heading"><div><span>Top helpers</span><h3>Trusted community contributors</h3></div><UserCheck size={25}/></div>{data.heroes.length ? <ol>{data.heroes.map(hero=><li key={hero.id}><span>{hero.rank}</span><strong className="impact-avatar small">{hero.initials}</strong><div><b>{hero.name}</b><small>{hero.location || "Khoya Paya community"}</small></div><em>{hero.score} pts</em></li>)}</ol> : <EmptyMini copy="Helpful actions will appear here as the community grows."/>}</article>
        </div>

        <div className="impact-panel recovery-panel"><div className="impact-panel-heading"><div><span>Recent recoveries</span><h3>Important things finding their way home</h3></div><CheckCircle2 size={25}/></div>{data.recentRecoveries.length ? <div className="recovery-card-row">{data.recentRecoveries.map(item=><article key={item.id}>{item.image ? <Image src={item.image} alt={item.imageAlt} width={480} height={270} unoptimized/> : <div className="recovery-visual"><CheckCircle2 size={30}/></div>}<div><span>{item.itemCategory.replaceAll("_"," ")}</span><strong>{item.title}</strong><small>{[item.city,item.state].filter(Boolean).join(", ") || "Returned through the community"}</small><p><ShieldCheck size={13}/>Recovery recorded {relativeTime(item.recoveredAt)}</p></div></article>)}</div> : <EmptyMini copy="Verified public recoveries will appear here without exposing private details."/>}</div>

        <div className="impact-bottom-grid">
          <article className="impact-panel returned-panel"><div className="impact-panel-heading"><div><span>Recently returned items</span><h3>Fresh reasons to believe</h3></div><ChevronRight size={22}/></div>{data.returnedItems.length ? <ul>{data.returnedItems.map(item=><li key={item.id}><span><CheckCircle2 size={16}/></span><div><strong>{item.title}</strong><small>{item.itemCategory.replaceAll("_"," ")} · {[item.city,item.state].filter(Boolean).join(", ") || "Community return"}</small></div><time>{relativeTime(item.recoveredAt || item.updatedAt)}</time></li>)}</ul> : <EmptyMini copy="Recently returned public items will be shown here."/>}</article>

          <article className="impact-panel achievement-panel"><div className="impact-panel-heading"><div><span>Community achievements</span><h3>Progress worth celebrating</h3></div><Award size={25}/></div>{data.achievements.length ? <div className="achievement-list">{data.achievements.map(item=><div key={item.code}><span><Award size={18}/></span><div><strong>{item.name}</strong><small>{item.description}</small><i><b style={{width:`${Math.min(100,item.completedCount?100:(item.target>0?12:0))}%`}}/></i></div><em>{item.completedCount} earned</em></div>)}</div> : <EmptyMini copy="Community achievements will unlock as helpful actions grow."/>}</article>
        </div>
      </>}
    </div>
  </section>;
}

function MetricCard({ value, label, icon: Icon, delay }: { value: number; label: string; icon: typeof Users; delay: number }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => { const node=ref.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)return;const start=performance.now();const duration=900;const tick=(now:number)=>{const progress=Math.min(1,(now-start)/duration);setShown(Math.round(value*(1-Math.pow(1-progress,3))));if(progress<1)requestAnimationFrame(tick)};window.setTimeout(()=>requestAnimationFrame(tick),delay);observer.disconnect()},{threshold:.35});observer.observe(node);return()=>observer.disconnect()},[value,delay]);
  return <article ref={ref} className="impact-metric"><span><Icon size={20}/></span><strong>{shown.toLocaleString("en-IN")}</strong><small>{label}</small></article>;
}
function relativeTime(value?: string | null) { if(!value)return "recently";const seconds=Math.max(1,Math.floor((Date.now()-new Date(value).getTime())/1000));if(seconds<60)return "just now";const minutes=Math.floor(seconds/60);if(minutes<60)return `${minutes}m ago`;const hours=Math.floor(minutes/60);if(hours<24)return `${hours}h ago`;const days=Math.floor(hours/24);return days<30?`${days}d ago`:new Date(value).toLocaleDateString("en-IN",{day:"numeric",month:"short"}); }
function EmptyMini({ copy }: { copy: string }) { return <div className="impact-empty"><Sparkles size={22}/><p>{copy}</p></div>; }
function ImpactSkeleton(){return <div className="impact-skeleton" aria-label="Loading community impact">{Array.from({length:10},(_,index)=><i key={index}/>)}</div>}
