"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { institutionProfileSchema } from "@/lib/validations/profile";

export type InstitutionProfileState = { error?: string; success?: boolean } | undefined;

export async function saveInstitutionProfile(
  _prevState: InstitutionProfileState,
  formData: FormData
): Promise<InstitutionProfileState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "institution") {
    return { error: "אין הרשאה לבצע פעולה זו" };
  }

  const parsed = institutionProfileSchema.safeParse({
    name: formData.get("name"),
    institution_type: formData.get("institution_type"),
    region: formData.get("region"),
    contact_name: formData.get("contact_name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  await prisma.institution.upsert({
    where: { user_id: session.user.id },
    create: { user_id: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/institution/profile");
  return { success: true };
}
