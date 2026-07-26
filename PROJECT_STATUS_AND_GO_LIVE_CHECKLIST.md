# Khoya Paya - Project Status aur Go-Live Checklist

**Report date:** 23 July 2026  
**Project:** QR-based Lost & Found, Recovery aur Community Platform  
**Current release decision:** **Local/code level par strong progress, lekin public production launch se pehle critical live verification aur provider setup pending hai.**

## 1. Status ka matlab

| Status | Meaning |
| --- | --- |
| ✅ Working / Verified | Code present hai aur build, typecheck, lint ya automated test se verify hua hai. |
| 🟡 Partial / Config-dependent | Feature ka code present hai, lekin external provider, production data ya complete UI/E2E verification pending hai. |
| 🔴 Pending / Launch blocker | Go-live se pehle implement, configure ya live environment me verify karna zaroori hai. |

> **Important:** Automated test ya successful build ka matlab real Razorpay payment, email, Cloudinary upload, SMS/WhatsApp ya production database ka live test pass hona nahi hai.

## 2. Latest technical verification

23 July 2026 ko current working tree par ye checks run kiye gaye:

| Check | Result |
| --- | --- |
| Prisma schema validation | ✅ Passed |
| TypeScript (`npm run typecheck`) | ✅ Passed |
| ESLint (`npm run lint`) | ✅ Passed, zero warnings allowed |
| Automated tests (`npm test`) | ✅ 39/39 passed |
| Next.js production build | ✅ Passed |
| Build output | ✅ 98 pages successfully generated |
| Git branch | ✅ `main` |
| Git remote | 🔴 Koi remote configured nahi hai |

Automated tests mainly community lifecycle, validation, claims state machine, moderation/media safety aur Razorpay signatures cover karte hain. Auth, complete QR journey, email delivery, Cloudinary, admin screens, bulk flow aur full browser E2E ke automated tests abhi comprehensive nahi hain.

## 3. Project me ab tak complete hua work

### A. Public website aur SEO — ✅ Working / build verified

- Homepage, About, How It Works, Pricing, FAQ aur Contact pages.
- Privacy Policy aur Terms & Conditions pages.
- Public lost-item search page.
- Found-item report aur recovery-code search pages.
- Responsive navigation/footer aur redesigned UI system.
- `sitemap.xml` aur `robots.txt` routes.
- Dashboard/admin/API routes ko search indexing se protect karne ka setup.

### B. Authentication aur account security — ✅ Code complete, live E2E pending

- Signup, login, logout aur current-user APIs.
- JWT-based `httpOnly` cookie authentication.
- Protected dashboard aur role-protected admin routes.
- Blocked users ke liye restrictions.
- Profile, password aur notification-preference settings.
- Signup/login public endpoints par validation aur rate limiting.

### C. Item management — ✅ Working / build verified

- Item create, list, detail, edit aur soft-delete flows.
- Item image, category, description, identifying marks, location aur lost date.
- Safe, Lost, Found, Missing aur Recovered status lifecycle.
- Lost Mode on/off.
- Free/paid plan item-limit foundation.
- Duplicate create requests se protection.
- Public search visibility aur privacy-safe item data.

### D. QR aur recovery flow — ✅ Code complete, browser E2E required

- Unique item QR generation, regeneration, preview aur print page.
- Public `/found/[uniqueCode]` finder page.
- Owner ka email/phone public page par expose kiye bina contact flow.
- QR scan logging.
- Finder message, optional finder photo aur abuse report.
- Recovery ID se item lookup aur found-item submission.
- Dashboard me scans, messages, found reports aur recovery history.
- In-app notification foundation aur scan cooldown.

### E. Private owner-finder chat — ✅ Code complete, live E2E required

- Secure finder chat token flow.
- Owner aur finder ke beech messages.
- Read/unread aur conversation status management.
- Suggested verification questions.
- Finder answers aur owner verify/reject actions.
- Chat close/reopen/control APIs.
- WhatsApp deep-link/helper integration.

### F. Claim aur handover workflow — ✅ Core logic tested

- Claim request create/list/detail.
- Ownership verification questions aur encrypted private answers.
- Evidence upload, review aur deletion.
- Approve, reject, withdraw aur more-information flow.
- Reward handling aur return arrangement.
- Handover code generate/verify.
- Dono participants ki confirmation ke baad recovery.
- Dispute creation aur evidence flow.
- Consent-based success story publication.
- Claim state-machine aur authenticated encryption tests pass hain.

### G. Community platform — ✅ Major backend/UI present

- Community post draft, publish, edit, delete, close aur recovered lifecycle.
- Lost/found item, pet, document, vehicle, help, recovery aur success-story post types.
- Public/private/followers-only/unlisted visibility validation.
- Item status aur community-post lifecycle integration.
- Community feed, post details aur user's own posts.
- Images/video metadata, media ordering aur deletion APIs.
- Reactions, save/unsave, comments aur nested replies.
- Report modal aur confidential report API.
- Search, suggestions, popular searches aur search history.
- Nearby feed, trending posts/tags/locations.
- Recommended posts, users aur helpers.
- Trust score, points history, badges, achievements aur leaderboard.
- Public data me phone/email/private QR fields block karne ki validation.

### H. Moderation aur abuse controls — ✅ Text/backend strong; visual AI config-dependent

- Post/comment text moderation with Approved, Under Review aur Rejected decisions.
- Threat, prohibited content, scam, spam, suspicious links aur abuse-pattern rules.
- Duplicate/near-duplicate content signals.
- Rate-limited reporting aur duplicate-report prevention.
- Multiple trusted reports par temporary auto-hide behavior.
- Admin moderation queue with filters and pagination.
- Single aur bulk approve/reject/hide actions with mandatory reason.
- Admin audit history, warn, suspend, restore aur delete backend actions.
- Media type, size, extension, binary signature aur SHA-256 checks.
- Public media filter sirf Ready + Approved + not-deleted media allow karta hai; tests pass hain.
- External/self-hosted media moderation provider fail-closed behavior tested hai.

### I. Notifications — 🟡 Code present, provider verification pending

- In-app notification list, unread count, mark-read aur mark-all-read.
- Notification preferences.
- Finder message/scan/recovery related notification foundation.
- SMTP email helper.
- Optional WhatsApp/SMS provider helpers.

### J. Payments, plans aur billing — 🟡 Backend complete, real provider test pending

- Plans/subscription models aur pricing/billing UI.
- Razorpay order creation.
- Checkout signature server-side verification.
- Payment history aur subscription activation logic.
- Signature-verified Razorpay webhook route.
- Idempotent webhook event storage.
- Captured, failed aur refund event handling.
- Checkout aur webhook signature tests pass hain.
- Real Razorpay test/live account se end-to-end payment abhi verify nahi hua.

### K. Business/enterprise bulk tools — 🟡 Feature present, load testing pending

- Business-plan access control.
- CSV template download aur validated CSV import.
- Bulk QR generation.
- QR ZIP download aur print view.
- Item CSV export.
- Bulk import history aur admin bulk activity.
- Large file/large production dataset load testing pending hai.

### L. Admin panel — ✅ Broad coverage, full browser QA pending

- Admin dashboard aur analytics.
- Categories, chats, found reports aur recovery requests.
- Verification requests, disputes, rewards aur finder reputation.
- Payments, subscriptions, notifications aur bulk activity.
- Moderation queue/detail actions.
- Role protection present; normal-user access ko live browser test karna baaki hai.

### M. Database aur operations — ✅ Schema/migrations ready; production apply pending

- PostgreSQL + Prisma schema valid hai.
- Initial aur additive migrations repository me present hain.
- Seed script plans/admin setup support karta hai.
- App aur database health-check endpoints present hain.
- Community backfill, reputation, moderation, trending, leaderboard aur monthly hero scripts present hain.
- Deployment, rollback, environment, SMTP, Cloudinary aur Razorpay setup docs present hain.

## 4. Partial ya configuration-dependent features

| Feature | Current status | Live karne se pehle kya chahiye |
| --- | --- | --- |
| Cloudinary uploads | 🟡 Integration present | Production account, restricted credentials aur real upload/delete test |
| SMTP email | 🟡 Config local env me present | Real inbox delivery, spam/bounce aur failure-path test |
| Razorpay | 🟡 Code + webhook present | Test-mode E2E, webhook dashboard config, duplicate/retry/refund verification, then live keys |
| SMS/WhatsApp | 🟡 Optional helpers | Provider credentials, templates/compliance aur real delivery test |
| Visual media AI moderation | 🟡 Provider adapter present | `MODERATION_MEDIA_ENDPOINT` deploy/configure aur image/video safety test |
| Claims encryption | 🟡 Key present locally | Same secure production secret set karke rotation/backup policy |
| Bulk operations | 🟡 Local feature present | Business-plan E2E aur realistic dataset load test |
| Nearby/discovery rankings | 🟡 Logic/tests present | Production data, scheduled jobs aur ranking quality verification |
| Admin moderation | 🟡 Actions present | Media preview/action journey aur role-based browser QA |

## 5. Known pending work aur launch blockers

### P0 — Public launch se pehle mandatory

- [ ] Production PostgreSQL/Supabase database create karein.
- [ ] Production `DATABASE_URL` par `prisma migrate deploy` run aur migration history verify karein.
- [ ] Production seed safely run karke plans aur admin login verify karein.
- [ ] Strong production secrets set karein; `.env` ko kabhi commit na karein.
- [ ] GitHub remote add karke reviewed code push karein; current repo me remote configured nahi hai.
- [ ] Vercel/hosting deployment complete karein.
- [ ] Final HTTPS domain set karke `NEXT_PUBLIC_APP_URL` update karein.
- [ ] Cloudinary production upload/delete test karein.
- [ ] SMTP se real email send/receive test karein.
- [ ] Razorpay test-mode payment, webhook retry/idempotency, failed payment aur refund test karein.
- [ ] Full browser E2E: signup → item → QR → finder → message/chat → claim → handover → recovered.
- [ ] Admin authorization verify karein: normal user kisi admin page/API ko access na kar sake.
- [ ] Mobile QA Chrome/Android, Safari/iPhone aur desktop browsers par karein.
- [ ] Secret scan, dependency audit aur production logs review karein.
- [ ] Backup aur rollback drill perform karein.

### P1 — Strongly recommended before launch

- [ ] **Contact form ko backend/email/helpdesk se connect karein.** Abhi form validation ke baad clearly batata hai ki message send nahi hua.
- [ ] In-memory rate limiter ko shared Redis/KV based limiter se replace karein, especially Vercel/multi-instance deployment ke liye.
- [ ] Media moderation provider deploy/configure karein ya launch policy me manual moderation mandatory rakhein.
- [ ] Admin media preview aur complete moderation action UX verify/improve karein.
- [ ] Automated browser E2E tests add karein for auth, QR finder, payment aur admin access.
- [ ] Error monitoring/alerting (for example Sentry-compatible service), uptime monitoring aur webhook failure alerts configure karein.
- [ ] Scheduled jobs configure karein: trending, leaderboard, reputation/backfill as required.
- [ ] Accessibility, keyboard navigation aur screen-reader pass karein.
- [ ] Privacy policy/terms ko final business/legal details ke saath review karein.

### P2 — Post-launch improvement ho sakta hai

- [ ] Video keyframe extraction, speech-to-text aur audio safety classification.
- [ ] Perceptual hashing/near-duplicate image and video detection.
- [ ] Pixel-level category-to-media semantic matching.
- [ ] Temporary expiry-based restrictions, escalating strikes aur timed suspensions.
- [ ] Advanced analytics, funnel tracking aur operational dashboards.
- [ ] Large-scale performance, concurrency aur stress testing.

## 6. Environment readiness snapshot

Local `.env` ki values expose kiye bina sirf variable presence check ki gayi:

| Group | Local presence | Note |
| --- | --- | --- |
| Database, JWT, app URL | ✅ Present | Production values alag se set/verify karne hain |
| Cloudinary | ✅ Present | Real production upload not verified |
| SMTP | ✅ Present | Real delivery not verified |
| Claim encryption key | ✅ Present | Production secret-management required |
| Razorpay keys + webhook secret | 🔴 Missing | Payment live/test E2E blocked |
| External media moderation endpoint/token | 🔴 Missing | Visual AI moderation active nahi hai |

Required production variables ka master template `.env.example` me available hai.

## 7. Recommended go-live sequence

1. Current uncommitted code review karke stable release commit banayein.
2. GitHub remote add, secret scan aur push complete karein.
3. Production database, migration, seed aur backup configure karein.
4. Vercel/hosting par staging deployment karein.
5. Cloudinary, SMTP, Razorpay webhook aur optional messaging providers connect karein.
6. Staging par complete manual E2E aur security/role QA run karein.
7. Payment failure/refund, email failure, upload failure aur webhook retry cases test karein.
8. Monitoring, alerts, scheduled jobs aur rollback verify karein.
9. Custom domain/DNS/SSL configure karke QR links dobara test karein.
10. Final production smoke test ke baad limited launch karein.

## 8. Final readiness summary

| Area | Decision |
| --- | --- |
| Code compilation and static quality | ✅ Ready |
| Automated unit/integration checks currently configured | ✅ 39/39 pass |
| Core item, QR, community, claims and admin implementation | ✅ Substantially complete |
| Production database/deployment | 🔴 Pending |
| Real email/upload/payment/messaging verification | 🔴 Pending |
| Visual AI moderation | 🟡 Optional provider not configured; launch policy required |
| Contact support submission | 🔴 Not connected |
| Multi-instance rate limiting | 🔴 Shared limiter pending |
| Full live browser/mobile QA | 🔴 Pending |
| **Public production launch** | **🔴 Abhi hold karein; P0 checklist pass hone ke baad launch karein** |

## 9. Useful verification commands

```bash
npm run prisma:validate
npm run typecheck
npm run lint
npm test
npm run build
```

Production migration ke liye:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

> Production me `prisma migrate dev` use na karein. Production database credentials command history, source code ya committed `.env` me na rakhein.
