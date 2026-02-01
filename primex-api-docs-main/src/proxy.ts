import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isTemporaryPassword = req.auth?.user?.isTemporaryPassword;

  // Paths
  const isHomePage = nextUrl.pathname === "/";
  const isDocsPage =
    nextUrl.pathname.startsWith("/docs") || nextUrl.pathname.startsWith("/docs-admin");
  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password");
  const isChangePasswordPage = nextUrl.pathname === "/change-password";

  // 1. Force Change Password redirect
  if (isLoggedIn && isTemporaryPassword) {
    if (!isChangePasswordPage && !nextUrl.pathname.startsWith("/api/auth")) {
      return NextResponse.redirect(new URL("/change-password", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Prevent accessing Change Password if not needed
  if (isLoggedIn && !isTemporaryPassword && isChangePasswordPage) {
    return NextResponse.redirect(new URL("/docs", nextUrl));
  }

  // 3. Redirect logged-in users from Home / Login / Auth pages to Docs
  if (isLoggedIn && (isHomePage || isAuthPage)) {
    return NextResponse.redirect(new URL("/docs", nextUrl));
  }

  // 4. Protect Docs pages
  if (isDocsPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Matcher ignoring internals
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
