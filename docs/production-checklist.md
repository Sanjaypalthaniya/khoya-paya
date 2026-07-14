# Production Checklist

## Auth

- Signup works.
- Login works.
- Logout clears cookie.
- Blocked users cannot login.
- Dashboard routes require login.
- Admin routes require admin role.

## Items and QR

- Add item works.
- Edit item works.
- Delete confirmation is present.
- Image upload rejects non-image files.
- QR generation works.
- Public finder page hides owner email, phone, and user id.

## Finder Flow

- Scan log is created.
- Finder message is saved.
- Finder photo upload validates type and size.
- Abuse report saves.
- Owner receives dashboard notification.
- Email failure does not block finder message save.

## Payments and Plans

- Free plan limit is enforced.
- Paid plan order creation works.
- Razorpay signature is verified server-side.
- Subscription activates only after server verification.
- Payment history is visible.

## Bulk Tools

- Non-Business users see upgrade messaging.
- CSV template downloads.
- CSV upload validates rows.
- Import respects row and item limits.
- Bulk QR generation skips existing QR codes.
- QR ZIP downloads.
- Bulk history logs imports.

## Admin

- Users, items, messages, scans, reports, subscriptions, payments, notifications, and bulk activity pages are protected.
- Normal user cannot access `/admin`.

## Notifications

- Notification bell shows unread count.
- Notifications page lists alerts.
- Mark read and mark all read work.
- Notification preferences save.
- QR scan notifications respect cooldown.

## Security

- Rate limits active on auth/finder public APIs.
- Secrets are not exposed to frontend.
- Auth cookie is `httpOnly`, `sameSite=lax`, and `secure` in production.
- Dashboard/admin/API routes are blocked in `robots.ts`.

## Build

```bash
npm run build
```
