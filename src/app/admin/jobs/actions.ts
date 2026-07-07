"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { $Enums } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("אין הרשאה לבצע פעולה זו");
  }
}

async function setModerationStatus(jobId: string, status: $Enums.ModerationStatus) {
  await requireAdmin();
  await prisma.jobPosting.update({
    where: { id: jobId },
    data: { moderation_status: status },
  });
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
}

export async function approveJob(jobId: string) {
  await setModerationStatus(jobId, "approved");
}

export async function rejectJob(jobId: string) {
  await setModerationStatus(jobId, "rejected");
}
