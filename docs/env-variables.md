# Environment Variables

Add these in Vercel Project Settings > Environment Variables. Use Production, Preview, and Development scopes as needed.

| Variable | Required | Used for | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma PostgreSQL connection | `postgresql://USER:PASSWORD@HOST/DB?sslmode=require` |
| `NEXT_PUBLIC_APP_URL` | Yes | QR URLs, emails, sitemap, canonical URLs | `https://your-domain.com` |
| `JWT_SECRET` | Yes | Auth token signing | `strong-production-secret` |
| `CLOUDINARY_CLOUD_NAME` | Yes for uploads | Cloudinary uploads | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Yes for uploads | Cloudinary uploads | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Yes for uploads | Cloudinary uploads | `your_api_secret` |
| `SMTP_HOST` | Yes for email | Email notifications | `smtp.example.com` |
| `SMTP_PORT` | Yes for email | Email notifications | `587` |
| `SMTP_USER` | Yes for email | Email notifications | `smtp_user` |
| `SMTP_PASS` | Yes for email | Email notifications | `smtp_password` |
| `SMTP_FROM` | Yes for email | Email sender | `Khoya Paya <support@your-domain.com>` |
| `RAZORPAY_KEY_ID` | Yes for payments | Server-side Razorpay | `rzp_live_xxx` |
| `RAZORPAY_KEY_SECRET` | Yes for payments | Server-side Razorpay signature/order | `secret` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes for checkout | Client checkout key | `rzp_live_xxx` |
| `RAZORPAY_WEBHOOK_SECRET` | Yes for webhooks | Webhook signature verification | `webhook_secret` |
| `SEED_ADMIN_EMAIL` | Optional | Production admin seed | `admin@your-domain.com` |
| `SEED_ADMIN_PASSWORD` | Optional | Production admin seed | `strong_admin_password` |
| `WHATSAPP_PROVIDER` | Optional | WhatsApp alerts | `twilio` |
| `TWILIO_ACCOUNT_SID` | Optional | WhatsApp/SMS alerts | `ACxxx` |
| `TWILIO_AUTH_TOKEN` | Optional | WhatsApp/SMS alerts | `token` |
| `TWILIO_WHATSAPP_FROM` | Optional | WhatsApp sender | `whatsapp:+14155238886` |
| `SMS_PROVIDER` | Optional | SMS alerts | `twilio` |
| `TWILIO_SMS_FROM` | Optional | SMS sender | `+1234567890` |

Do not add secrets to source code. Do not commit `.env`.
