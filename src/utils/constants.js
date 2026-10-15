// import Cookies from 'js-cookie';

// export const home = 'http://localhost:3000';

export const home = 'https://human-concern-frontend.vercel.app';

// Where the API lives. Locally it runs on this machine. On Vercel, set NEXT_PUBLIC_API_ORIGIN to
// the deployed address and redeploy. The browser does not use this: it calls this site's own
// /api/v1 path, which next.config.mjs proxies to the same address.
export const siteUrl = (process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:3001').replace(/\/+$/, '');

export const apiBase = `/api/v1/`;

// Public-website language: remembered in a cookie (no locale-prefixed URLs).
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const DEFAULT_LOCALE = "en";
export const serverApiBase = `${siteUrl}/api/v1/`;
export const userAuthRegistration = `/api/v1/auth/register`;