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

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("adminToken")?.value;

  const isUserAuthRoute = userAuthRoutes.some((r) => pathname.startsWith(r));
  const isAdminAuthRoute = adminAuthRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminAuthRoute;
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  if (isUserAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAdminRoute && !adminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

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
