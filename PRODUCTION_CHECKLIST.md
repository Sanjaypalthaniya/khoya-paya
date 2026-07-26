# Production checklist

- Staging regression and provider tests recorded
- Backup created and restore tested
- `prisma migrate status` clean; `npm run migrate:deploy` succeeds
- `npm run predeploy` succeeds on the release commit
- Secrets scan clean; no `.env`, dumps, logs, or uploads tracked
- Production database, Cloudinary, SMTP, Razorpay live keys, webhook secret, and app URL configured separately
- Health/log/error-monitoring alerts checked
- Rollback owner and release window confirmed
