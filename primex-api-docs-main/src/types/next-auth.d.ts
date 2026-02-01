import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    isTemporaryPassword?: boolean;
  }

  interface Session {
    user: {
      role?: string;
      isTemporaryPassword?: boolean;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    isTemporaryPassword?: boolean;
  }
}
