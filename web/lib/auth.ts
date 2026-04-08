import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function getRequiredEnv(name: "ADMIN_PASSWORD_HASH" | "NEXTAUTH_SECRET") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Admin Password",
      credentials: {
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async (credentials) => {
        const password = credentials.password;

        if (typeof password !== "string" || password.length === 0) {
          return null;
        }

        const passwordHash = getRequiredEnv("ADMIN_PASSWORD_HASH");
        const valid = await bcrypt.compare(password, passwordHash);

        if (!valid) {
          return null;
        }

        return {
          id: "career-ops-admin",
          name: "Admin",
          email: "admin@career-ops.local",
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isLoginPage = nextUrl.pathname === "/login";
      const isPublicPage = nextUrl.pathname === "/";
      const isProtectedPage = !isPublicPage && !isLoginPage && !nextUrl.pathname.startsWith("/api/auth");

      if (isLoginPage) {
        return true;
      }

      if (isProtectedPage) {
        return isLoggedIn;
      }

      return true;
    },
  },
});

export function assertAuthEnv() {
  getRequiredEnv("NEXTAUTH_SECRET");
  getRequiredEnv("ADMIN_PASSWORD_HASH");
}
