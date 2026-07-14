# Khoya Paya deployment status

Last local review: 12 July 2026

## Current status

| Area | Status | Notes |
| --- | --- | --- |
| GitHub repository | Blocked | Local `.git` directory is empty/invalid. Initialize Git, review the first commit, then add the GitHub remote. |
| Vercel deployment | Pending | Requires a GitHub repository and production environment variables. |
| Production database | Pending | Create a Supabase project and use its transaction-pooler URL for Vercel. |
| Environment variables | Ready for configuration | `.env.example` contains placeholders only; actual secrets must be entered in Vercel, never committed. |
| Prisma migration | Ready to run | Initial PostgreSQL migration is present under `prisma/migrations`. Run `prisma migrate deploy`, never `migrate dev`, in production. |
| Seed | Ready to run | Plan upserts and admin upsert are repeatable. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. |
| Local production build | Passed | `npm run build` passed after fixing unescaped JSX quotes; only non-blocking image optimization warnings remain. |
| Live QA | Pending | Can only be completed after deployment with real provider credentials. |

## Production environment variables

Required in Vercel for Production (and Preview only when intentionally testing there):

```dotenv
DATABASE_URL="production_postgresql_pooler_url"
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
JWT_SECRET="generate-a-long-random-secret"

CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

SMTP_HOST="smtp_host"
SMTP_PORT="587"
SMTP_USER="smtp_user"
SMTP_PASS="smtp_password"
SMTP_FROM="Khoya Paya <support@your-domain.com>"

RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

ADMIN_NAME="Admin"
ADMIN_EMAIL="admin@your-domain.com"
ADMIN_PASSWORD="use-a-unique-strong-password"
```

Optional messaging variables are documented in `.env.example`. Generate `JWT_SECRET` with a password manager or `openssl rand -base64 48`. Any variable prefixed `NEXT_PUBLIC_` is exposed to browsers; never put a secret in one.

## GitHub and Vercel launch checklist

- [ ] Run `git init`, then confirm `.env`, `.next`, `node_modules`, and `.vercel` do not appear in `git status --short`.
- [ ] Run a secret scan and review the complete first commit diff.
- [ ] Commit and push the `main` branch to a private or public GitHub repository.
- [ ] In Vercel, import the repository, keep the Next.js preset and default build command, and add every required production variable.
- [ ] Deploy and inspect the complete build log.
- [ ] Update `NEXT_PUBLIC_APP_URL` to the final Vercel/custom-domain origin and redeploy.
- [ ] Run the migration and seed once against the production connection string.
- [ ] Configure Cloudinary, SMTP, and Razorpay with production-appropriate accounts and restrictions.
- [ ] Configure Razorpay webhook endpoint `https://your-production-domain.com/api/webhooks/razorpay` for `payment.captured` and `payment.failed`, using the same webhook secret as Vercel.
- [ ] Complete `docs/live-testing-checklist.md` and `docs/final-qa.md` on the live URL.
- [ ] Verify failed email delivery does not prevent finder messages from being saved.
- [ ] Verify homepage, auth, item/QR, finder, payment, business bulk flows, admin authorization, SEO endpoints, and mobile layouts.

## Database release commands

Run from a trusted local terminal with `DATABASE_URL` temporarily set to the production URL, or from a secured CI release job:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Do not place database credentials in a shell-history command, repository file, or Vercel build command. Do not use `prisma migrate dev` in production. Confirm the plans and admin user afterward.

## Custom domain checklist

- [ ] Add the domain in Vercel and apply the exact DNS records Vercel displays.
- [ ] Wait until Vercel shows valid DNS and SSL.
- [ ] change `NEXT_PUBLIC_APP_URL` to the canonical HTTPS domain and redeploy.
- [ ] Change the Razorpay webhook to the custom-domain URL.
- [ ] Generate a new QR and retest existing QR/finder links and redirects.

## Known issues and launch gate

- The local `.git` directory contains no repository metadata, so no remote or tracked-file audit is currently possible.
- The requested `/api/webhooks/razorpay` route does not exist yet. Do not configure or rely on the webhook until a signature-verified, idempotent handler is implemented and tested; browser payment verification remains a separate flow.
- Live provider, migration, seed, webhook, upload, email, and end-to-end QA results remain unverified until credentials and a deployed URL exist.
- `npm install` reports dependency advisories; review `npm audit` before launch and test upgrades rather than applying forced breaking updates.
- Prisma 6 warns that the `package.json#prisma` seed configuration will require migration before Prisma 7; it is valid for the currently pinned Prisma 6 release.

Launch only after every pending status above is verified and the live QA checklists pass.
