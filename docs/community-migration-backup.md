# Community migration backup procedure

Before applying `20260715090000_community_posts_foundation` to a shared or production PostgreSQL database:

1. Confirm the deployment target and `DATABASE_URL` point to the intended database.
2. Create a provider snapshot or run `pg_dump --format=custom --no-owner --file=khoya-paya-before-community.dump "$DATABASE_URL"` from an authorized environment.
3. Verify the backup file is non-empty and record its encrypted storage location and timestamp.
4. Inspect `prisma/migrations/20260715090000_community_posts_foundation/migration.sql`.
5. Apply with the normal deployment migration command only after the backup is confirmed.

The migration is additive: it creates new enums, tables, indexes, and foreign keys. It does not drop, rename, or alter existing columns or data.
