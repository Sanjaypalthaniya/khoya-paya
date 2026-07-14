# Community backend requirements

Phase 2 Part 1 connects posts, drafts, tags, media, owner management, and the public feed to PostgreSQL. Development fixtures remain isolated and are not imported by the runtime feed.

The current rate limiter is the project’s existing bounded in-memory implementation. It protects development and single-instance deployments, but a shared Redis/provider-backed limiter is required before horizontally scaled production deployment.

Production modules still required in later parts:

- Community post, media, comment, reaction, save, follow, report, block, profile, badge, and leaderboard models.
- Cursor-based feed and search APIs with privacy-aware visibility and moderation filters.
- Draft publishing, signed media upload, processing status, retry, ordering, and deletion APIs.
- Comment threading with a bounded display depth, mentions, moderation, and ownership permissions.
- Save, share analytics, confidential reports, hide, and block endpoints.
- Public profile privacy controls, trust-event history, and badge-award provenance.
- Community notification types and deep links connected to existing notification infrastructure.
- Lost/found post detail routes connected to the existing claim and question-based verification flows.
- Abuse prevention: rate limits, media scanning, spam detection, audit logs, and administrator queues.

Until those contracts exist, publishing and persistence controls remain visibly disabled and no fixture is imported into production business logic.
