# Khoya Paya - Current Working Status

Last verified: 20 July 2026

## Status meaning

| Status | Meaning |
| --- | --- |
| WORKING | Code complete hai aur local build/test ya runtime se verify hua hai. |
| PARTIAL | Basic flow available hai, lekin UI, external provider, ya advanced behavior pending hai. |
| NOT VERIFIED | Code present ho sakta hai, lekin real production provider/live environment me test nahi hua. |
| NOT WORKING / PENDING | Required flow abhi implement nahi hai ya known gap present hai. |

## Latest verification result

| Check | Result |
| --- | --- |
| TypeScript (`npm run typecheck`) | WORKING - passed |
| ESLint (`npm run lint`) | WORKING - passed |
| Automated tests (`npm test`) | WORKING - 21/21 passed |
| Community database integration test | WORKING - passed |
| Next.js production compilation | WORKING - compiled successfully |
| Prisma schema validation | WORKING - passed |
| Prisma Client generation | WORKING - passed |
| Local community feed endpoint | WORKING - HTTP 200 |
| Protected API authentication | WORKING - anonymous report request returned HTTP 401 |

## Fully working features

### Authentication and access control

- User signup, login, logout and JWT httpOnly cookie authentication.
- Protected dashboard routes.
- User and admin role separation.
- Blocked users community actions nahi kar sakte.
- Community APIs par authentication and request rate limiting.

### Item management

- Item create, view, edit and soft-delete flows.
- Item statuses: Safe, Lost, Found, Missing and Recovered.
- Lost mode enable/disable.
- Item image, description, category, date and last-seen location storage.
- Duplicate item-create request protection using `clientRequestId`.
- `crypto.randomUUID()` compatibility issue fix ho chuka hai.
- Missing `Item.clientRequestId` database column migration apply ho chuki hai.

### QR recovery system

- Registered item ke liye QR generation.
- Public finder page owner ki private contact information expose kiye bina open hota hai.
- Finder messages and scan history.
- Recovery ID/QR based item lookup flows.
- Secure owner/finder conversation foundation.

### Item-to-community integration

- Lost, Found and Missing items default community publication ke liye map hote hain.
- Safe and Recovered items default private rehte hain.
- Item and community post database relation available hai.
- Item update/recovery/close/delete community post lifecycle ke saath sync hota hai.
- Community post me owner phone/email/private QR fields expose nahi hote.
- Existing item/community migration and mapping tests pass hain.

### Community post foundation

- Create draft and publish post APIs.
- Post edit, soft delete, close and recovered transitions.
- Public, private, followers-only and unlisted visibility values.
- Lost item, found item, pet, document, vehicle, help, recovery and success-story post types.
- Category, title, description, reward, event date, public-safe location, tags and contact preference.
- Maximum 8 images and 1 video validation.
- Public feed sirf published, public and moderation-approved posts return karta hai.
- Owner ko apne draft/moderation state ke saath posts milte hain.
- Unauthorized ownership and invalid status transitions reject hote hain.

### Community feed and interactions

- Database-backed community feed; development fixtures production feed ka replacement nahi hain.
- Feed filtering by type, category, location, reward, media, verified state and search text.
- Post reactions.
- Save/unsave post.
- Database-backed comments and replies.
- Comment reply depth maximum 5.
- Hidden/rejected comments visible comment count me add nahi hote.
- Only active, approved comments public comment list me return hote hain.

### Search, nearby and discovery

- Unicode-safe query normalization.
- Search aliases and suggestions.
- Search history create/list/delete.
- Popular searches.
- Nearby posts with deterministic distance calculation.
- Trending posts, tags and locations.
- Recommended posts, users and helpers.
- Recommendation dismissal.
- Feed/search queries moderation-approved public posts tak restricted hain.

### Reputation and community recognition

- Trust score and trust profile.
- Community points and point history.
- Badges and achievements.
- Leaderboard and current-user leaderboard position.
- Finder reputation admin view.
- Trending and leaderboard calculation scripts.
- Trust score deterministic and bounded tests pass hain.

### Text moderation

- Har direct community post publish boundary par moderation run hoti hai.
- Draft publish karte waqt dobara moderation run hoti hai.
- Item se automatically created community post par text moderation run hoti hai.
- Har comment/reply creation par moderation run hoti hai.
- Three decisions: `APPROVED`, `UNDER_REVIEW`, `REJECTED`.
- Threats, explicit prohibited sexual terms, dangerous hate/harassment patterns and illegal trade patterns reject hote hain.
- Scam/fake reward patterns, abusive language, weapon/drug references and promotional spam review me jate hain.
- Suspicious multiple links, excessive emoji and repeated-character spam detection.
- Lost/found/help platform relevance check.
- Normalized content hash based duplicate detection.
- Short-window mass-posting detection.
- High-trust users ke low-risk uncertain cases ko limited trust adjustment milta hai; severe rules bypass nahi hote.
- User ko safe moderation reason/message return hota hai.
- Moderation cases, provider, risk score, signals, hash and review history database me store hote hain.

### Community reporting backend

- Post, comment and user report submit API.
- Supported reasons include spam, fraud, wrong information, harassment, unsafe content, duplicate, impersonation, privacy and scam/payment request.
- User apna content report nahi kar sakta.
- Same user ka duplicate report reject hota hai.
- Reporting rate limited hai.
- Trust score 40+ wale 3 independent reporters ke open reports par post/comment temporary auto-hide hota hai.

### Admin moderation backend

- Admin-only moderation case list page available at `/admin/moderation`.
- Page decision, target, risk, reason, provider and latest action show karti hai.
- Admin-only moderation action API available hai.
- Backend actions: approve, reject, restore, hide, delete, warn and suspend.
- Every admin action reason aur admin ID ke saath history me record hota hai.
- Approve/restore post ko publish aur comment ko active kar sakta hai.
- Suspend user ko block karta hai; warn trust score reduce karta hai.

### Database and migrations

- PostgreSQL Prisma schema valid hai.
- Community foundation, interactions, item integration, lifecycle, discovery/reputation and moderation migrations present hain.
- Latest additive moderation migration local database me execute aur Prisma history me applied mark ho chuki hai.
- Moderation migration existing user/item/post data delete nahi karti.

## Partially working or configuration-dependent

### Image and video moderation - PARTIAL

- File MIME type, extension, size and binary signature validation working hai.
- SHA-256 content hash generate aur store hota hai.
- Alt text local text/relevance rules se check hota hai.
- `MODERATION_MEDIA_ENDPOINT` provider interface available hai.
- Provider timeout/error par uploaded media manual review me jata hai; system false AI approval claim nahi karta.
- Actual nudity, violence, blood, weapon, drug, meme, advertisement, logo-spam or fake-screenshot visual detection tabhi chalegi jab compatible self-hosted media moderation endpoint configure ho.

### Admin moderation UI - PARTIAL

- Moderation queue/table visible hai.
- Admin action backend API working hai.
- Queue page par approve/reject/restore/warn/suspend action buttons/forms abhi available nahi hain. Actions API client ya manual API call se invoke karne padenge.

### Community report UI - PARTIAL

- Report submit backend complete hai.
- Community post/comment cards par end-user report menu/form abhi add nahi hua.

### Media manual-review workflow - PARTIAL

- Pending media moderation status and admin action API present hain.
- Dedicated media preview/review screen nahi hai.
- Admin table target ID show karti hai, lekin image/video preview render nahi karti.

### Email notifications - CONFIGURATION DEPENDENT

- SMTP email code present hai.
- Real delivery ke liye `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `SMTP_FROM` required hain.
- Current real SMTP account delivery NOT VERIFIED hai.

### Cloudinary uploads - CONFIGURATION DEPENDENT

- Cloudinary integration present hai.
- Development me credentials absent hon to local `public/uploads` fallback use hota hai.
- Production me valid Cloudinary credentials required hain.
- Current production Cloudinary account upload NOT VERIFIED hai.

### Razorpay payments - PARTIAL / NOT VERIFIED LIVE

- Order/payment verification and subscription scaffolding present hai.
- Real Razorpay test/live credentials ke against end-to-end payment NOT VERIFIED hai.
- Server-to-server Razorpay webhook route abhi missing hai.

### WhatsApp and SMS - CONFIGURATION DEPENDENT

- Optional Twilio helper code present hai.
- Provider disabled ho to send operation safely skip hoti hai.
- Real Twilio delivery NOT VERIFIED hai.

### Business bulk tools - LOCAL FEATURE PRESENT

- Bulk CSV import and QR ZIP download code present hai.
- Large production dataset/load testing NOT VERIFIED hai.

## Not working or pending

### Advanced video AI analysis

- Video keyframe extraction implement nahi hai.
- Video speech-to-text moderation implement nahi hai.
- Audio safety classification implement nahi hai.
- Frame-level nudity/violence/weapon detection local application ke andar implement nahi hai.

### Complete self-hosted AI provider

- Repository ke andar koi bundled NSFW/violence vision model ya model weights nahi hain.
- `MODERATION_MEDIA_ENDPOINT` ke liye actual inference service deploy/configure karna pending hai.
- Current local text engine deterministic rule-based moderation hai; LLM/transformer semantic classifier nahi hai.

### Category-to-media semantic matching

- Image me shown object post category se match karta hai ya nahi, iska visual semantic comparison pending hai.
- Alt-text relevance check available hai, actual pixels/object recognition nahi.

### Advanced duplicate media detection

- Exact SHA-256 duplicate hash available hai.
- Perceptual hashing, near-duplicate image detection and re-encoded video duplicate detection pending hai.

### Posting restrictions management

- Existing user block and trust-score warning controls available hain.
- Temporary expiry-based posting restriction model/UI implement nahi hai.
- Automatic escalating strikes and timed suspensions implement nahi hain.

### Production deployment

- GitHub repository/push status unresolved hai because local `.git` metadata previously invalid/empty report hui thi.
- Vercel production deployment pending/not verified.
- Production PostgreSQL/Supabase deployment pending/not verified.
- Custom domain, DNS and SSL pending/not verified.
- Full live mobile/browser QA pending.

### Razorpay webhook

- `/api/webhooks/razorpay` signature-verified, idempotent webhook endpoint missing hai.
- Iske bina browser verification ke bahar reliable server payment event reconciliation complete nahi hai.

## Known moderation gap requiring priority fix

Item integration ke through existing `item.imageUrl` se create hone wali media row ka default moderation status `PENDING` hota hai, lekin item-derived post publication decision currently primarily text moderation se decide hota hai. Feed media query `processingStatus = READY` filter karti hai, media `moderationStatus = APPROVED` enforce nahi karti. Isliye item-derived image semantic review ke bina visible ho sakti hai.

Production launch se pehle required fix:

1. Every feed/repository media query me `moderationStatus: APPROVED` enforce karein.
2. Pending/rejected media hone par parent post ko draft/review state me rakhein.
3. Admin media preview and approval UI add karein.
4. Existing media rows ka safe backfill/manual review karein.

## Required environment variables

Core:

```env
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Production media storage:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Optional self-hosted media moderation:

```env
MODERATION_MEDIA_ENDPOINT=
MODERATION_MEDIA_TOKEN=
```

Optional integrations:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
WHATSAPP_PROVIDER=
SMS_PROVIDER=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
TWILIO_SMS_FROM=
```

## Recommended priority order

1. Item-derived media moderation bypass close karein.
2. Admin moderation action buttons and media preview add karein.
3. Community cards par report UI add karein.
4. Self-hosted image moderation service connect and test karein.
5. Video keyframe/audio moderation implement karein.
6. Razorpay webhook implement and test karein.
7. Production provider credentials ke saath full live QA karein.
8. Git repository, deployment, domain and monitoring complete karein.

## Current release decision

- Local development and core item/QR/community/text-moderation flows: **READY FOR CONTINUED TESTING**
- Production-safe visual media moderation: **NOT READY**
- Admin moderation operations from UI: **PARTIAL**
- External provider flows: **NOT LIVE VERIFIED**
- Full public production launch: **NOT RECOMMENDED YET**
