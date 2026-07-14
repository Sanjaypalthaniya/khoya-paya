# Khoya Paya

QR based lost and found platform for registering valuables, generating smart QR codes, and allowing finders to contact owners safely without exposing private contact details.

## Tech Stack

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM
- Bootstrap 5
- Custom CSS
- JWT httpOnly cookie auth
- Cloudinary
- SMTP email
- Razorpay

## Main Features

- Public marketing pages
- Signup/login/logout
- Protected dashboard
- Item management
- QR generation
- Public finder page
- Finder messages and scan logs
- Image upload
- Email and in-app notifications
- Optional WhatsApp/SMS helpers
- Plans/subscriptions scaffolding
- Business bulk CSV upload and QR ZIP download
- SEO sitemap and robots

## Local Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Environment Variables

See `docs/env-variables.md`.

## Database

See `docs/production-database.md`.

## Build

```bash
npm run build
```

## Deployment

See:

- `docs/vercel-deployment.md`
- `docs/deployment.md`
- `docs/deployment-commands.md`

## QA

See:

- `docs/final-qa.md`
- `docs/live-testing-checklist.md`
- `docs/production-checklist.md`
