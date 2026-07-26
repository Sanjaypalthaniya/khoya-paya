# Mobile QA Sprint

## Route inventory

The App Router currently exposes 70 page routes and 133 API routes.

- Public/marketing: `/`, `/about`, `/community-guidelines`, `/contact`, `/faq`, `/found-item`, `/how-it-works`, `/journal`, `/journal/[slug]`, `/lost-items`, `/pricing`, `/privacy-policy`, `/refund-policy`, `/safety-center`, `/success-stories`, `/terms-and-conditions`
- Authentication: `/login`, `/signup`, `/forgot-password`
- Community: `/community`, `/community/posts/[postId]`, `/report-found-item`, `/report-found-item/success`
- Finder/recovery: `/found/[uniqueCode]`, `/recover`, `/recover/[recoveryCode]`, `/chat/finder/[token]`
- Dashboard: `/dashboard`, `/dashboard/billing`, `/dashboard/bulk-history`, `/dashboard/bulk-qr`, `/dashboard/bulk-qr/print`, `/dashboard/bulk-upload`, `/dashboard/chats`, `/dashboard/chats/[id]`, `/dashboard/claims`, `/dashboard/claims/[claimId]`, `/dashboard/community-posts`, `/dashboard/feed`, `/dashboard/found-reports`, `/dashboard/items`, `/dashboard/items/[id]`, `/dashboard/items/[id]/edit`, `/dashboard/items/[id]/qr`, `/dashboard/items/add`, `/dashboard/messages`, `/dashboard/my-reports`, `/dashboard/notifications`, `/dashboard/recovery-history`, `/dashboard/recovery-requests`, `/dashboard/scans`, `/dashboard/settings`, `/dashboard/settings/notifications`, `/dashboard/verification`
- Admin: `/admin`, `/admin/analytics`, `/admin/bulk-activity`, `/admin/categories`, `/admin/chats`, `/admin/disputes`, `/admin/finder-reputation`, `/admin/found-reports`, `/admin/moderation`, `/admin/moderation/[caseId]`, `/admin/notifications`, `/admin/payments`, `/admin/recovery-requests`, `/admin/rewards`, `/admin/subscriptions`, `/admin/verification-requests`

## Mobile issue matrix

| Surface/routes | Viewports | Status | Confirmed issue/root cause | Repair |
|---|---|---|---|---|
| Global shell/all routes | 320–1024 CSS contract | FIXED | Global body padding produced inset pages and body overflow risk | Removed body padding, added device viewport and safe-area tokens |
| Marketing navigation | 320–767 CSS contract | FIXED | Transparent/white drawer made links unreadable | Opaque full-height drawer, dark text, 44px+ targets |
| Community feed | 320–560 CSS contract | FIXED | Clipped tab/navigation rows, desktop nested spacing, cramped actions | Intentional internal scrolling, edge-to-edge cards, fluid type/actions |
| Community search | 320–560 CSS contract | FIXED | Input/action row compressed below usable width | 16px input, mobile grid, reachable actions |
| Community post cards | 320–560 CSS contract | FIXED | Four actions and long content could overflow | `minmax(0,1fr)`, compact labels, media height cap |
| Composer/report/claim overlays | 320–767 CSS contract | FIXED | Modal fields/footer clipped by mobile viewport/keyboard | `100dvh`, safe-area padding, scrollable sheet and sticky footer |
| Dashboard header | 320–767 CSS contract | FIXED | Desktop header consumed excessive first-screen height | Compact app bar with title, menu and notification action |
| Dashboard drawer | 320–991 CSS contract | FIXED | Long navigation and plan card overlapped/cut off | Independent nav scrolling, fixed plan card, safe-area height |
| Dashboard navigation | 320–767 CSS contract | FIXED | No stable app-like shortcut navigation | Shared five-item fixed bottom navigation and content inset |
| Dashboard cards/forms | 320–767 CSS contract | FIXED | Desktop grids and sticky actions crowded phones | Single column, consistent 16px padding, CTA above bottom nav |
| Tables/admin/data routes | 320–767 CSS contract | FIXED | Wide data tables escaped page viewport | Controlled internal horizontal scroll; body remains fixed |
| Login/signup | 320–767 CSS contract | FIXED | Small input text and old accent palette | 16px controls, fluid heading, approved blue, compact form-first layout |
| Reduced motion | all | FIXED | Drawers retained transition for motion-sensitive users | Motion transitions disabled under user preference |
| Real iOS/Samsung/Firefox devices | physical devices | BLOCKED | No physical-device farm connected | Real-device keyboard, camera, browser-bar and upload checks pending |
| Authenticated destructive/financial flows | live production | BLOCKED | QA must not create claims/payments/moderation side effects | Requires dedicated seeded staging accounts |

## Verification policy

`tests/mobile/responsive-contract.test.ts` inventories page files, rejects placeholder links, and checks the shared safe-area/mobile-shell contract. Browser/device claims are recorded only when actually executed; static CSS contract coverage is not represented as physical-device verification.
