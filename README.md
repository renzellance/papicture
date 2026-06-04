# papicture

One selfie → every photo you need to submit. A mobile-first web app that turns a
single selfie into submission-ready ID, visa and profile photos for the
Philippine market — sold as a **digital file** or a **printed set delivered**.

This is a working prototype built from the [Claude Design](https://claude.ai/design)
handoff bundle, reimplemented as a **Next.js (App Router) + TypeScript** app that
runs on **Vercel**.

## What's real

| Piece | Status |
| --- | --- |
| Full 9-screen funnel | ✅ landing → upload → processing → preview → delivery → format → look → checkout → confirmation |
| Real photo capture / upload | ✅ native camera + file picker, downscaled client-side |
| Studio generation (`/api/generate`) | ✅ real server-side image processing with `sharp` (orient, even exposure, gentle lift). **This is the AI seam** — see below |
| Per-format layout | ✅ your real photo is cropped/composited into every format & background, with full-res download |
| Payment (`/api/checkout`) | ✅ **PayRex** hosted checkout in test mode, with a zero-config mock fallback |

## What's deliberately stubbed

- **AI attire / background swap** — the real moat. `/api/generate` currently does
  honest cleanup only (it does **not** fabricate clothing or reshape the face,
  which keeps visa / document-safe looks truthful). The hook to call a real image
  model is marked in `app/api/generate/route.ts` behind `USE_AI_STUDIO`.
- **Email delivery** — the confirmation screen promises an emailed file; wire an
  email provider (Resend/Postmark) to send for real. The download button already
  produces the real full-res file client-side.
- **Order persistence / Manager UI** — orders aren't stored server-side yet
  (the funnel uses `sessionStorage` to survive the payment redirect). A DB +
  webhook + admin dashboard is the next layer.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

It runs with **zero configuration**: with no PayRex key set, "Pay" routes to a
built-in mock checkout page so you can click all the way to the confirmation.

## Configuration

Copy `.env.example` to `.env.local` and fill in what you want to enable:

| Variable | Effect |
| --- | --- |
| `PAYREX_SECRET_KEY` | When set, `/api/checkout` creates a **real PayRex test-mode** hosted CheckoutSession (GCash / Maya / card) instead of the mock page. Get test keys at the [PayRex dashboard](https://dashboard.payrexhq.com). |
| `PAYREX_PAYMENT_METHODS` | Comma-separated methods to offer (default `card,gcash,maya`). |
| `USE_AI_STUDIO` | Reserved flag for switching the studio look to a real image model. |

### PayRex flow (when a key is set)

1. `POST /api/checkout` creates a hosted `CheckoutSession` server-side with the
   secret key (amount in centavos, `currency=PHP`, `payment_methods[]`).
2. The customer is redirected to PayRex, pays, and is sent back to
   `/?paid=1&order=…` (`success_url`) or `/?paid=0` (`cancel_url`).
3. The app restores the order from `sessionStorage` and shows the confirmation.

For production you should additionally verify payment with a PayRex
[webhook](https://docs.payrexhq.com/docs/guide/developer_handbook/webhooks)
rather than trusting the redirect.

## Deploy to Vercel

Push the repo and import it in Vercel. No env vars are required for the mock
flow; add `PAYREX_SECRET_KEY` to enable real test-mode payments. `sharp` is
supported on Vercel's Node.js runtime out of the box.

## Project layout

```
app/
  page.tsx              funnel state machine + payment-return handling
  layout.tsx            root layout, fonts, metadata
  globals.css           the design system (ported verbatim from the bundle)
  mock-pay/page.tsx     zero-config stand-in for the PayRex hosted checkout
  api/
    generate/route.ts   studio photo generation (sharp) — the AI seam
    checkout/route.ts   PayRex CheckoutSession + mock fallback
components/
  ui.tsx                shared primitives (Portrait, BeforeAfter, Btn, …)
  screens/              the nine screens (A: capture, B: catalog, C: order)
lib/
  data.ts               looks + formats catalog
  image.ts              client canvas helpers (downscale, final render)
  storage.ts            sessionStorage order mirror
  types.ts              shared types
```
