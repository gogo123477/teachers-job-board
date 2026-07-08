"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { applySchema } from "@/lib/validations/application";
import { rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

export type ApplyState = { error?: string; success?: boolean } | undefined;

export async function applyToJob(
  jobId: string,
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "teacher") {
    return { error: "רק מורים יכולים להגיש מועמדות" };
  }

  const teacher = await prisma.teacher.findUnique({
    where: { user_id: session.user.id },
  });
  if (!teacher) {
    return { error: "יש להשלים קודם את פרופיל המורה" };
  }

  const allowed = await rateLimit("apply-job", 20, 60 * 60 * 1000);
  if (!allowed) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "published" || job.moderation_status !== "approved") {
    return { error: "המשרה אינה זמינה להגשת מועמדות" };
  }

  const parsed = applySchema.safeParse({
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const existing = await prisma.application.findUnique({
    where: { job_posting_id_teacher_id: { job_posting_id: jobId, teacher_id: teacher.id } },
  });
  if (existing) {
    return { error: "כבר הגשת מועמדות למשרה זו" };
  }

  await prisma.application.create({
    data: {
      job_posting_id: jobId,
      teacher_id: teacher.id,
      message: parsed.data.message,
    },
  });

  revalidatePath(`/jobs/${jobId}`);
  return { success: true };
}
