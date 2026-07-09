"use server";

import { redirect } from "next/navigation";
import { auth, update } from "@/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/auth";

export type OnboardingState = { error?: string } | undefined;

export async function completeOnboardingAction(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }
  if (session.user.role) {
    redirect("/");
  }

  const parsed = onboardingSchema.safeParse({ role: formData.get("role") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: { role: parsed.data.role },
    create: { email: session.user.email, role: parsed.data.role },
  });

  await update({ user: { id: user.id, role: user.role } });
  redirect("/");
}
