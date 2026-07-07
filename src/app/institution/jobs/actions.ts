"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { jobPostingSchema } from "@/lib/validations/job";

export type JobFormState = { error?: string } | undefined;

async function requireInstitution() {
  const session = await auth();
  if (!session?.user || session.user.role !== "institution") {
    return null;
  }
  const institution = await prisma.institution.findUnique({
    where: { user_id: session.user.id },
  });
  return institution;
}

export async function createJob(
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const institution = await requireInstitution();
  if (!institution) {
    return { error: "אין הרשאה לבצע פעולה זו" };
  }

  const parsed = jobPostingSchema.safeParse({
    title: formData.get("title"),
    subject: formData.get("subject"),
    education_stage: formData.get("education_stage"),
    scope: formData.get("scope"),
    region: formData.get("region"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const job = await prisma.jobPosting.create({
    data: {
      institution_id: institution.id,
      status: "published",
      ...parsed.data,
    },
  });

  revalidatePath("/institution/jobs");
  redirect(`/institution/jobs?created=${job.id}`);
}

export async function updateJob(
  jobId: string,
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  const institution = await requireInstitution();
  if (!institution) {
    return { error: "אין הרשאה לבצע פעולה זו" };
  }

  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!job || job.institution_id !== institution.id) {
    return { error: "המשרה לא נמצאה" };
  }

  const parsed = jobPostingSchema.safeParse({
    title: formData.get("title"),
    subject: formData.get("subject"),
    education_stage: formData.get("education_stage"),
    scope: formData.get("scope"),
    region: formData.get("region"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  await prisma.jobPosting.update({
    where: { id: jobId },
    data: parsed.data,
  });

  revalidatePath("/institution/jobs");
  redirect("/institution/jobs");
}

export async function closeJob(jobId: string) {
  const institution = await requireInstitution();
  if (!institution) {
    throw new Error("אין הרשאה לבצע פעולה זו");
  }

  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!job || job.institution_id !== institution.id) {
    throw new Error("המשרה לא נמצאה");
  }

  await prisma.jobPosting.update({
    where: { id: jobId },
    data: { status: "closed" },
  });

  revalidatePath("/institution/jobs");
}
