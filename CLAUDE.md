# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.

## Architecture Overview

This is a **Next.js App Router** project using React 19 and Tailwind CSS 4.

### Routing

Routes live in `src/app/` using the App Router convention with route groups:
- `(site)/` — public-facing pages (home, campaign listing)
- `(auth)/` — login, register, password reset
- `[campaignSlug]/` — dynamic campaign detail
- `dashboard/` — authenticated user area
- `admin/` — admin-only panel
- `donate/` — donation flow

Route protection is handled in `src/middleware.js`: unauthenticated users are redirected to `/user/login`; admin routes require a separate `adminToken` cookie.

### API Layer

All HTTP calls go through `src/services/api.js`:
- `apiRequest()` — client-side only, attaches the user `token` cookie as a Bearer header
- `adminApiRequest()` — attaches `adminToken`
- `apiBase` (`/api/v1/`) is rewritten by `next.config.mjs` to `https://donation.api.sagsio.com/api/v1/`
- `serverApiBase` (`https://donation.api.sagsio.com/api/v1/`) is used directly in server components

On any `401` response, `api.js` dispatches `window.dispatchEvent(new CustomEvent("auth:unauthorized"))` — never throw/handle 401s manually in components.

Domain services (`authService.js`, `campaignService.js`, `donationService.js`, `admin.js`, `adminAuthService.js`) wrap `apiRequest`/`adminApiRequest` and are the only place that should call the API directly.

Campaign detail pages (`(site)/campaigns/[slug]/page.jsx`) fetch server-side with ISR (`revalidate: 60`) using `serverApiBase`. All other data fetching is client-side via `apiRequest`.

### Authentication

Two independent auth systems:
- **User auth**: `AuthContext` (`src/context/AuthContext.jsx`) — stores `hc_user` in localStorage and a `token` cookie. Exposes `useAuth()` hook with `login()`, `register()`, `logout()`. On mount, decodes the JWT `exp` to immediately logout if expired; sets a `setTimeout` to auto-logout when the token expires. Listens for `auth:unauthorized` as a fallback for mid-session 401s.
- **Admin auth**: `AdminAuthContext` (`src/context/AdminAuthContext.jsx`) — uses an `adminToken` cookie only; no auto-expiry logic.

`src/hooks/useAuth.js` is a legacy re-export shim — import `useAuth` from `@/context/AuthContext` directly.

### Donation Flow

The same 8 step components are shared across two URL patterns:
- `/donate/[step]` — generic flow, no campaign context
- `/[campaignSlug]/[step]` — campaign-specific flow

`useStepNavigation` (`src/hooks/useStepNavigation.js`) reads `data.campaign` from `DonationContext` to determine the base route and pushes steps by number.

**Step breakdown:**
- **Step 1** — Personal info (name, email, phone, address via `country-state-city` dropdowns), cause selection (from `campaignData.causes`), and Ramadan objective selection (only if `data.isRamadan`). Validates required fields + at least one cause selected.
- **Step 2** — Redirect stub; cause selection moved into Step 1. Immediately redirects to Step 4.
- **Step 3** — Redirect stub; objective selection moved into Step 1. Immediately redirects to Step 4.
- **Step 4** — Donation amount (suggested tiles + custom input validated against `minDonation`/`maxDonation`), currency (USD/GBP/EUR/CAD), payment type (one-time or recurring). Recurring adds schedule: "specific_dates" (multi-select via `MiniCalendar`) or "date_range" (startDate + endDate + frequency: daily/weekly/monthly).
- **Step 5** — Optional add-ons (fixed or formula-based pricing with user inputs) and tipping slider (0–15%, configurable per campaign). Displays `grandTotal`.
- **Step 6** — Summary: reviews payment schedule and add-on breakdown.
- **Step 7** — Payment details, gateway selection (Stripe/PayPal), submits to `donations/submit`, stores `stripeClientSecret` + `stripePublishableKey` + `donationId` in `DonationContext`.
- **Step 8** — Stripe card entry via `StripeCheckoutForm` (PayPal shows "coming soon").

Step 1 uses `country-state-city` (npm package) for ISO-code-aware Country/State/City dropdowns. It includes a hardcoded `ISO3_TO_ISO2` map to handle legacy API country codes.

**Campaign sessionStorage schema** — the campaign detail page writes `campaignData` before the user enters the donate flow:
```js
{
  id, name, suggestedAmounts,
  causes: [{ id, name, description, iconEmoji, zakatEligible }],
  donationObjectives: [{ id, name, description }],          // Ramadan only
  addOns: [{ id, name, iconEmoji, amount,
    pricing: { type: "fixed"|"formula", baseUnitAmount,
      inputs: [{ key, label, defaultValue }], formula } }],
  goalsDates: { allowRecurringDonations, minimumDonation, maximumDonation, enableTipping }
}
```
`donationIsRamadan` is a separate sessionStorage key (`"1"` / absent).

### State Management

React Context only — no Redux or Zustand. The two auth contexts above plus `DonationContext` (`src/context/DonationContext.jsx`), which holds all multi-step donation form state and exposes `useDonation()`. `DonationProvider` wraps both `/donate` and `/[campaignSlug]` layouts.

Key `DonationContext` fields: `campaign`, `campaignId`, `isRamadan`, `causeIds`, `causes`, `objective`, `objectiveLabel`, `amount`, `amountTier`, `currency`, `paymentType`, `frequency`, `scheduleType`, `scheduleConfig`, `installmentCount`, `numberOfDays`, `tipPct`, `addOnsTotal`, `grandTotal`, `addOnBreakdown`, `anonymous`, `paymentMethod`, `stripeClientSecret`, `stripePublishableKey`, `donationId`, `guestSessionId`, and donor address fields (`addressLine1`, `city`, `province`, `zip`, `country`).

### Component Conventions

- Mark interactive components with `"use client"` at the top.
- Shared primitives go in `src/components/ui/` (`Field`, `Select`, `Toggle`, `Button`, `OutlineButton`, `Card`, `Row`, `Input`, `NumberInput`, `Stepper`).
- Layout chrome (Navbar, Footer, Sidebar, AdminSidebar) lives in `src/components/layout/`.
- Page-specific components live alongside the page: `src/app/dashboard/components/`, `src/app/admin/components/`, etc.

### Path Alias

`@/*` maps to `./src/*` (configured in `jsconfig.json`). Use `@/` imports throughout.

### Utilities

- `src/utils/cookies.js` — `getCookie`, `setCookie`, `deleteCookie`
- `src/utils/helpers.js` — `formatCurrency(value, currency, locale)`, `formatDate(value, locale)`
- `src/utils/constants.js` — `apiBase`, `serverApiBase`, `siteUrl`

Remote images are served from `donation.api.sagsio.com` (whitelisted in `next.config.mjs`). Local static assets go in `public/images/`.
