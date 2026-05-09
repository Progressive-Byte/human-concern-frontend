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

### Authentication

Two independent auth systems:
- **User auth**: `AuthContext` (`src/context/AuthContext.jsx`) — stores `hc_user` in localStorage and a `token` cookie. Exposes `useAuth()` hook with `login()`, `register()`, `logout()`.
- **Admin auth**: `AdminAuthContext` (`src/context/AdminAuthContext.jsx`) — uses an `adminToken` cookie.

### API Layer

All HTTP calls go through `src/services/api.js`:
- `apiRequest()` — attaches the user `token` cookie as a Bearer header
- `adminApiRequest()` — attaches `adminToken`
- Base path `/api/v1/` is rewritten by Next.js to `https://donation.api.sagsio.com/api/v1/`

Domain services (`authService.js`, `campaignService.js`, `donationService.js`, `admin.js`, `adminAuthService.js`) wrap `apiRequest`/`adminApiRequest` and are the only place that should call the API directly.

### State Management

React Context only — no Redux or Zustand. The two contexts above plus `DonationContext` (`src/context/DonationContext.jsx`), which holds multi-step donation form state and exposes `useDonation()`.

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
- `src/utils/constants.js` — API base URL and endpoint constants
