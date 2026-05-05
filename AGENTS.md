# AGENTS.md

## Commands

```bash
npm run dev      # Dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint (v9 + next/core-web-vitals)
npm run start    # Serve production build
```

No test framework is configured.

## Architecture

**Next.js 16 App Router** with React 19, Tailwind CSS v4, plain JavaScript (`.jsx`). No TypeScript.

### Route groups

| Group | Prefix | Purpose |
|---|---|---|
| `(site)` | `/`, `/campaigns` | Public marketing pages |
| `(auth)` | `/user/*`, `/admin/login` etc. | Login / register / password reset |
| `dashboard` | `/dashboard/*` | Authenticated user portal |
| `admin` | `/admin/*` | Admin panel (separate auth) |
| `donate` | `/donate/[step]` | Multi-step donation wizard |

### Donate wizard (`src/app/donate/`)

- Driven by `donate/[step]/page.jsx` mapping step numbers 1–8 via a `STEPS` array.
- Step order: Info → Cause → Objective (Ramadan only) → Payment → Add-ons → Summary → Payment Details → Confirmation.
- When `isRamadan` is false, Step 3 is skipped and `StepLayout` adjusts display numbering (`displayStep = step > 3 ? step - 1 : step`).
- Campaign metadata stored in `sessionStorage["campaignData"]` (set by `DonationWidget` before routing to `/donate/1`). `isRamadan` flag stored separately in `sessionStorage["donationIsRamadan"]`.
- `DonationContext` (`src/context/DonationContext.jsx`) holds wizard state in-memory — **resets on page refresh**.

### API layer

- All calls through `src/services/api.js` using `fetch`.
- `apiBase` = `/api/v1/` from `src/utils/constants.js` — Next.js rewrites this to `https://donation.api.sagsio.com/api/v1/*` via `next.config.mjs`. **No separate backend to run locally.**
- `apiRequest` reads `token` cookie; `adminApiRequest` reads `adminToken` cookie. Both throw `Error` with server message on non-OK responses.
- Cookie helpers in `src/utils/cookies.js` (browser-only — guards `typeof document === "undefined"`).
- `/reset-password` redirects to `/user/reset-password` (next.config.mjs).

### Auth (two separate systems)

- **User:** `AuthContext` (`src/context/AuthContext.jsx`) — JWT in `token` cookie, user object in `localStorage["hc_user"]`.
- **Admin:** `AdminAuthContext` (`src/context/AdminAuthContext.jsx`) — JWT in `adminToken` cookie.
- `src/middleware.js` guards `/dashboard/*` (requires `token`) and `/admin/*` (requires `adminToken`), redirects authenticated users away from auth pages.
- Auth routes: `/user/login`, `/user/register`, `/user/forgot-password`, `/user/reset-password` | Admin: `/admin/login`, `/admin/forgot-password`, `/admin/reset-password`

### Path aliases

`@/` → `src/` (configured in `jsconfig.json`).

### Contexts

`src/context/` — `AuthContext.jsx`, `AdminAuthContext.jsx`, `DonationContext.jsx`.

### Shared UI

- `src/components/ui/` — `Field`, `Input`, `Select`, `Toggle`, `Stepper`, `NumberInput`, `Row`, `Button`, `Card`
- `src/components/common/CustomDropdown.jsx` — searchable country/state/city selects (uses `country-state-city` package)
- `src/components/layout/` — `Navbar`, `Footer`, `Sidebar`, `AdminSidebar`

### Services

`src/services/` — `api.js`, `authService.js`, `adminAuthService.js`, `campaignService.js`, `donationService.js`

### Utils

`src/utils/` — `constants.js` (`apiBase`, `serverApiBase`), `cookies.js`, `helpers.js` (date/currency formatting)

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss` plugin. Color palette uses inline hex literals (`#EA3335` red, `#055A46` green, `#383838` text, `#737373`/`#8C8C8C` muted). `postcss.config.mjs` defines a `custom-gradient` backgroundImage. No CSS variables or theme tokens.
