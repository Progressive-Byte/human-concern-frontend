# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured. There is no `test` script.

## Architecture Overview

Next.js 16 App Router project using React 19, Tailwind CSS v4, and JavaScript (no TypeScript).

### Route groups

| Group | Path prefix | Purpose |
|---|---|---|
| `(site)` | `/`, `/campaigns` | Public-facing marketing pages |
| `(auth)` | `/user/*`, `/admin/*` (auth pages) | Login / register / password reset |
| `dashboard` | `/dashboard/*` | Authenticated user portal |
| `admin` | `/admin/*` | Admin panel |
| `donate` | `/donate/[step]` | Legacy donation wizard (direct, no campaign) |
| `[campaignSlug]` | `/[slug]/[step]` | Primary donation wizard entry via campaign page |

### Donate wizard (`src/app/donate/steps/`)

Step components live in `src/app/donate/steps/` and are shared between two dynamic routes:
- `src/app/[campaignSlug]/[step]/page.jsx` — primary entry, receives `campaignSlug` prop
- `src/app/donate/[step]/page.jsx` — legacy fallback (no slug prop)

Both routes map step numbers 1–8 to the same `STEPS` array. Navigation is managed by `useStepNavigation`, which reads `data.campaign` from context to build the base URL: `/${data.campaign}` if set, else `/donate`.

**Step order:** Info → Cause → Objective (Ramadan only) → Payment → Add-ons → Summary → Payment Details → Confirmation

When `data.isRamadan` is false, Step 3 (Objective) is skipped — Step 2 navigates directly to Step 4, and `StepLayout` adjusts the displayed step number (`displayStep = step > 3 ? step - 1 : step`).

**Wizard entry point** is `DonationWidget` (`src/app/(site)/campaigns/[slug]/components/DonationWidget.jsx`), which:
1. Detects `isRamadan` by checking if any campaign category name equals `"ramadan"` (case-insensitive)
2. Writes `sessionStorage["donationIsRamadan"]` (`"1"` or `"0"`) and `sessionStorage["campaignData"]` (JSON with fields: `id`, `name`, `description`, `suggestedAmounts`, `addOns`, `goalsDates`, `causes`, `donationObjectives`)
3. Pushes to `/${campaign.slug}/1?amount=…&currency=…`

Step 1 (`Step1Info`) reads `campaignSlug` prop or `?campaign` query param and stores it as `data.campaign` in context. Campaign metadata is read from `sessionStorage["campaignData"]` via `useMemo` in steps that need it.

**Payment submission flow:**
- Step 7 (`Step7PaymentDetails`) calls `POST donations/submit` which creates the donation record and returns `clientSecret`, `publishableKey`, `donationId`, and optionally `guestSessionId`
- Step 8 (`Step8Confirmation`) initializes Stripe `Elements` with the `clientSecret` from context and renders `StripeCheckoutForm` for card entry
- For recurring payments, Stripe `confirmSetup` is used and a `POST payment/setup-intent/confirm` finalises the subscription; for one-time, `confirmPayment` is used directly

### DonationContext (`src/context/DonationContext.jsx`)

All wizard state lives in `DonationContext`. The base `useState` initialises a minimal shape; steps extend it freely via `update(fields)`. Key fields accumulated across steps: `campaign` (slug), `campaignId`, `campaignTitle`, `isRamadan`, `maxStep`, `amount`, `currency`, `firstName`, `lastName`, `email`, `phone`, `country`, `addressLine1`, `city`, `province`, `zip`, `causeIds`, `causes`, `objective`, `objectiveLabel`, `paymentType`, `scheduleType`, `scheduleConfig`, `installmentCount`, `numberOfDays`, `frequency`, `amountTier`, `tipPct`, `addOnBreakdown`, `grandTotal`, `anonymous`, `paymentMethod`, `donationId`, `guestSessionId`, `stripeClientSecret`, `stripePublishableKey`.

### API layer

All API calls go through `src/services/api.js`. In development, Next.js rewrites `/api/v1/*` to `https://donation.api.sagsio.com/api/v1/*` (configured in `next.config.mjs`). `apiBase` is `/api/v1/` (with trailing slash), so endpoints are passed without a leading slash (e.g. `"donations/submit"`).

Two request helpers: `apiRequest` (reads `token` cookie) and `adminApiRequest` (reads `adminToken` cookie). Both attach a `Bearer` token and throw an `Error` with the server's message on non-OK responses.

Service modules wrap the helpers:
- `campaignService.js` — `getCampaigns()`, `getCampaignById(id)`
- `donationService.js` — `createDonation(payload)`, `getUserDonations()`
- `authService.js` — user login/register
- `adminAuthService.js` — admin login

### Auth

- **User auth:** `AuthContext` — exposes `{ user, loading, isAuthenticated, login, register, logout }`. Stores user object in `localStorage["hc_user"]` and JWT in `token` cookie. Consumed via `useAuth()` from `@/context/AuthContext`.
- **Admin auth:** `AdminAuthContext` — separate context, uses `adminToken` cookie.
- **Middleware** (`src/middleware.js`) guards `/dashboard/*` (requires `token`) and `/admin/*` (requires `adminToken`), and redirects authenticated users away from auth pages.

### Path aliases

`@/` maps to `src/` (configured in `jsconfig.json`).

### Styling

Tailwind CSS v4 with inline utility classes. Color palette uses hex literals directly (e.g. `#EA3335` for red, `#055A46` for green, `#383838` for primary text, `#737373` / `#8C8C8C` / `#AEAEAE` for muted text). No CSS variables or theme tokens are defined.

### Shared UI components (`src/components/ui/`)

`Field`, `Input`, `Select`, `Toggle`, `Stepper`, `NumberInput`, `Row`, `Button`, `Card` — used across wizard steps. `CustomDropdown` in `src/components/common/` is used for searchable country/state/city selects (`country-state-city` package).
