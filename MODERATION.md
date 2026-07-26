# Content moderation

All posts and comments pass deterministic local text rules before publication. Rules cover prohibited sexual/dangerous trade content, threats, harassment, scams, promotional spam, suspicious links, emoji/character abuse, relevance, exact duplicate content, mass posting, and trust-based low-risk review. Decisions are `APPROVED`, `UNDER_REVIEW`, or `REJECTED` and are recorded in `ModerationCase`.

Media uses `MediaModerationProvider`. Configure `MODERATION_MEDIA_ENDPOINT` and optional bearer token for a self-hosted open-source service. The service receives media type, secure media URL, alt text, selected category, and a SHA-256 content hash. It must return a decision, score, reason, user-safe message, signals, optional detected labels, and `categoryMatch`. Invalid responses/timeouts fail closed to manual review. Pending/rejected media never enters public DTOs.

Recommended self-hosted stack: NudeNet/OpenNSFW for nudity, CLIP or SigLIP zero-shot labels for relevance/category, image hashing for duplicates, and sampled video frames through the same image pipeline. Extract frames in the moderation worker—not the Vercel request—and scan the opening frame plus scene-change/key frames with a strict maximum. Speech transcription is optional and its text must pass the same text rules.

Three or more reports by trusted users auto-hide content. Admin decisions remain audited and may approve, reject, restore, hide, warn, or suspend according to existing permissions. Do not expose model prompts, thresholds, provider tokens, private coordinates, claim evidence, or internal signals through public APIs.
