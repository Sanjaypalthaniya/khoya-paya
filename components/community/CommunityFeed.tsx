"use client";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  LoaderCircle,
  RefreshCw,
  SearchX,
  WifiOff,
} from "lucide-react";
import type { CommunityPost, FeedState, ReactionType } from "@/lib/community/types";
import CommunityPostCard from "./CommunityPostCard";
import CreatePostComposer from "./CreatePostComposer";
const filters = [
  "All",
  "Lost",
  "Found",
  "Latest",
  "Verified",
  "Reward",
  "Success Stories",
  "Missing Pets",
  "Documents",
  "Vehicles",
];
type ApiPost = {
  id: string;
  postType: CommunityPost["type"];
  itemCategory: string;
  title: string;
  description: string;
  status: string;
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  publicLocation: {
    name: string | null;
    city: string | null;
    state: string | null;
  };
  reward: { amount: string | null; currency: string } | null;
  eventDate: string | null;
  media: Array<{
    id: string;
    type: "IMAGE" | "VIDEO";
    url: string;
    altText: string;
    thumbnailUrl?: string | null;
  }>;
  tags: Array<{ displayName: string }>;
  author: {
    id: string;
    displayName: string;
    initials: string;
    verified: boolean;
  };
  counters: { reactions: number; comments: number; views: number };
  allowSharing: boolean;
  viewer: { reaction: ReactionType | null; saved: boolean; isOwner: boolean };
  createdAt: string;
  publishedAt: string | null;
};
function mapPost(post: ApiPost): CommunityPost {
  return {
    id: post.id,
    type: post.postType,
    status:
      post.status === "RECOVERED"
        ? "RECOVERED"
        : post.postType.startsWith("FOUND")
          ? "FOUND"
          : "LOST",
    author: {
      id: post.author.id,
      displayName: post.author.displayName,
      username: post.author.id,
      initials: post.author.initials,
      verified: post.author.verified,
    },
    title: post.title,
    description: post.description,
    location: [
      post.publicLocation.name,
      post.publicLocation.city,
      post.publicLocation.state,
    ]
      .filter(Boolean)
      .join(", "),
    eventDate: post.eventDate ?? undefined,
    createdAt: new Date(post.publishedAt || post.createdAt).toLocaleString(),
    visibility: post.visibility === "PUBLIC" ? "PUBLIC" : "COMMUNITY",
    category: post.itemCategory,
    reward: post.reward?.amount
      ? `${post.reward.currency} ${post.reward.amount}`
      : undefined,
    tags: post.tags.map((t) => t.displayName),
    media: post.media.map((media) => ({
      id: media.id,
      kind: media.type,
      src: media.url,
      alt: media.altText,
      thumbnail: media.thumbnailUrl ?? undefined,
    })),
    reactions: { LIKE: post.counters.reactions },
    viewerReaction: post.viewer.reaction,
    saved: post.viewer.saved,
    isOwner: post.viewer.isOwner,
    allowSharing: post.allowSharing,
    commentCount: post.counters.comments,
    viewCount: post.counters.views,
  };
}
export function queryFor(filter: string, cursor?: string | null, search?: string) {
  const params = new URLSearchParams({ limit: "6" });
  if (cursor) params.set("cursor", cursor);
  if (filter === "Lost") params.set("type", "LOST_ITEM");
  if (filter === "Found") params.set("type", "FOUND_ITEM");
  if (filter === "Verified") params.set("verifiedOnly", "true");
  if (filter === "Reward") params.set("rewardOnly", "true");
  if (filter === "Success Stories") params.set("type", "SUCCESS_STORY");
  if (filter === "Missing Pets") params.set("type", "MISSING_PET");
  if (filter === "Documents") params.set("category", "DOCUMENTS");
  if (filter === "Vehicles") params.set("category", "VEHICLE");
  if (search?.trim()) params.set("search", search.trim());
  if (filter === "Latest") params.set("sort", "LATEST");
  return params;
}
export default function CommunityFeed({
  initials = "U",
  initialSearch = "",
}: {
  initials?: string;
  initialSearch?: string;
}) {
  const [state, setState] = useState<FeedState>("INITIAL_LOADING");
  const [filter, setFilter] = useState("All");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [loadingMore, setLoadingMore] = useState(false);
  const load = useCallback(
    async (reset: boolean, selected: string, cursor: string | null = null) => {
      if (reset) setState(current => current === "INITIAL_LOADING" ? "INITIAL_LOADING" : "REFRESHING");
      else setLoadingMore(true);
      setError("");
      try {
        const response = await fetch(
          `/api/community/feed?${queryFor(selected, reset ? null : cursor, appliedSearch)}`,
          { cache: "no-store" },
        );
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.message || "Unable to load the feed.");
        const incoming = (body.data.items as ApiPost[]).map(mapPost);
        setPosts((current) => reset
          ? incoming
          : [...new Map([...current, ...incoming].map((post) => [post.id, post])).values()]);
        setNextCursor(body.data.nextCursor);
        setHasMore(body.data.hasMore);
        setState(
          incoming.length || !reset
            ? body.data.hasMore
              ? "LOADED"
              : "END"
            : "EMPTY",
        );
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "Unable to load the feed.",
        );
        setState(navigator.onLine ? "ERROR" : "OFFLINE");
      } finally {
        setLoadingMore(false);
      }
    },
    [appliedSearch],
  );
  useEffect(() => {
    const task = window.setTimeout(() => void load(true, filter), 0);
    return () => window.clearTimeout(task);
  }, [filter, load]);
  return (
    <div
      className="community-feed-v2"
      aria-busy={state === "INITIAL_LOADING" || state === "REFRESHING"}
    >
      <CreatePostComposer
        initials={initials}
        onSaved={(published) => {
          if (!published) return;
          if (filter === "All") void load(true, "All");
          else setFilter("All");
        }}
      />
      <div className="feed-filter-shell">
        <form
          className="feed-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            const url = search.trim() ? `/community?q=${encodeURIComponent(search.trim())}` : "/community";
            window.history.pushState(null, "", url);
            setAppliedSearch(search.trim());
          }}
        >
          <label htmlFor="community-feed-search">Search community posts</label>
          <input id="community-feed-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
          <button type="submit">Search</button>
          {search && <button type="button" onClick={() => { setSearch(""); setAppliedSearch(""); window.history.pushState(null, "", "/community"); }}>Clear</button>}
        </form>
        <div
          className="feed-filters"
          role="tablist"
          aria-label="Community feed filters"
        >
          {filters.map((item) => (
            <button
              role="tab"
              aria-selected={filter === item}
              className={filter === item ? "active" : ""}
              type="button"
              key={item}
              onClick={() => {
                setFilter(item);
                setState("FILTERED");
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="feed-intro">
        <div>
          <span>Community feed</span>
          <h2>{filter === "All" ? "Latest around you" : filter}</h2>
        </div>
        <button type="button" onClick={() => load(true, filter)} disabled={state === "REFRESHING"}>
          <RefreshCw className={state === "REFRESHING" ? "spin" : ""} size={15} />
          {state === "REFRESHING" ? "Updating…" : "Refresh"}
        </button>
      </div>
      {state === "REFRESHING" && posts.length > 0 ? <div className="feed-refresh-status" role="status"><LoaderCircle className="spin" size={17} /><span><strong>Updating your feed</strong><small>Keeping your current posts visible while we check for new ones.</small></span></div> : null}
      {(state === "INITIAL_LOADING" || (state === "REFRESHING" && posts.length === 0)) && (
        <div
          className="feed-skeleton"
          role="status"
          aria-label="Loading community posts"
        >
          <div className="feed-skeleton-head"><span /><div><i /><i /></div></div>
          <div className="feed-skeleton-line wide" />
          <div className="feed-skeleton-line" />
          <div className="feed-skeleton-media"><LoaderCircle className="spin" /><span>Loading nearby posts…</span></div>
        </div>
      )}
      {state === "ERROR" && (
        <div className="feed-state">
          <AlertTriangle />
          <strong>{error}</strong>
          <button type="button" onClick={() => load(true, filter)}>Retry</button>
        </div>
      )}
      {state === "OFFLINE" && (
        <div className="feed-state">
          <WifiOff />
          <strong>You&apos;re offline</strong>
          <button type="button" onClick={() => load(true, filter)}>Retry</button>
        </div>
      )}
      {state === "EMPTY" && (
        <div className="feed-state">
          <SearchX />
          <strong>No posts match this filter</strong>
          <span>Publish the first privacy-safe community post.</span>
        </div>
      )}
      {!["INITIAL_LOADING", "ERROR", "OFFLINE"].includes(state) &&
        posts.map((post) => <CommunityPostCard post={post} key={post.id} />)}
      {hasMore ? (
        <button
          className="load-more"
          type="button"
          onClick={() => load(false, filter, nextCursor)}
          disabled={loadingMore}
        >
          {loadingMore ? "Loading more…" : "Load more posts"}
        </button>
      ) : (
        posts.length > 0 && (
          <div className="community-card end-feed">
            <strong>You&apos;re all caught up</strong>
            <p>New community posts will appear here.</p>
          </div>
        )
      )}
    </div>
  );
}
