"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { institutionProfileSchema } from "@/lib/validations/profile";
import { uploadFile } from "@/lib/blob";

export type InstitutionProfileState = { error?: string; success?: boolean } | undefined;

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

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
    city: formData.get("city"),
    contact_name: formData.get("contact_name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  let logo_url: string | undefined;
  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    try {
      logo_url = await uploadFile(logo, {
        folder: "institution-logos",
        maxSizeMb: 2,
        allowedTypes: LOGO_TYPES,
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : "העלאת הלוגו נכשלה" };
    }
  }

  await prisma.institution.upsert({
    where: { user_id: session.user.id },
    create: { user_id: session.user.id, ...parsed.data, ...(logo_url && { logo_url }) },
    update: { ...parsed.data, ...(logo_url && { logo_url }) },
  });

  revalidatePath("/institution/profile");
  return { success: true };
}
