"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { teacherProfileSchema } from "@/lib/validations/profile";
import { uploadFile } from "@/lib/blob";

export type TeacherProfileState = { error?: string; success?: boolean } | undefined;

const CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

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
    preferred_cities: formData.getAll("preferred_cities"),
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  let cv_url: string | undefined;
  const cv = formData.get("cv");
  if (cv instanceof File && cv.size > 0) {
    try {
      cv_url = await uploadFile(cv, {
        folder: "teacher-cvs",
        maxSizeMb: 5,
        allowedTypes: CV_TYPES,
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : "העלאת קובץ הקו\"ח נכשלה" };
    }
  }

  await prisma.teacher.upsert({
    where: { user_id: session.user.id },
    create: { user_id: session.user.id, ...parsed.data, ...(cv_url && { cv_url }) },
    update: { ...parsed.data, ...(cv_url && { cv_url }) },
  });

  revalidatePath("/teacher/profile");
  return { success: true };
}
