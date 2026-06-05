# CLAUDE.md — papicture

Project memory for coding agents. Read this before making changes. Keep it
current when decisions change.

## What this is

**papicture** — a mobile-first web app: one selfie → every submission-ready
photo a Filipino needs (IDs, visas, work/profile headshots). Sold as a **digital
file** (₱149) or a **printed set delivered nationwide** (from ₱249).

Origin: a Claude Design HTML/CSS prototype, reimplemented as a real Next.js app.
The original design bundle (chats + prototype) is the source of intent — its copy
rules and catalog are authoritative.

### Market wedge (from the design research, don't lose this)
- PH photo shops sell **sets of copies at a flat price, delivered** — never
  single pieces. The catalog reflects this (digital = per-file; print = copy-count
  sets).
- The **moat is AI attire + background swap**: local shops explicitly refuse to
  edit attire / remove filters. That is papicture's differentiator.
- "Passport size" is for **visas / NBI / school**, never the DFA ePassport
  appointment (those are shot on-site). Copy must not imply otherwise.

## Stack & architecture

- **Next.js 14 (App Router) + TypeScript**, deployed on **Vercel**. `sharp` for
  server image work (Node runtime).
- **No DB.** The funnel is a client state machine (`app/page.tsx`) holding an
  `Order` object; it's mirrored to `sessionStorage` (`lib/storage.ts`) so it
  survives the payment redirect. Server routes are stateless.
- **9-screen funnel:** landing → upload → processing → preview → fulfillment
  (delivery) → format → look → checkout → confirmation.

### File map
```
app/page.tsx            funnel state machine + payment-return + two-pane shell
app/layout.tsx          root layout, fonts, metadata
app/globals.css         THE design system (ported verbatim) + desktop two-pane
app/mock-pay/page.tsx   zero-config stand-in for PayRex hosted checkout
app/privacy, app/terms  real legal routes (genuine starter content)
app/api/generate/route  studio photo generation (sharp) — the AI seam
app/api/checkout/route  PayRex CheckoutSession + mock fallback
components/ui.tsx        primitives: Portrait, BeforeAfter, Btn, Swatches, ...
components/CameraCapture real getUserMedia camera + file fallback
components/PreviewRail   desktop right-pane preview + LandingAside (hidden on mobile)
components/SiteChrome    brand + nav: SiteHeader/Footer (desktop) + landing mobile nav
components/screens/      ScreensA (capture) / B (catalog) / C (order)
lib/data.ts             looks + formats catalog (+ `px` target sizes)
lib/image.ts            client canvas: downscale + full-res final render
lib/order.ts            downloadFinalPhoto(order) — shared by rail + confirmation
lib/storage.ts          sessionStorage order mirror
lib/types.ts            Order + catalog types
```

## Decisions locked (with rationale)

- **Payment = PayRex test mode, with a zero-config mock fallback.** With no
  `PAYREX_SECRET_KEY`, `/api/checkout` returns a URL to `/mock-pay` so the app is
  clickable end-to-end on Vercel with no setup. Set the key to use the real
  hosted CheckoutSession (GCash/Maya/card; amounts in **centavos**, `currency=PHP`).
  Flow: create session server-side → redirect → `success_url=/?paid=1&order=…` →
  restore order from sessionStorage → confirmation. Production should add a PayRex
  **webhook** instead of trusting the redirect.
- **Studio generation is real but honest.** `/api/generate` uses `sharp`
  (orient, normalize, gentle lift, sharpen). It does **not** fabricate attire or
  reshape the face — this keeps visa / document-safe looks truthful. The real
  attire-swap model is a marked seam behind `USE_AI_STUDIO` in that route.
- **Photo layout is client-side.** The uploaded photo is downscaled in-browser,
  shown via `Portrait` (object-fit cover) per format/bg, and the downloadable
  full-res file is rendered with canvas (`lib/image.ts`). bg flatten + circle crop
  are wired even though cover-crop hides bg until real segmentation exists.
- **Camera = real `getUserMedia`** (`components/CameraCapture.tsx`), live video +
  canvas shutter, mirrored to match the selfie preview. Falls back to the native
  `<input capture>` if denied/unavailable. Needs HTTPS (Vercel ✓, localhost ✓).
- **Desktop = one consistent focus card (≥900px); mobile = single column,
  unchanged.** Every screen uses the **same** card size (no width jump). Inside:
  funnel + landing are two-pane (controls left + right pane via `.pa-split`),
  processing is full-card immersive. The right pane is `PreviewRail` (funnel,
  shows the real photo in the live selection) or `LandingAside` (landing proof
  sheet). Screens with a big inline hero (landing proof sheet, preview slider,
  confirmation photo) mark it `.pa-hide-desktop` since the right pane carries it.
- **Brand + nav live OUTSIDE the card (desktop), and on mobile landing.**
  `SiteHeader`/`SiteFooter` are the page chrome on desktop (CSS-hidden on mobile
  in the app shell, but always shown on the legal pages). On mobile the **landing**
  screen carries its own `LandingTopBar` (brand + menu) and `LandingFooter`; the
  funnel stays distraction-free (no global bar). Nav links are **real**: How it
  works / Pricing scroll to landing sections (`#how-it-works`, `#pricing`, also
  reachable via `/#…` hash from the legal routes); Privacy / Terms are real routes;
  Contact is a mailto (`hello@papicture.com`, a placeholder address). The standard
  disclaimer lives in the footer on both platforms.

## Conventions

- **Design system lives in `app/globals.css`** with the `pa-*` class vocabulary
  (`pa-app`, `pa-tile`, `pa-dock`, `pa-block-ink`, `pa-chip`, ...). Reuse these;
  don't introduce a CSS framework or new tokens. Palette: warm paper + ink +
  **one** blue accent (`--accent: #22489c`). Fonts: Space Grotesk (display),
  Hanken Grotesk (body), Space Mono (labels/refs).
- **Copy rules (from the design chats — enforce these):** no em-dash reassurance
  cadence ("X — pay only when…"), no filler badges/pills, no AI-slop ("natural
  results that keep your likeness", etc.). Plain, factual, short. Consistent
  disclaimer: *"papicture is not affiliated with any government agency. Acceptance
  is decided by the requesting office, so please check the latest requirements
  before you submit."*
- Mobile-first; the device frame is `.pa-device` (phone column on mobile,
  two-pane card on desktop for funnel screens).

## Studio AI (the moat) — selfie → studio portrait

The core magic is a **generative** transformation of an ordinary selfie (any bg,
phone lighting) into a real studio portrait: relight + clean backdrop + optional
attire, **identity locked** (change attire/light/bg only, never the face).
Pipelines split by look:
- **As is / smart casual / formal / studio / linkedin** → generative (the magic).
- **Document-safe / visa** → NEVER generative (legal/truthful): crop/resize/bg/
  exposure only. See `isGenerative()` in `lib/studio/prompts.ts`.

Provider abstraction in `lib/studio/` (`getProvider()` by `STUDIO_PROVIDER`):
- `mock` — zero-key sharp cleanup (default, no real transform).
- `gemini` — Gemini 2.5 Flash Image ("nano banana"). Best single-image identity,
  ~$0.039/img (free 500/day for testing). **Free tier may train on inputs — use a
  PAID key + Zero Data Retention for real user selfies.** Final tier later: Nano
  Banana Pro + upscale/face-restore, payment-gated server-side.

**Wired into the app:** `/api/generate` uses `lib/studio`. Processing generates the
base **As is** studio photo; `LookScreen` regenerates on look/attire change (and a
Regenerate button), updating `order.studio` (tracked by `studioLook`/`studioSub`).
Visa/strict formats force the non-generative path. On Vercel, set `STUDIO_PROVIDER=gemini`
+ `GEMINI_API_KEY`; with no key it stays on `mock` (sharp cleanup). Keep `lib/studio`
**server-only** (it imports `sharp`) — never import it into client components.

Tiers: currently a single ~1024px **preview** is used for display + download. Next:
a post-pay **final** tier (Nano Banana Pro + upscale/face-restore) generated and
returned **only after payment is verified** server-side (so the clean full-res isn't
client-side pre-payment); plus burned-in preview watermark.

## Stubbed / next layers

- **Final tier + payment gating** — high-res post-pay gen, server-gated on paid.
- **Email delivery** — confirmation promises an emailed file; download works
  client-side. Wire Resend/Postmark to actually send.
- **Server-side orders + PayRex webhook + Manager UI** (dashboard, orders,
  print-shop handoff) — not built; reuse this design system when adding.

## Commands & env

```bash
npm run dev      # http://localhost:3000
npm run build
npm run start
```
Env (`.env.example`): `PAYREX_SECRET_KEY`, `PAYREX_PAYMENT_METHODS`
(default `card,gcash,maya`), `USE_AI_STUDIO`. None required for the mock flow.

## Git

Active branch: `claude/clever-fermi-80NbR`. Don't push elsewhere without asking.
PayRex docs: https://docs.payrexhq.com/docs/api/checkout_sessions/create
