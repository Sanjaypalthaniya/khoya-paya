# Khoya Paya Database Setup

Khoya Paya uses PostgreSQL with Prisma ORM. The UI pages are not connected to auth yet; this setup only prepares the database layer.

## 1. Create a PostgreSQL Database

Use either Supabase Postgres or Neon Postgres.

Supabase:
- Create a project in Supabase.
- Open Project Settings.
- Go to Database.
- Copy the PostgreSQL connection string.

Neon:
- Create a Neon project.
- Create or select a database.
- Copy the pooled or direct PostgreSQL connection string.

## 2. Configure Environment Variables

Copy `.env.example` to `.env`, then replace the placeholder:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Do not commit real credentials.

Optional admin seeding is disabled by default. Set these only when you intentionally want a placeholder admin:

```bash
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD_HASH="your-real-password-hash"
```

## 3. Generate Prisma Client

```bash
npx prisma generate
```

## 4. Run the Initial Migration

```bash
npx prisma migrate dev --name init
```

This creates the PostgreSQL tables for users, items, QR codes, scan logs, finder messages, abuse reports, plans, and subscriptions.

## 5. Seed Default Plans

```bash
npx prisma db seed
```

The seed creates:
- Free
- Premium
- Business

## 6. Test Database Health

Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/api/health/db
```

Expected success response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

If the connection fails, verify:
- `DATABASE_URL` is correct.
- The database is online.
- Your IP/network is allowed by the provider.
- Migrations have been run.
