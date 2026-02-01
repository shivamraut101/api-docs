import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedPage =
        nextUrl.pathname.startsWith("/docs") ||
        nextUrl.pathname.startsWith("/docs-admin") ||
        nextUrl.pathname.startsWith("/profile");
      const isChangePasswordPage = nextUrl.pathname === "/change-password";
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/forgot-password") ||
        nextUrl.pathname.startsWith("/reset-password");

      // 1. If logged in and has temporary password, force redirect to change-password
      if (isLoggedIn && auth.user?.isTemporaryPassword) {
        if (!isChangePasswordPage) {
          return Response.redirect(new URL("/change-password", nextUrl));
        }
        return true;
      }

      // 2. If logged in and visiting auth pages, redirect to docs
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/docs", nextUrl));
      }

      // 3. If logged in and visiting change-password but NO temporary password, redirect to docs (optional, but keeps flow clean)
      // Actually, user might want to change password manually later. So I won't block it unless requested.
      // But for now, let's allow it.

      // 4. Protect routes
      if (isProtectedPage) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isTemporaryPassword = user.isTemporaryPassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.isTemporaryPassword = token.isTemporaryPassword as boolean;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
