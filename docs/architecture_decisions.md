# Architectural Decisions & Agent Log

## Session: 2026-04-09
### 1. Legacy JS Polyfill Elimination
- **Context:** PageSpeed Insights flagged 26 KiB of Legacy JS. Next.js injected Babel polyfills (like `Array.prototype.at`) mostly to support Safari 15.0. 
- **Decision:** Updated `package.json` browserslist to target `safari >= 16.4`, `ios_saf >= 16.4`, `chrome >= 100`. This dropped 13.7 KiB of chunk payload. We accepted the tradeoff of dropping outdated iPhone users (iOS 15 and below).

### 2. Dynamic WhatsApp Geo-Routing
- **Context:** User needed `ID` (Indonesia) to route to `+62 821-1704-707` and `MY` (Malaysia/Other) to `+60 17-483 3318`.
- **Constraint:** Using `cookies()` or context to calculate region would break Static Site Generation (SSG) in Next.js App Router for heavily cached pages.
- **Decision:** Implemented "Smart Redirect API" at `src/app/api/whatsapp/route.ts`. All client links are static pointing to `/api/whatsapp`. The Edge/API route reads the Cloudflare `cf-ipcountry` header on-the-fly and issues a 302 redirect. SSG is preserved, and links remain dynamic.

### 3. UI Bug Fix
- **Context:** Course tags bottom-edge clipping on `CourseCard` because `tagsContainer` had a static height of `66px` with padding overflow. 
- **Decision:** Handled via increasing `height` to `84px` and adding `margin-bottom` in `CourseCard.module.css`.
