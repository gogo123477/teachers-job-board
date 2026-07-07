"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { loginSchema } from "@/lib/validations/auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "מייל או סיסמה שגויים" };
    }
    throw error;
  }

  redirect("/");
}
