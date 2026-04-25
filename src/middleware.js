import { NextResponse } from "next/server";

const userAuthRoutes = [
  "/user/login",
  "/user/register",
  "/user/forgot-password",
  "/user/reset-password",
];

const adminAuthRoutes = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("adminToken")?.value;

  const isUserAuthRoute = userAuthRoutes.some((r) => pathname.startsWith(r));
  const isAdminAuthRoute = adminAuthRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminAuthRoute;
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Unauthenticated user → send to login
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  // Authenticated user on auth page → send to dashboard
  if (isUserAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated admin → send to admin login
  if (isAdminRoute && !adminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Authenticated admin on admin auth page → send to admin panel
  if (isAdminAuthRoute && adminToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/user/login",
    "/user/register",
    "/user/forgot-password",
    "/user/reset-password",
    "/admin/:path*",
  ],
};
