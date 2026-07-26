# Providers

- PostgreSQL: use separate staging and production databases, TLS, managed backups, and point-in-time recovery where available.
- Cloudinary: server-side uploads only; production has no filesystem fallback. Pending/rejected media stays out of public DTOs.
- SMTP: TLS is selected by port, timeouts are bounded, transient failures retry at most three times, and primary workflows catch non-critical delivery failures.
- Razorpay: prices come from `Plan`, checkout and webhook signatures are server-verified, and webhook records are idempotent.
- Twilio/WhatsApp/SMS: optional and disabled when incomplete. Do not send without user opt-in.
