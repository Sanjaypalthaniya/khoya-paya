-- Publish approved text immediately while unapproved media remains hidden.
UPDATE "CommunityPost" AS post
SET "status" = 'PUBLISHED',
    "moderationStatus" = 'APPROVED',
    "publishedAt" = COALESCE(post."publishedAt", post."createdAt"),
    "moderationReason" = 'Post published. Unapproved media remains hidden.'
WHERE post."status" = 'DRAFT'
  AND post."visibility" = 'PUBLIC'
  AND post."deletedAt" IS NULL
  AND length(trim(post."title")) > 0
  AND length(trim(post."description")) > 0
  AND EXISTS (
    SELECT 1 FROM "ModerationCase" AS moderation
    WHERE moderation."targetType" = 'POST'
      AND moderation."targetId" = post."id"
      AND moderation."decision" = 'APPROVED'
      AND NOT EXISTS (
        SELECT 1 FROM "ModerationCase" AS newer
        WHERE newer."targetType" = moderation."targetType"
          AND newer."targetId" = moderation."targetId"
          AND newer."createdAt" > moderation."createdAt"
      )
  );
