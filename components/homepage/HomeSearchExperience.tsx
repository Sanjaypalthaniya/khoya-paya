"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, BriefcaseBusiness, Clock3, Flame, HandHeart, HelpCircle,
  History, KeyRound, LoaderCircle, MapPin, PawPrint, QrCode, Search,
  ShieldCheck, Smartphone, Sparkles, Tag, UserRound, WalletCards, X,
} from "lucide-react";

type PostResult = {
  id: string;
  postType: string;
  itemCategory: string;
  title: string;
  description: string;
  publicLocation?: { name?: string | null; city?: string | null; state?: string | null };
  author?: { displayName?: string };
};
type UserResult = { id: string; displayName: string; trustScore: number; verified: boolean; location?: string };
type Suggestion = { type: string; value: string };
type Discovery = { popular: string[]; trending: string[]; locations: string[]; recent: string[] };

const categoryIcons: Record<string, typeof Search> = {
  mobile: Smartphone, phone: Smartphone, wallet: WalletCards, purse: WalletCards,
  keys: KeyRound, pet: PawPrint, bag: BriefcaseBusiness,
};
const fallbackPopular = ["wallet", "mobile phone", "keys", "documents", "missing pet"];
const STORAGE_KEY = "khoya-paya-recent-searches";

function readLocalRecent() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[]; }
  catch { return []; }
}
function saveLocalRecent(query: string) {
  const normalized = query.trim();
  if (!normalized) return;
  const next = [normalized, ...readLocalRecent().filter(item => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 8);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export default function HomeSearchExperience({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [discovery, setDiscovery] = useState<Discovery>({ popular: fallbackPopular, trending: [], locations: [], recent: [] });
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    let active = true;
    const localRecent = readLocalRecent();
    Promise.allSettled([
      fetch("/api/community/search/popular").then(response => response.json()),
      fetch("/api/community/trending/tags").then(response => response.json()),
      fetch("/api/community/trending/locations").then(response => response.json()),
      fetch("/api/community/search/history").then(response => response.ok ? response.json() : null),
    ]).then(results => {
      if (!active) return;
      const value = (index: number) => results[index].status === "fulfilled" ? results[index].value : null;
      const popular = (value(0)?.data ?? []).map((item: { normalizedQuery: string }) => item.normalizedQuery).slice(0, 8);
      const trending = (value(1)?.data ?? []).map((item: { tag: string }) => item.tag).filter(Boolean).slice(0, 8);
      const locations = (value(2)?.data ?? []).map((item: { city?: string; state?: string }) => [item.city, item.state].filter(Boolean).join(", ")).slice(0, 6);
      const privateRecent = (value(3)?.data ?? []).map((item: { query: string }) => item.query);
      setDiscovery({ popular: popular.length ? popular : fallbackPopular, trending, locations, recent: [...new Set([...localRecent, ...privateRecent])].slice(0, 8) });
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const calls: Promise<Response>[] = [fetch(`/api/community/search?q=${encodeURIComponent(normalized)}&limit=12&resultType=ALL&live=true`, { signal: controller.signal, cache: "no-store" })];
        if (normalized.length >= 2) calls.push(fetch(`/api/community/search/suggestions?q=${encodeURIComponent(normalized)}&limit=8`, { signal: controller.signal, cache: "no-store" }));
        const [resultsResponse, suggestionsResponse] = await Promise.all(calls);
        if (!resultsResponse.ok) throw new Error("Search is temporarily unavailable.");
        const resultBody = await resultsResponse.json();
        const suggestionBody = suggestionsResponse ? await suggestionsResponse.json() : null;
        setPosts(resultBody.data?.groups?.POSTS ?? []);
        setUsers(resultBody.data?.groups?.USERS ?? []);
        setSuggestions([...(suggestionBody?.data?.categories ?? []), ...(suggestionBody?.data?.tags ?? []), ...(suggestionBody?.data?.locations ?? [])]);
      } catch (cause) {
        if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : "Search is temporarily unavailable."); setPosts([]); setUsers([]); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const groupedPosts = useMemo(() => ({
    lost: posts.filter(post => ["LOST_ITEM", "MISSING_PET", "LOST_DOCUMENT"].includes(post.postType)),
    found: posts.filter(post => ["FOUND_ITEM", "FOUND_DOCUMENT"].includes(post.postType)),
    help: posts.filter(post => post.postType === "NEED_HELP"),
    other: posts.filter(post => !["LOST_ITEM", "MISSING_PET", "LOST_DOCUMENT", "FOUND_ITEM", "FOUND_DOCUMENT", "NEED_HELP"].includes(post.postType)),
  }), [posts]);
  const categorySuggestions = suggestions.filter(item => item.type === "CATEGORY").slice(0, 5);
  const locationSuggestions = suggestions.filter(item => item.type === "LOCATION").slice(0, 5);
  const hasResults = posts.length + users.length + suggestions.length > 0;
  const qrLike = /^(kp[-\s]?)?[a-z0-9]{4,}$/i.test(query.trim()) || /qr|recovery|code/i.test(query);

  function choose(value: string) { setQuery(value); setOpen(true); saveLocalRecent(value); setDiscovery(current => ({ ...current, recent: [value, ...current.recent.filter(item => item.toLowerCase() !== value.toLowerCase())].slice(0, 8) })); }
  function clearRecent() { localStorage.removeItem(STORAGE_KEY); setDiscovery(current => ({ ...current, recent: [] })); }

  return <div className={`home-search ${compact ? "is-compact" : "is-hero"} ${open ? "is-open" : ""}`} ref={rootRef}>
    {!compact && <div className="home-search-intro"><span className="search-card-icon"><Search size={22}/></span><div><strong>Someone may have already found it.</strong><p>Search reports, people, places or a recovery code.</p></div></div>}
    <div className="home-search-field"><Search size={compact ? 18 : 20}/><label className="visually-hidden" htmlFor={compact ? "header-live-search" : "hero-live-search"}>Search Khoya Paya</label><input id={compact ? "header-live-search" : "hero-live-search"} value={query} onChange={event => { const value=event.target.value; setQuery(value); setOpen(true); if(!value.trim()){setPosts([]);setUsers([]);setSuggestions([]);setLoading(false);setError("");} }} onFocus={() => setOpen(true)} onKeyDown={event => {if(event.key==="Escape")setOpen(false);if(event.key==="Enter"){event.preventDefault();choose(query);}}} placeholder={compact ? "Search items, people or places" : "Try ‘wallet’, ‘iphone’, ‘Pune’ or a recovery code"} autoComplete="off" role="combobox" aria-expanded={open} aria-controls={compact ? "header-search-panel" : "hero-search-panel"}/>{loading ? <LoaderCircle className="search-spinner" size={19}/> : query && <button type="button" aria-label="Clear search" onClick={() => {setQuery("");setPosts([]);setUsers([]);setSuggestions([]);setError("");}}><X size={18}/></button>}</div>
    {!compact && <small className="home-search-privacy"><ShieldCheck size={14}/>Instant results. Private contact details stay hidden.</small>}

    {open && <section className="home-search-panel" id={compact ? "header-search-panel" : "hero-search-panel"} aria-label="Search suggestions and results">
      {!query.trim() ? <div className="search-discovery">
        {discovery.recent.length > 0 && <SearchSection icon={History} title="Recent searches" action={<button type="button" onClick={clearRecent}>Clear</button>}><ChipList values={discovery.recent} onChoose={choose}/></SearchSection>}
        <SearchSection icon={Sparkles} title="Popular searches"><ChipList values={discovery.popular} onChoose={choose}/></SearchSection>
        {discovery.trending.length > 0 && <SearchSection icon={Flame} title="Trending now"><ChipList values={discovery.trending} onChoose={choose}/></SearchSection>}
        {discovery.locations.length > 0 && <SearchSection icon={MapPin} title="Active locations"><ChipList values={discovery.locations} onChoose={choose}/></SearchSection>}
        <div className="search-quick-grid"><button type="button" onClick={() => choose("lost mobile")}><Smartphone size={20}/><span><strong>Lost items</strong><small>Search community reports</small></span></button><button type="button" onClick={() => choose("found wallet")}><HandHeart size={20}/><span><strong>Found items</strong><small>See what people returned</small></span></button><button type="button" onClick={() => choose("recovery code")}><QrCode size={20}/><span><strong>Recovery QR</strong><small>Find a QR recovery route</small></span></button><button type="button" onClick={() => choose("need help")}><HelpCircle size={20}/><span><strong>Need help</strong><small>Find community support</small></span></button></div>
      </div> : <div className="search-live-results" aria-live="polite">
        <div className="search-query-summary"><span>{loading ? "Searching across Khoya Paya…" : `Results for “${query.trim()}”`}</span><kbd>ESC to close</kbd></div>
        {error && <div className="search-state"><Search size={25}/><strong>Search needs a moment</strong><p>{error}</p><button type="button" onClick={() => setQuery(current => `${current} `)}>Try again</button></div>}
        {!error && <>
          {(qrLike || /^(kp[-\s]?)/i.test(query)) && <SearchSection icon={QrCode} title="QR & recovery"><button className="qr-search-suggestion" type="button" onClick={() => choose(query.toUpperCase())}><QrCode size={20}/><span><strong>Use “{query.trim()}” as a recovery code</strong><small>We&apos;ll keep the lookup inside this search experience.</small></span><ArrowRight size={17}/></button></SearchSection>}
          {categorySuggestions.length > 0 && <SearchSection icon={Tag} title="Categories"><SuggestionRows values={categorySuggestions} onChoose={choose}/></SearchSection>}
          {locationSuggestions.length > 0 && <SearchSection icon={MapPin} title="Locations"><SuggestionRows values={locationSuggestions} onChoose={choose}/></SearchSection>}
          {users.length > 0 && <SearchSection icon={UserRound} title="People"><div className="search-user-grid">{users.slice(0,4).map(user => <button type="button" key={user.id} onClick={() => choose(user.displayName)}><span>{user.displayName.slice(0,1).toUpperCase()}</span><div><strong>{user.displayName}</strong><small>{user.verified ? "Verified helper" : "Community member"}{user.location ? ` · ${user.location}` : ""}</small></div></button>)}</div></SearchSection>}
          <PostGroup title="Lost item suggestions" icon={Search} posts={groupedPosts.lost}/>
          <PostGroup title="Found item suggestions" icon={HandHeart} posts={groupedPosts.found}/>
          <PostGroup title="Need help" icon={HelpCircle} posts={groupedPosts.help}/>
          <PostGroup title="More community results" icon={Sparkles} posts={groupedPosts.other}/>
          {!loading && !hasResults && !qrLike && <div className="search-state"><Search size={28}/><strong>No exact match—yet.</strong><p>Try a shorter word, another spelling, a nearby location or a related term such as “mobile” instead of “phone”.</p><div><button type="button" onClick={() => choose("lost item")}>Browse lost items</button><button type="button" onClick={() => choose("need help")}>Ask the community</button></div></div>}
          {loading && !hasResults && <div className="search-skeleton" aria-label="Loading search results"><i/><i/><i/></div>}
        </>}
      </div>}
    </section>}
  </div>;
}

function SearchSection({ icon: Icon, title, action, children }: { icon: typeof Search; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="search-result-section"><header><Icon size={16}/><strong>{title}</strong>{action}</header>{children}</section>;
}
function ChipList({ values, onChoose }: { values: string[]; onChoose: (value: string) => void }) {
  return <div className="search-chips">{values.map(value => <button type="button" key={value} onClick={() => onChoose(value)}><Clock3 size={13}/>{value}</button>)}</div>;
}
function SuggestionRows({ values, onChoose }: { values: Suggestion[]; onChoose: (value: string) => void }) {
  return <div className="suggestion-rows">{values.map(item => { const Icon = categoryIcons[item.value.toLowerCase()] ?? Tag; return <button type="button" key={`${item.type}-${item.value}`} onClick={() => onChoose(item.value)}><Icon size={17}/><span>{item.value}</span><ArrowRight size={15}/></button>; })}</div>;
}
function PostGroup({ title, icon, posts }: { title: string; icon: typeof Search; posts: PostResult[] }) {
  if (!posts.length) return null;
  return <SearchSection icon={icon} title={title}><div className="search-post-grid">{posts.slice(0,6).map(post => <article key={post.id}><span className={`search-post-type ${post.postType.startsWith("FOUND") ? "found" : post.postType === "NEED_HELP" ? "help" : "lost"}`}>{post.postType.replaceAll("_", " ")}</span><strong>{post.title}</strong><p>{post.description}</p><small><MapPin size={13}/>{[post.publicLocation?.name, post.publicLocation?.city, post.publicLocation?.state].filter(Boolean).join(", ") || "Location not shared"}</small></article>)}</div></SearchSection>;
}
