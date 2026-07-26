"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bookmark,
  ChevronDown,
  Copy,
  Flag,
  Heart,
  HeartHandshake,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  PartyPopper,
  Send,
  Share2,
  ShieldAlert,
  Smile,
  UserX,
} from "lucide-react";
import type { CommunityPost, ReactionType } from "@/lib/community/types";
import TrustBadge from "./TrustBadge";
import ReportModal from "./ReportModal";
import ClaimModal from "@/components/claims/ClaimModal";

const typeLabels: Record<CommunityPost["type"], string> = {
  LOST_ITEM: "Lost item",
  FOUND_ITEM: "Found item",
  MISSING_PET: "Missing pet",
  LOST_DOCUMENT: "Lost document",
  FOUND_DOCUMENT: "Found document",
  VEHICLE: "Vehicle",
  NEED_HELP: "Need help",
  RECOVERED_ITEM: "Recovered item",
  SUCCESS_STORY: "Success story",
  COMMUNITY_UPDATE: "Community update",
};
const reactions: Array<[ReactionType, string, typeof Heart]> = [
  ["LIKE", "Like", Heart],
  ["HELPFUL", "Helpful", HeartHandshake],
  ["HOPE", "Hope", Smile],
  ["FOUND_IT", "Found it", MapPin],
  ["CELEBRATE", "Celebrate", PartyPopper],
];
type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
};

export default function CommunityPostCard({ post }: { post: CommunityPost }) {
  const [saved, setSaved] = useState(Boolean(post.saved));
  const [expanded, setExpanded] = useState(false);
  const [reaction, setReaction] = useState<ReactionType | null>(post.viewerReaction ?? null);
  const [reactionCount, setReactionCount] = useState(
    Object.values(post.reactions).reduce((total, value) => total + (value || 0), 0),
  );
  const [reactionBusy, setReactionBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [commentText, setCommentText] = useState("");
  const [commentSort, setCommentSort] = useState<"oldest" | "newest">("oldest");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [reportTarget, setReportTarget] = useState<{
    type: "POST" | "COMMENT" | "USER";
    id: string;
  } | null>(null);
  const [reportNotice, setReportNotice] = useState("");
  const [claimOpen, setClaimOpen] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (menuRef.current?.open && !menuRef.current.contains(event.target as Node)) menuRef.current.open = false;
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && menuRef.current?.open) {
        menuRef.current.open = false;
        menuRef.current.querySelector<HTMLElement>("summary")?.focus();
      }
    }
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function updateReaction(next: ReactionType) {
    if (reactionBusy) return;
    const previous = reaction, previousCount = reactionCount;
    const removing = previous === next;
    setReactionBusy(true);
    setActionNotice("");
    setReaction(removing ? null : next);
    setReactionCount(Math.max(0, previousCount + (previous ? (removing ? -1 : 0) : 1)));
    try {
      const response = await fetch(`/api/community/posts/${post.id}/reaction`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactionType: next }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(response.status === 401 ? "Please log in to continue." : body.message || "Couldn’t update your reaction. Try again.");
      setReaction(body.data.reactionType);
    } catch (error) {
      setReaction(previous); setReactionCount(previousCount);
      setActionNotice(error instanceof Error ? error.message : "Couldn’t update your reaction. Try again.");
    } finally { setReactionBusy(false); }
  }

  async function updateSaved() {
    if (saveBusy) return;
    const previous = saved;
    setSaveBusy(true); setActionNotice(""); setSaved(!previous);
    try {
      const response = await fetch(`/api/community/posts/${post.id}/save`, { method: "PUT" });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(response.status === 401 ? "Please log in to continue." : body.message || "Couldn’t save this post. Try again.");
      setSaved(Boolean(body.data.saved));
    } catch (error) {
      setSaved(previous);
      setActionNotice(error instanceof Error ? error.message : "Couldn’t save this post. Try again.");
    } finally { setSaveBusy(false); }
  }

  const publicPostUrl = () => new URL(`/community/posts/${post.id}`, window.location.origin).toString();
  async function copyLink() {
    try { await navigator.clipboard.writeText(publicPostUrl()); setActionNotice("Post link copied."); }
    catch { window.prompt("Copy this post link:", publicPostUrl()); }
  }
  async function sharePost() {
    if (post.allowSharing === false) { setActionNotice("Sharing is disabled for this post."); return; }
    try {
      if (navigator.share) await navigator.share({ title: post.title, url: publicPostUrl() });
      else await copyLink();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setActionNotice("Couldn’t share this post. Copy the link instead.");
    }
  }

  async function openComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (!next || comments.length) return;
    setCommentsLoading(true);
    setCommentError("");
    try {
      const response = await fetch(`/api/community/posts/${post.id}/comments`, {
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok || !body.success)
        throw new Error(body.message || "Unable to load comments.");
      setComments(body.data);
    } catch (error) {
      setCommentError(
        error instanceof Error ? error.message : "Unable to load comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = commentText.trim();
    if (!content || commentSubmitting) return;
    setCommentSubmitting(true);
    setCommentError("");
    try {
      const response = await fetch(`/api/community/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const body = await response.json();
      if (!response.ok || !body.success)
        throw new Error(
          response.status === 401
            ? "Please log in to comment."
            : body.message || "Unable to post comment.",
        );
      setComments((current) => [
        ...current,
        { ...body.data, author: { id: "me", name: "You" } },
      ]);
      setCommentCount((value) => value + 1);
      setCommentText("");
    } catch (error) {
      setCommentError(
        error instanceof Error ? error.message : "Unable to post comment.",
      );
    } finally {
      setCommentSubmitting(false);
    }
  }

  const visibleComments = [...comments].sort((a, b) => {
    const difference = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return commentSort === "oldest" ? difference : -difference;
  });

  return (
    <article className="community-card community-post-card">
      <header className="post-header">
        <span className="post-avatar" aria-hidden="true">{post.author.initials}</span>
        <div>
          <strong>
            {post.author.displayName}
            {post.author.verified && (
              <TrustBadge type="VERIFIED_USER" compact />
            )}
          </strong>
          <small>
            @{post.author.username} · {post.createdAt} ·{" "}
            {post.visibility.toLowerCase()}
          </small>
        </div>
        <details className="post-more" ref={menuRef}>
          <summary aria-label="Post safety and sharing menu">
            <MoreHorizontal size={20} />
          </summary>
          <div>
            <button type="button" onClick={() => { menuRef.current!.open = false; void copyLink(); }}>
              <Copy size={15} />
              Copy link
            </button>
            <button
              type="button"
              onClick={() => { menuRef.current!.open = false; setReportTarget({ type: "POST", id: post.id }); }}
            >
              <Flag size={15} />
              Report post
            </button>
            <button
              type="button"
              onClick={() => { menuRef.current!.open = false; setReportTarget({ type: "USER", id: post.author.id }); }}
            >
              <UserX size={15} />
              Report user
            </button>
          </div>
        </details>
      </header>
      <div className="post-body">
        <div className="post-badges">
          <span className={`status-chip ${post.status.toLowerCase()}`}>
            {post.status.replaceAll("_", " ")}
          </span>
          <span>{typeLabels[post.type]}</span>
          {post.author.badges?.slice(0, 1).map((badge) => (
            <TrustBadge key={badge} type={badge} />
          ))}
        </div>
        <h2><Link href={`/community/posts/${post.id}`}>{post.title}</Link></h2>
        <p>
          {expanded || post.description.length < 150
            ? post.description
            : `${post.description.slice(0, 150)}…`}{" "}
          {post.description.length >= 150 && (
            <button
              className="read-more"
              type="button"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </p>
        <div className="post-facts">
          {post.location && (
            <span>
              <MapPin size={14} />
              {post.location}
            </span>
          )}
          <span>{post.category}</span>
          {post.reward && <span className="reward">{post.reward}</span>}
        </div>
        <div className="post-tags">
          {post.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
      {post.media.length > 0 && (
        <div className="post-media" aria-label="Post media">
          {post.media.map((media) => media.kind === "IMAGE" ? (
            <Link key={media.id} href={`/community/posts/${post.id}`}>
              <Image src={media.src} alt={media.alt} width={900} height={675} unoptimized />
            </Link>
          ) : (
            <video key={media.id} controls preload="metadata" poster={media.thumbnail}>
              <source src={media.src} />
            </video>
          ))}
        </div>
      )}
      <div className="post-metrics">
        <span>
          {reactionCount} reactions
        </span>
        <span>
          {commentCount} comments · {post.viewCount} views
        </span>
      </div>
      <div className="post-actions">
        <details className="reaction-picker">
          <summary className={reaction ? "selected" : ""}>
            <Heart size={18} />
            {reaction
              ? reactions.find((item) => item[0] === reaction)?.[1]
              : "React"}
          </summary>
          <div>
            {reactions.map(([value, label, Icon]) => (
              <button
                type="button"
                key={value}
                onClick={() => void updateReaction(value)}
                disabled={reactionBusy}
                aria-pressed={reaction === value}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        </details>
        <button type="button" aria-expanded={commentsOpen} onClick={() => { void openComments(); window.setTimeout(() => commentInputRef.current?.focus(), 0); }}>
          <MessageCircle size={18} />
          Comment
        </button>
        <button
          type="button"
          onClick={() => void sharePost()}
        >
          <Share2 size={18} />
          Share
        </button>
        <button
          type="button"
          className={saved ? "selected" : ""}
          onClick={() => void updateSaved()}
          disabled={saveBusy}
          aria-pressed={saved}
        >
          <Bookmark size={18} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="post-primary-actions">
        <button type="button" onClick={() => setClaimOpen(true)}>
          {post.type.startsWith("FOUND")
            ? "This May Be My Item"
            : "I Found This Item"}
        </button>
        <Link className="helpful-info-link" href={`/community/posts/${post.id}`}>
          <Send size={16} />
          View details to help
        </Link>
      </div>
      {claimOpen && (
        <ClaimModal
          postId={post.id}
          postType={post.type}
          onClose={() => setClaimOpen(false)}
        />
      )}
      {commentsOpen && (
        <section className="comments-panel" aria-label="Comments">
          <div className="comment-sort">
            <strong>Comments</strong>
            <label>
              <span className="visually-hidden">Sort comments</span>
              <select value={commentSort} onChange={(event) => setCommentSort(event.target.value as "oldest" | "newest")}>
                <option value="oldest">Oldest first</option>
                <option value="newest">Newest first</option>
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </label>
          </div>
          <form onSubmit={submitComment}>
            <label className="visually-hidden" htmlFor={`comment-${post.id}`}>
              Add a comment
            </label>
            <input
              id={`comment-${post.id}`}
              ref={commentInputRef}
              value={commentText}
              maxLength={2000}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Add a helpful comment…"
            />
            <button
              type="submit"
              disabled={commentSubmitting || !commentText.trim()}
              aria-label="Post comment"
            >
              <Send size={17} />
            </button>
          </form>
          {commentError && (
            <p className="comment-error" role="alert">
              {commentError}
            </p>
          )}
          {commentsLoading ? (
            <div className="comment-empty">
              <span>Loading comments…</span>
            </div>
          ) : comments.length ? (
            <div className="comment-list">
              {visibleComments.map((comment) => (
                <article key={comment.id}>
                  <span>{comment.author.name.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{comment.author.name}</strong>
                    <small>
                      {new Date(comment.createdAt).toLocaleString()}
                    </small>
                    <p>{comment.content}</p>
                    <button
                      className="comment-report-button"
                      type="button"
                      onClick={() => setReportTarget({ type: "COMMENT", id: comment.id })}
                    >
                      <Flag size={13} /> Report
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="comment-empty">
              <MessageCircle size={22} />
              <span>No comments yet</span>
              <small>Start a helpful, privacy-safe conversation.</small>
            </div>
          )}
        </section>
      )}
      {reportNotice && <p role="status">{reportNotice}</p>}
      {actionNotice && <p className="post-action-notice" role={actionNotice.includes("Couldn’t") || actionNotice.includes("log in") ? "alert" : "status"}>{actionNotice}</p>}
      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
          onSuccess={() =>
            setReportNotice("Report submitted for confidential review.")
          }
        />
      )}
      <footer className="post-safety">
        <ShieldAlert size={14} />
        Never pay before verification. Meet in a public place and keep sensitive
        details private.
      </footer>
    </article>
  );
}
