# Human Recovery Network — visual audit

## Scope inspected

The audit covers the shared global styles, marketing homepage, authentication, community feed, dashboard, recovery/QR flows, messaging, notifications, pricing, legal pages, and admin data views. It is strictly presentational; no functional recommendation is included.

## Findings

| Area | Visual issue | UI-only direction |
| --- | --- | --- |
| Brand | Teal, monochrome, blue, and purple systems compete across layered stylesheets. | Establish one indigo brand action colour with coral Lost and green Found/Recovered semantics. |
| Typography | Geist, Inter, and page-specific stacks produce inconsistent rhythm; multilingual fallback is incomplete. | Use Manrope with Noto Sans Devanagari/system fallbacks and a fluid, readable scale. |
| Hierarchy | Some dashboards use very small labels while marketing headings are disproportionately large. | Normalize display, page, section, card, body, label, and metadata roles. |
| Spacing | Legacy 4px values and newer 8px values are mixed; dense tables and oversized landing sections coexist. | Adopt a documented 4/8px spacing scale and responsive section spacing. |
| Shape | Pills, 28–38px cards, 10–14px controls, and square legacy elements coexist. | Use 10–14px controls, 16–20px cards, 22–26px overlays, and pills only for badges/chips. |
| Depth | Some surfaces have no separation while hero artwork and dashboard cards use heavy floating shadows. | Prefer borders and surface contrast; reserve stronger elevation for dropdowns and modals. |
| Controls | Button height, focus, disabled, and loading presentation vary between Bootstrap and custom controls. | Apply one visual state contract without changing element type, text, destination, or handler. |
| Cards | Feed, recovery, dashboard, and admin cards use different padding and metadata scales. | Normalize surface, border, padding, image framing, metadata, and subtle hover feedback. |
| Tables | Several admin/report tables still look like default Bootstrap tables and overflow on narrow screens. | Use restrained headers, consistent row spacing, hover tint, and scroll-contained wrappers. |
| Responsive UI | Fixed artwork, dense action rows, tables, and drawers are the highest visual overflow risks below 390px. | Preserve every action while allowing wrapping, horizontal scrolling, safe-area spacing, and bounded overlays. |
| Accessibility | Focus treatment is mostly present, but tiny metadata and muted purple text can fall below comfortable readability. | Strengthen contrast, use 44px mobile targets, visible focus rings, and reduced-motion fallbacks. |
| Repetition | Large legacy stylesheets repeat colours, radii, and shadows as literals. | Add a final compatibility token layer so existing class names and behavior remain intact. |

## Protected functionality

Routes, APIs, Prisma/database code, authentication, permissions, data structures, component props, event handlers, validation, search/filter logic, uploads, QR behavior, messaging, notifications, and recovery workflows are outside this redesign scope.
