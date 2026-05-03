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
| `donate` | `/donate/[step]` | Multi-step donation wizard |

### Donate wizard (`src/app/donate/`)

The wizard is driven by a single dynamic route `donate/[step]/page.jsx` that maps step numbers 1–8 to step components via a `STEPS` array. Navigation is managed by `useStepNavigation` (pushes to `/donate/<n>` and updates `maxStep` in context).

**Step order:** Info → Cause → Objective (Ramadan only) → Payment → Add-ons → Summary → Payment Details → Confirmation

When `data.isRamadan` is false, Step 3 (Objective) is skipped — Step 2 navigates directly to Step 4, and `StepLayout` adjusts the displayed step number accordingly (`displayStep = step > 3 ? step - 1 : step`).

Campaign metadata (name, description, suggestedAmounts, addOns, goalsDates) is written to `sessionStorage["campaignData"]` in `DonationWidget` before routing to `/donate/1`, and read via `useMemo` in step components that need it. The `isRamadan` flag is stored separately in `sessionStorage["donationIsRamadan"]`.

All wizard state lives in `DonationContext` (in-memory, resets on page refresh). Key fields: `campaignId`, `campaignTitle`, `isRamadan`, `maxStep`, `causes`, `objective`, `paymentType`, `frequency`, `numberOfDays`, `currency`, `amountTier`, `tipPct`, `addOnBreakdown`, `grandTotal`, `anonymous`, card fields.

### API layer

All API calls go through `src/services/api.js`. In development, Next.js rewrites `/api/v1/*` to `https://donation.api.sagsio.com/api/v1/*` (configured in `next.config.mjs`), so there is no separate backend to run locally.

Two request helpers exist — `apiRequest` (reads `token` cookie) and `adminApiRequest` (reads `adminToken` cookie). Both attach a `Bearer` token from the cookie and throw an `Error` with the server's message on non-OK responses.

### Auth

- **User auth:** `AuthContext` — stores user object in `localStorage["hc_user"]` and JWT in `token` cookie.
- **Admin auth:** `AdminAuthContext` — separate context, uses `adminToken` cookie.
- **Middleware** (`src/middleware.js`) guards `/dashboard/*` (requires `token`) and `/admin/*` (requires `adminToken`), and redirects authenticated users away from auth pages.

### Path aliases

`@/` maps to `src/` (configured in `jsconfig.json`).

### Styling

Tailwind CSS v4 with inline utility classes. Color palette uses hex literals directly (e.g. `#EA3335` for red, `#055A46` for green, `#383838` for primary text, `#737373` / `#8C8C8C` for muted text). No CSS variables or theme tokens are defined.

### Shared UI components (`src/components/ui/`)

`Field`, `Input`, `Select`, `Toggle`, `Stepper`, `NumberInput`, `Row`, `Button`, `Card` — used across wizard steps. `CustomDropdown` in `src/components/common/` is used for searchable country/state/city selects.
