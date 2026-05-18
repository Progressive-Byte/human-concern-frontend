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

This is a **Next.js App Router** project using React 19 and Tailwind CSS 4. Recharts is used for admin charts. `canvas-confetti` fires on the thank-you page. `emoji-picker-react` is used in the admin form wizard for cause/add-on icon selection.

### Routing

Routes live in `src/app/` using the App Router convention with route groups:
- `(site)/` — public-facing pages (home, campaign listing)
- `(auth)/user/` — user auth pages at `/user/login`, `/user/register`, `/user/forgot-password`, `/user/reset-password`
- `(auth)/admin/` — admin auth pages at `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` (has its own `layout.jsx`)
- `[campaignSlug]/` — campaign detail page (`page.jsx`) **and** the campaign-specific donation flow (`[step]/page.jsx`); its `layout.jsx` only wraps `DonationProvider`
- `dashboard/` — authenticated user area
- `admin/` — admin-only panel (campaigns, forms, donations, add-ons, categories, causes, donors, settings)
- `donate/` — generic donation flow (no campaign context); includes `thank-you/` page rendered after successful payment

Route protection is handled in `src/middleware.js`: unauthenticated users accessing `/dashboard` are redirected to `/user/login`; admin routes require a separate `adminToken` cookie. Authenticated users hitting auth pages are redirected back to their respective home (`/dashboard` or `/admin`).

Dashboard sub-routes: `donation-history`, `fund-breakdown`, `payment-methods`, `profile`, `schedules`, `schedules/[slug]`.

Admin sub-routes with dynamic params: `campaigns/[campaignId]`, `donors/[donorKey]`, `schedules/[donationId]`.

### API Layer

All HTTP calls go through `src/services/api.js`:
- `apiRequest()` — client-side only, attaches the user `token` cookie as a Bearer header
- `adminApiRequest()` — attaches `adminToken`
- `apiBase` (`/api/v1/`) is rewritten by `next.config.mjs` to `https://donation.api.sagsio.com/api/v1/`; `/uploads/:path*` is similarly proxied to the same host
- `serverApiBase` (`https://donation.api.sagsio.com/api/v1/`) is used directly in server components

On any `401` response, `api.js` dispatches `auth:unauthorized` (user token) or `admin:unauthorized` (adminToken) as a `CustomEvent` on `window` — never throw/handle 401s manually in components. When the request body is a `FormData` instance, `api.js` omits `Content-Type` so `fetch` sets the multipart boundary automatically.

Domain services (`authService.js`, `campaignService.js`, `donationService.js`, `admin.js`, `adminAuthService.js`) wrap `apiRequest`/`adminApiRequest` and are the only place that should call the API directly.

Campaign detail pages (`(site)/campaigns/[slug]/page.jsx`) fetch server-side with ISR (`revalidate: 60`) using `serverApiBase`. All other data fetching is client-side via `apiRequest`.

### Authentication

Two independent auth systems:
- **User auth**: `AuthContext` (`src/context/AuthContext.jsx`) — stores `hc_user` in localStorage and a `token` cookie. Exposes `useAuth()` hook with `login()`, `register()`, `logout()`. On mount, decodes the JWT `exp` to immediately logout if expired; sets a `setTimeout` to auto-logout when the token expires. Listens for `auth:unauthorized` as a fallback for mid-session 401s.
- **Admin auth**: `AdminAuthContext` (`src/context/AdminAuthContext.jsx`) — uses an `adminToken` cookie only; no auto-expiry logic.

`src/hooks/useAuth.js` is a legacy re-export shim — import `useAuth` from `@/context/AuthContext` directly.

### Donation Flow

The same 4 step components are shared across two URL patterns:
- `/donate/[step]` — generic flow, no campaign context
- `/[campaignSlug]/[step]` — campaign-specific flow

`useStepNavigation` (`src/hooks/useStepNavigation.js`) reads `data.campaign` from `DonationContext` to determine the base route and pushes steps by number. `handleNext(n?)` advances to step `n` (or `maxStep+1`) and updates `maxStep`; `handlePrev(n)` navigates to step `n`.

**Step breakdown** (visible in StepProgress as: Info → Payment → Add-ons & Pay → Confirmation):
- **Step 1** (`Step1Info.jsx`) — Personal info (name, email, phone, address via `country-state-city` dropdowns), cause selection (from `campaignData.causes`), and Ramadan objective selection (only if `data.isRamadan`). Validates required fields + at least one cause selected.
- **Step 2** (`Step2Payment.jsx`) — Donation amount (suggested tiles + custom input validated against `minDonation`/`maxDonation`), currency (USD/GBP/EUR/CAD), payment type (one-time or recurring). Recurring adds schedule: "specific_dates" (multi-select via `MiniCalendar`) or "date_range" (startDate + endDate + frequency: daily/weekly/monthly). Both schedule types support per-date custom amounts stored in `scheduleConfig.dateAmounts` (`{ [isoDate]: number }`), which override the default `amountTier` for that date. Recurring also has a `splitMode`: `"repeat"` (same amount each date) or `"divide"` (total ÷ occurrences). `donorAmount` stores the UI-visible total for back-navigation; `amountTier` is the per-payment amount. Redirects back to step 4 if donation was already submitted.
- **Step 3** (`Step3Addons.jsx`) — Optional add-ons (fixed or formula-based pricing with user inputs), tipping slider (0–15%, configurable per campaign), custom note input, and payment gateway selection (Stripe/PayPal). Submits via `apiRequest("donations/submit", ...)` directly, then stores `stripeClientSecret` + `stripePublishableKey` + `donationId` in `DonationContext`.
- **Step 4** (`Step4Confirmation.jsx`) — Stripe card entry via `StripeCheckoutForm` (PayPal shows "coming soon"). After payment, redirects to `/donate/thank-you`.

Step 1 uses `country-state-city` (npm package) for ISO-code-aware Country/State/City dropdowns. `src/utils/isoHelpers.js` provides `resolveCountryIso` and `resolveStateIso` to handle legacy API codes (ISO3 → ISO2 mapping).

`src/app/donate/steps/StepComponents/countOccurrences.jsx` exports `countOccurrences(startDate, endDate, frequency)` and `generateDatesInRange(startDate, endDate, frequency)` — used by Step 2 and `DonationPreview` to compute installment counts and expand date-range schedules.

`DonationPreview` (`StepComponents/DonationPreview.jsx`) is a sticky sidebar rendered in the step layout showing a live summary of all donation fields accumulated so far.

**Campaign sessionStorage schema** — the campaign detail page (`(site)/campaigns/[slug]/page.jsx`) normalizes `suggestedAmounts` from API objects `{value, description, isDefault}[]` into a flat number array, writing `campaignData` to sessionStorage before the user enters the donate flow:
```js
{
  id, name, suggestedAmounts,  // flat number[]
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

React Context only — no Redux or Zustand. The two auth contexts above plus `DonationContext` (`src/context/DonationContext.jsx`), which holds all multi-step donation form state and exposes `useDonation()` returning `{ data, update, reset }`. `DonationProvider` wraps both `/donate` and `/[campaignSlug]` layouts. State is persisted to sessionStorage under the key `hc_donation`; `reset()` clears both the context and sessionStorage (including `hc_donation_done`).

Key `DonationContext` fields: `campaign` (slug, used for routing), `campaignId`, `campaignTitle`, `isRamadan`, `zakatEligible`, `submitted`, `maxStep`, `amount`, `amountTier` (per-payment amount), `donorAmount` (UI-visible total, preserved on back-navigation), `currency`, `frequency`, `paymentType`, `splitMode` (`"repeat"`/`"divide"`), `scheduleType`, `scheduleConfig`, `schedulePreset`, `installmentCount`, `numberOfDays`, `perDateTotal` (pre-computed sum for specific_dates with overrides), `tipPct`, `customTipAmount`, `addOnsTotal`, `grandTotal`, `addOnBreakdown`, `donorMessage`, `anonymous`, `paymentMethod`, `stripeClientSecret`, `stripePublishableKey`, `donationId`, `guestSessionId`, `causeIds`, `causes`, `objective`, `objectiveLabel`, and donor fields (`firstName`, `lastName`, `email`, `phone`, `addressLine1`, `city`, `province`, `zip`, `country`).

`DonationSessionCleaner` (`src/components/common/DonationSessionCleaner.jsx`) auto-removes `hc_donation` from sessionStorage when the user navigates away from the donation flow (any path outside `/donate/*` or `/:slug/[1-4]`) without completing payment.

### Component Conventions

- Mark interactive components with `"use client"` at the top.
- Shared primitives go in `src/components/ui/` (`Field`, `Select`, `Toggle`, `Button`, `OutlineButton`, `Card`, `Row`, `Input`, `NumberInput`, `Stepper`, `Section`, `DetailRow`, `UserSectionHeader`, `UserToggle`).
- Common non-primitive components go in `src/components/common/` (`SvgIcon`, `CustomDropdown`, `FormInput`, `VideoModal`, `Pagination`).
- Layout chrome (Navbar, Footer, Sidebar, AdminSidebar, RouteProgressBar, Topnoticebar) lives in `src/components/layout/`.
- Page-specific components live alongside the page: `src/app/dashboard/components/`, `src/app/admin/components/`, etc.
- Admin form creation (`admin/forms/new/`) uses a wizard shell (`FormWizardShell`) with a `WizardFooterNav` and per-step components in order: Basics → GoalsDates → Causes → Objectives → Addons → Media → Review. `WizardStepPlaceholder` is the template to follow when adding a new step. Each wizard step imports `useToast` from `@/app/admin/campaigns/components/ToastProvider` for feedback.

### Path Alias

`@/*` maps to `./src/*` (configured in `jsconfig.json`). Use `@/` imports throughout.

### Utilities

- `src/utils/cookies.js` — `getCookie`, `setCookie`, `deleteCookie`
- `src/utils/helpers.js` — `formatCurrency(value, currency, locale)`, `formatDate(value, locale)`
- `src/utils/constants.js` — `apiBase`, `serverApiBase`, `siteUrl`
- `src/utils/isoHelpers.js` — `resolveCountryIso(value)`, `resolveStateIso(stateName, countryIso)` for normalizing legacy ISO3 country codes from the API
- `src/utils/validateRegister.js` — registration form validation

Remote images are served from `donation.api.sagsio.com` (whitelisted in `next.config.mjs`). Local static assets go in `public/images/`.
