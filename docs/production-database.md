# Production Database

Khoya Paya uses PostgreSQL through Prisma. Production should use a managed database such as Supabase Postgres or Neon Postgres.

## Supabase

1. Create a Supabase project.
2. Open Project Settings > Database.
3. Copy the pooled or direct PostgreSQL connection string.
4. Replace password and database values if Supabase shows placeholders.
5. Add it to Vercel as `DATABASE_URL`.

## Neon

1. Create a Neon project.
2. Create a production branch/database.
3. Copy the PostgreSQL connection string.
4. Add it to Vercel as `DATABASE_URL`.

## Vercel Environment Variable

Set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

Never commit production database URLs.

## Production Migration

Use deploy migrations in production, not `migrate dev`.

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

## Verify Connection

After deployment, open:

```text
https://your-domain.com/api/health/db
```

Expected response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

The health endpoint does not expose database URL, username, host, or error details.
