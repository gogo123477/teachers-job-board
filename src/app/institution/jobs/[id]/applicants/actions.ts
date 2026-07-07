"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { $Enums } from "@/generated/prisma/client";

const VALID_STATUSES: $Enums.ApplicationStatus[] = [
  "VIEWED",
  "IN_PROGRESS",
  "REJECTED",
  "ACCEPTED",
];

export async function updateApplicationStatus(
  jobId: string,
  applicationId: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "institution") {
    throw new Error("אין הרשאה לבצע פעולה זו");
  }

  const institution = await prisma.institution.findUnique({
    where: { user_id: session.user.id },
  });
  if (!institution) {
    throw new Error("אין הרשאה לבצע פעולה זו");
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job_posting: true },
  });
  if (
    !application ||
    application.job_posting_id !== jobId ||
    application.job_posting.institution_id !== institution.id
  ) {
    throw new Error("המועמדות לא נמצאה");
  }

  const status = formData.get("status");
  if (typeof status !== "string" || !VALID_STATUSES.includes(status as $Enums.ApplicationStatus)) {
    throw new Error("סטטוס לא תקין");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: status as $Enums.ApplicationStatus },
  });

  revalidatePath(`/institution/jobs/${jobId}/applicants`);
}
