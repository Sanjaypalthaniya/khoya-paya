# Deployment Commands

## Local

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Production

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run build
```

## Vercel

1. Add environment variables.
2. Deploy from GitHub.
3. Check install/build logs.
4. Run production migration against the production database.
5. Run production seed.
