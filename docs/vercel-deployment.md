# Vercel Deployment

## 1. Push to GitHub

```bash
git add .
git commit -m "Prepare production deployment"
git push
```

## 2. Import in Vercel

1. Open Vercel dashboard.
2. Click Add New > Project.
3. Import the GitHub repository.
4. Select Framework Preset: Next.js.
5. Keep build command: `npm run build`.

## 3. Add Environment Variables

Add all required values from `docs/env-variables.md`.

Minimum required:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- Cloudinary variables
- SMTP variables
- Razorpay variables if payments are enabled

## 4. Deploy

Click Deploy and check build logs.

`postinstall` runs `prisma generate`, so Prisma Client is generated during Vercel install.

## 5. Run Production Migration

From a trusted machine or Vercel CLI environment:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## 6. Test Live Site

1. Open homepage.
2. Signup/login.
3. Add item and generate QR.
4. Submit finder message.
5. Verify notifications/email.
6. Test payment flow.
7. Test admin access.
