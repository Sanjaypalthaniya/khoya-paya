# Khoya Paya UI/UX audit and QA matrix

Date: 2026-07-22

## Scope and source of truth

The community inner-page experience is the visual source of truth. Its purple brand colour, pale lavender page background, white surfaces, restrained shadow, 12–20px radii, Inter/Geist typography, and semantic lost/found colours now form the shared UI contract in `app/ui-system.css`.

This sprint intentionally changes no routes, APIs, data models, authentication, payments, moderation rules, or form submission logic.

## Audit findings

| Area | Finding | Resolution |
| --- | --- | --- |
| Theme | Marketing, dashboard, and community CSS exposed competing teal, monochrome, blue, and purple token sets. | Added one last-loaded token contract with backward-compatible `--kp-*` aliases. |
| Buttons | Multiple height, radius, colour, hover, focus, disabled, and active conventions existed. | Standardized existing button variants to 40/46/52px controls, 12px radius, consistent interaction states, and purple primary action. |
| Forms | Control borders, focus rings, type sizes, and mobile zoom behaviour varied by feature. | Unified shared form contexts to 46px minimum height, 16px input text, semantic invalid state, and visible focus. |
| Cards | Inner pages used related but inconsistent borders, radii, and shadows. | Normalized major existing card classes to the shared surface, border, card radius, and restrained elevation. |
| Typography | Geist and Inter were mixed and small metadata was common. | Defined a single Inter/Geist system stack and a fluid display/page/section/body scale. |
| Responsive | Long IDs, media, tables, grids, and fixed action bars could escape narrow viewports. | Added 320px floor, global min-width safeguards, intrinsic media sizing, scroll-contained tables, wrapping, and safe-area action offsets. |
| Mobile navigation | Bottom navigation and sticky actions could overlap content or device safe areas. | Added conditional body clearance, safe-area-aware nav height, 44px targets, and sticky action offsets. |
| Overlays | Composer modal was desktop-centred on small screens and could compete with the keyboard. | Converts to a safe-area-aware mobile bottom sheet with bounded dynamic viewport height. |
| Accessibility | Focus treatments differed; reduced motion and forced colours had no shared fallback. | Added global `:focus-visible`, reduced-motion, forced-colour, touch-target, text scaling, and contrast-preserving semantic tokens. |
| Public menu | Mobile menu lacked explicit overlay semantics. | Added labelled dialog semantics while preserving the existing Escape and scroll-lock behaviour. |
| Action intent | Several controls relied on the browser's implicit button type, creating accidental-submit risk when reused inside forms. | Added explicit submit/button intent to verified public, community, settings, feature-preview, and navigation controls. |
| Async feed | Feed loading was visually represented but its busy state was not exposed consistently to assistive technology. | Added container `aria-busy` and a live status role to the skeleton state. |
| CSS architecture | Existing feature styles are large and layered; deleting them without visual regression coverage would be unsafe. | Added a compatibility layer instead of destructive CSS removal. Legacy cleanup remains incremental. |

## Route family QA matrix

`Static` means source/build validation. `Visual` requires browser viewport inspection and is not claimed where the browser environment was unavailable.

| Route family | Representative routes | Static/build | Shared UI contract | Visual viewport QA |
| --- | --- | --- | --- | --- |
| Community | `/`, `/community/posts/[postId]`, `/lost-items` | Pass | Applied | Blocked |
| Public marketing | `/about`, `/how-it-works`, `/pricing`, `/faq`, `/contact` | Pass | Applied | Blocked |
| Authentication | `/login`, `/signup` | Pass | Applied | Blocked |
| Recovery/finder | `/recover`, `/recover/[recoveryCode]`, `/found/[uniqueCode]`, `/report-found-item` | Pass | Applied | Blocked |
| Dashboard | `/dashboard`, items, scans, messages, notifications, settings, billing | Pass | Applied | Blocked |
| Claims/chat | `/dashboard/claims`, `/dashboard/chats`, `/chat/finder/[token]` | Pass | Applied | Blocked |
| Admin | `/admin` and admin tables/moderation routes | Pass | Applied to shared primitives | Blocked |
| Legal/error | privacy, terms, generated not-found | Pass | Applied | Blocked |

## Viewport checklist

CSS constraints explicitly cover 320–374px compact mobile, 375–767px mobile, 768–991px tablet, and desktop widths through the existing fluid containers. Required visual checks at 320, 360, 375, 390, 414, 768, 820, 1024, 1280, 1366, 1440, and 1920 remain blocked until an interactive browser session is available.

For each visual check, verify header/footer, horizontal overflow, focus order, control targets, text wrapping, cards, tables, modal/bottom-sheet behaviour, empty/loading/error states, and safe-area clearance.

## Automated verification

- TypeScript: pass
- ESLint (`--max-warnings=0`): pass
- Automated tests: 39/39 pass
- Production build: pass; 98 static pages generated and all application routes compiled
- Existing browser tests: no browser-test script is defined
- Interactive viewport inspection: blocked by the browser runtime policy in this environment

## Remaining work

- Run the visual viewport checklist when the in-app browser is available.
- Continue feature-by-feature removal of obsolete legacy CSS only with screenshot regression coverage.
- Validate authenticated interactions manually with non-production test accounts: item CRUD, QR, finder messages, community actions, claims, moderation, and payments.
