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

`useStepNavigation` (`src/hooks/useStepNavigation.js`) reads `data.campaign` from `DonationContext` to determine the base route (`/[campaign]` vs `/donate`) and pushes the next step accordingly.

Step 3 (Objective) is only shown for Ramadan campaigns (`data.isRamadan === true`). When skipping it, call `handlePrev(data.isRamadan ? 3 : 2)`.

Step 7 (`Step7PaymentDetails`) submits the donation to `donations/submit` and stores `stripeClientSecret` + `stripePublishableKey` in `DonationContext`. Step 8 (`Step8Confirmation`) uses these to mount the Stripe `<Elements>` provider and complete payment.

Campaign metadata (id, suggestedAmounts, goalsDates, etc.) is stored in `sessionStorage` under the key `campaignData` by the campaign detail page before the user enters the donate flow. Steps read from it via `JSON.parse(sessionStorage.getItem("campaignData"))`. `donationIsRamadan` is a separate sessionStorage flag (`"1"` / absent).

### State Management

React Context only — no Redux or Zustand. The two auth contexts above plus `DonationContext` (`src/context/DonationContext.jsx`), which holds all multi-step donation form state and exposes `useDonation()`. `DonationProvider` wraps both `/donate` and `/[campaignSlug]` layouts.

### Component Conventions

- Mark interactive components with `"use client"` at the top.
- Shared primitives go in `src/components/ui/`.
- Layout chrome (Navbar, Footer, Sidebar, AdminSidebar) lives in `src/components/layout/`.
- Page-specific components live alongside the page: `src/app/dashboard/components/`, `src/app/admin/components/`, etc.

### Path Alias

`@/*` maps to `./src/*` (configured in `jsconfig.json`). Use `@/` imports throughout.

### Utilities

- `src/utils/cookies.js` — `getCookie`, `setCookie`, `deleteCookie`
- `src/utils/helpers.js` — date and currency formatting
- `src/utils/constants.js` — `apiBase`, `serverApiBase`, `siteUrl`

Remote images are served from `donation.api.sagsio.com` (whitelisted in `next.config.mjs`). Local static assets go in `public/images/`.
