# Deployment

Use Node 22, `npm ci`, and `npm run predeploy`. Create a separate staging PostgreSQL database, configure staging-only providers in Vercel Preview, then run `npm run migrate:deploy` against that database. Deploy the same immutable commit only after the staging checklist passes. Never use `prisma migrate dev`, `db push`, or `migrate reset` in staging/production.

Before migration, take a provider backup and record the deployment commit. Vercel must use Cloudinary; `public/uploads` is development-only and is ignored by Git. The Razorpay webhook URL is `https://<staging-host>/api/webhooks/razorpay`.
