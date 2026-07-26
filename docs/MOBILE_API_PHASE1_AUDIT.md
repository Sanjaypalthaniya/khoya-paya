# Mobile API Phase 1 Audit

## Existing website authentication

- Next.js 16 App Router.
- Email/password login uses bcrypt and a 7-day HS256 JWT.
- Cookie name remains `khoya_paya_session`; options remain httpOnly, secure in production, SameSite Lax, and path `/`.
- `proxy.ts` preserves dashboard/admin redirects and role enforcement.
- Signup, logout, `/api/auth/me`, JWT claims, browser routes, and callback behavior are unchanged.
- `isBlocked` prevents authentication. `postingRestrictedUntil` is a posting restriction, not an account suspension.

## Readiness and extraction

- Credential lookup, normalization, bcrypt verification, blocked-state enforcement, safe DTO creation, and last-login recording now live in `lib/server/auth/authentication.service.ts`.
- Website login and mobile login both use that service.
- Mobile auth is additive and scoped to `/api/v1`; existing APIs remain cookie-authenticated.
- Mobile access tokens use a separate HS256 secret, short TTL, minimal claims (`sub`, role, session ID, token type).
- Refresh tokens are 384-bit random values. Only an HMAC-SHA256 hash using a separate pepper is stored.
- Rotation creates a new session record and atomically revokes the previous record. Reuse of a rotated token revokes its active token family.

## Database and migration safety

- New additive `MobileSession` model only.
- No existing table or column is changed or removed.
- Migration: `20260726170000_mobile_sessions`.
- SQL contains only `CREATE TABLE`, indexes, and a cascading foreign key.
- The configured database is production Neon, so this phase does not apply the migration.

## Security and regression risks

- In-memory rate limiting is process-local; production mobile rollout should use a shared store.
- Device IDs identify an installation but are not treated as secrets.
- Mobile secrets must be configured separately from `JWT_SECRET`.
- Refresh-token family replay protection depends on retaining revoked session history.
- Real runtime session tests require a disposable local PostgreSQL database with the additive migration applied.

## Local configuration

Required private values:

- `MOBILE_ACCESS_TOKEN_SECRET` (32+ random characters)
- `MOBILE_REFRESH_TOKEN_PEPPER` (different 32+ random characters)
- `MOBILE_ACCESS_TOKEN_TTL_MINUTES` (default 15, range 5–60)
- `MOBILE_REFRESH_TOKEN_TTL_DAYS` (default 30, range 1–90)

Optional compatibility values:

- `MOBILE_MINIMUM_APP_VERSION`
- `MOBILE_LATEST_APP_VERSION`

No global CORS changes were made.
