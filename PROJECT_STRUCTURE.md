# Human Concern Frontend - Project Structure

This document explains the current folder structure and what each file is responsible for.

## Root

- `public/` - Static assets served directly by Next.js.
- `src/` - Main application source code.
- `next.config.mjs` - Next.js configuration.
- `postcss.config.mjs` - PostCSS configuration.
- `eslint.config.mjs` - ESLint configuration.
- `jsconfig.json` - Path alias and JavaScript tooling config.
- `package.json` - Scripts and dependencies.
- `README.md` - Project readme.
- `PROJECT_STRUCTURE.md` - This documentation file.

## `public/`

- `public/images/` - Image assets used in pages/components.
- `public/icons/` - Icon assets used in pages/components.
- `public/*.svg` - Default static SVG files.

## `src/app/` (App Router)

- `src/app/layout.jsx` - Root layout shared by all routes.
- `src/app/globals.css` - Global styles.

### Public site routes: `src/app/(site)/`

- `src/app/(site)/page.jsx` - Home page.
- `src/app/(site)/campaigns/page.jsx` - Campaign listing page.
- `src/app/(site)/donate/page.jsx` - Donation page.

### Auth routes: `src/app/(auth)/`

- `src/app/(auth)/login/page.jsx` - Login page.
- `src/app/(auth)/register/page.jsx` - Registration page.

### User dashboard routes: `src/app/dashboard/`

- `src/app/dashboard/layout.jsx` - Shared dashboard layout.
- `src/app/dashboard/page.jsx` - Dashboard overview.
- `src/app/dashboard/donations/page.jsx` - User donations page.
- `src/app/dashboard/profile/page.jsx` - User profile page.

### Admin routes: `src/app/admin/`

- `src/app/admin/layout.jsx` - Shared admin layout.
- `src/app/admin/page.jsx` - Admin overview.
- `src/app/admin/campaigns/page.jsx` - Campaign management page.
- `src/app/admin/donations/page.jsx` - Donation management page.
- `src/app/admin/users/page.jsx` - User management page.

## `src/components/`

### Reusable UI: `src/components/ui/`

- `src/components/ui/Button.jsx` - Reusable button component.
- `src/components/ui/Input.jsx` - Reusable input field component.
- `src/components/ui/Card.jsx` - Reusable card/container component.

### Layout pieces: `src/components/layout/`

- `src/components/layout/Navbar.jsx` - Top navigation bar.
- `src/components/layout/Footer.jsx` - Footer section.
- `src/components/layout/Sidebar.jsx` - Sidebar for user dashboard navigation.
- `src/components/layout/AdminSidebar.jsx` - Sidebar for admin navigation.

## `src/services/` (API layer)

- `src/services/api.js` - Shared API request helper.
- `src/services/authService.js` - Auth-related API calls.
- `src/services/campaignService.js` - Campaign-related API calls.
- `src/services/donationService.js` - Donation-related API calls.

## `src/hooks/`

- `src/hooks/useAuth.js` - Auth state hook for current user/loading status.

## `src/utils/`

- `src/utils/helpers.js` - Shared utility helpers (date/currency formatting).

## `src/middleware.js`

- Route protection middleware.
- Redirects unauthenticated users away from protected routes (`/dashboard`, `/admin`).
- Redirects authenticated users away from auth routes (`/login`, `/register`).

## Notes

- Current config files use `.mjs` (`next.config.mjs`, `postcss.config.mjs`) and this is valid.
- If you later add TypeScript, mirror this structure with `.ts`/`.tsx` files.
