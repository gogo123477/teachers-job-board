"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations/auth";
import { signIn } from "@/auth";
import { rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

export type RegisterState = { error?: string } | undefined;

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const allowed = await rateLimit("register", 5, 15 * 60 * 1000);
  if (!allowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const { email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "כתובת המייל כבר רשומה במערכת" };
  }

  const password_hash = await hashPassword(password);
  await prisma.user.create({
    data: { email, password_hash, role },
  });

  await signIn("credentials", { email, password, redirectTo: "/" });
}
