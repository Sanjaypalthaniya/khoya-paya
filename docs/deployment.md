# Khoya Paya Deployment Guide

## 1. Push to GitHub

1. Review local changes.
2. Commit production-ready code.
3. Push the branch to GitHub.

## 2. Vercel Deployment

1. Import the GitHub repository in Vercel.
2. Set framework preset to Next.js.
3. Set build command: `npm run build`.
4. Set install command: `npm install`.

## 3. Production Database

Use a managed PostgreSQL provider such as Neon, Supabase, Railway, or Render.

Set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public"
```

Run migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

Seed plans/admin:

```bash
npx prisma db seed
```

## 4. Required Environment Variables

Core:

```env
DATABASE_URL=""
JWT_SECRET=""
NEXT_PUBLIC_APP_URL=""
```

Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

Email:

```env
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

Razorpay:

```env
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
RAZORPAY_WEBHOOK_SECRET=""
```

Optional alerts:

```env
WHATSAPP_PROVIDER="twilio"
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_FROM=""
SMS_PROVIDER="twilio"
TWILIO_SMS_FROM=""
```

Seed admin:

```env
SEED_ADMIN_EMAIL=""
SEED_ADMIN_PASSWORD=""
```

## 5. Cloudinary Setup

1. Create Cloudinary account.
2. Copy cloud name, API key, API secret.
3. Keep API secret server-side only.
4. Test dashboard item image upload and finder photo upload.

## 6. SMTP Setup

Use Gmail app password, Resend SMTP, SendGrid SMTP, or another SMTP provider.

Test:

1. Submit finder message.
2. Confirm owner receives email.
3. Confirm finder message still saves if SMTP is unavailable.

## 7. Razorpay Setup

1. Use Razorpay test mode first.
2. Add key id and key secret to Vercel env.
3. Configure webhook URL:

```text
https://YOUR_DOMAIN/api/webhooks/razorpay
```

4. Add webhook secret to `RAZORPAY_WEBHOOK_SECRET`.
5. Test order creation, payment verification, subscription update, and payment history.

## 8. Domain Setup

1. Add production domain in Vercel.
2. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain.
3. Confirm sitemap and robots output use the production domain.

## 9. Post-Deployment Smoke Test

1. Signup/login.
2. Add item and upload image.
3. Generate QR.
4. Open finder page.
5. Submit finder message.
6. Verify scan logs, messages, notifications, and email.
7. Test pricing/payment flow.
8. Test bulk tools with Business subscription.
9. Test admin pages.
