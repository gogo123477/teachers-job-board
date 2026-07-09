import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/auth.config";

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update: update,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user || !user.is_active || !user.password_hash) return null;

        const validPassword = await verifyPassword(
          parsed.data.password,
          user.password_hash
        );
        if (!validPassword) return null;

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
    Google,
  ],
  callbacks: {
    ...authConfig.callbacks,
    signIn: async ({ user, account }) => {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;

      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (!existing) {
        // brand-new account: allow the sign-in, but leave id/role unset so
        // the resulting session has no role -- proxy.ts sends them to
        // /onboarding to pick institution/teacher before using the app.
        return true;
      }
      if (!existing.is_active) return false;

      user.id = existing.id;
      user.role = existing.role;
      return true;
    },
  },
});
