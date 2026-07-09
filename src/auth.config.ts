import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the Auth.js config, shared by middleware.ts and auth.ts.
 * Must not import anything that pulls in Prisma (Node-only APIs break Edge middleware).
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: ({ token, user, trigger, session }) => {
      if (user) {
        token.role = user.role;
      }
      // triggered by unstable_update() after onboarding assigns a role
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
