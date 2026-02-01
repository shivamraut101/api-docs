import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // 1. Initial sign in
      if (user) {
        token.role = user.role;
        token.isTemporaryPassword = user.isTemporaryPassword;
        return token;
      }

      // 2. On subsequent calls, validate user exists in DB
      if (!token.sub) return token;

      try {
        await dbConnect();
        const dbUser = await User.findById(token.sub);
        if (!dbUser) {
          // User deleted from DB, return null to invalidate token
          return null;
        }
        // Update token with latest data
        token.role = dbUser.role;
        token.isTemporaryPassword = dbUser.isTemporaryPassword;

        // Handle updates triggered by update()
        if (trigger === "update" && session) {
          return { ...token, ...session };
        }
      } catch (error) {
        console.error("Auth JWT Callback Error:", error);
        // On error, maybe let it pass or invalidate? Safest is to let pass if transient, but if user deleted...
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.isTemporaryPassword = token.isTemporaryPassword as boolean;
        session.user.id = token.sub as string;
      } else if (!token) {
        // Token invalidated
        return null as any;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) return null;

        const passwordsMatch = await compare(credentials.password, user.password);
        if (!passwordsMatch) return null;

        // Return user object, including custom fields for token callbacks
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email.split("@")[0],
          role: user.role,
          isTemporaryPassword: user.isTemporaryPassword,
        };
      },
    }),
  ],
});
