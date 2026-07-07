"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { teacherProfileSchema } from "@/lib/validations/profile";

export type TeacherProfileState = { error?: string; success?: boolean } | undefined;

export async function saveTeacherProfile(
  _prevState: TeacherProfileState,
  formData: FormData
): Promise<TeacherProfileState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "teacher") {
    return { error: "אין הרשאה לבצע פעולה זו" };
  }

  const parsed = teacherProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    subjects: formData.getAll("subjects"),
    education_stages: formData.getAll("education_stages"),
    preferred_regions: formData.getAll("preferred_regions"),
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  await prisma.teacher.upsert({
    where: { user_id: session.user.id },
    create: { user_id: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/teacher/profile");
  return { success: true };
}
