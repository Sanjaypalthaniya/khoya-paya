# Environment

Core production variables: `DATABASE_URL`, `JWT_SECRET` (32+ chars), `NEXT_PUBLIC_APP_URL`, and `CLAIM_ENCRYPTION_KEY`. `DIRECT_URL` is optional for a provider's non-pooled administrative connection.

Cloudinary requires its cloud name, API key, and API secret. SMTP requires host, port, user, password, and from identity. Razorpay requires server key ID/secret, matching public key ID, and a distinct webhook secret. Media moderation and Twilio variables are optional; incomplete optional groups report degraded/disabled status and must not be treated as configured. Never expose variables except those explicitly prefixed `NEXT_PUBLIC_`.
