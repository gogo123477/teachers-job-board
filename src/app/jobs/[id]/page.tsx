import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPostingOrgName } from "@/lib/job-display";
import { ApplySection } from "./apply-section";

const APPLICATION_STATUS_LABELS = {
  VIEWED: "נצפה",
  IN_PROGRESS: "בתהליך",
  REJECTED: "נדחה",
  ACCEPTED: "התקבל",
} as const;

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: { institution: { select: { name: true, city: true } } },
  });

  if (!job || job.status !== "published" || job.moderation_status !== "approved") {
    notFound();
  }

  let applyArea: React.ReactNode = null;

  if (job.imported) {
    applyArea = (
      <Button
        nativeButton={false}
        render={<a href={job.source_url ?? undefined} target="_blank" rel="noopener noreferrer" />}
      >
        מעבר למשרה באתר המקור
      </Button>
    );
  } else if (!session?.user) {
    applyArea = (
      <Button nativeButton={false} render={<Link href={`/login?callbackUrl=/jobs/${id}`} />}>
        התחברות להגשת מועמדות
      </Button>
    );
  } else if (session.user.role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: session.user.id },
    });
    if (!teacher) {
      applyArea = (
        <Button nativeButton={false} render={<Link href="/teacher/profile" />}>
          יש להשלים פרופיל כדי להגיש מועמדות
        </Button>
      );
    } else {
      const existing = await prisma.application.findUnique({
        where: {
          job_posting_id_teacher_id: { job_posting_id: id, teacher_id: teacher.id },
        },
      });
      if (existing) {
        applyArea = (
          <p className="text-sm text-muted-foreground">
            כבר הגשת מועמדות · סטטוס: {APPLICATION_STATUS_LABELS[existing.status]}
          </p>
        );
      } else {
        applyArea = <ApplySection jobId={id} />;
      }
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p>
            <span className="font-medium">מוסד: </span>
            {getPostingOrgName(job)}
          </p>
          <p>
            <span className="font-medium">תחום הוראה: </span>
            {job.subject}
          </p>
          <p>
            <span className="font-medium">שלב חינוכי: </span>
            {job.education_stage}
          </p>
          <p>
            <span className="font-medium">יישוב: </span>
            {job.city}
          </p>
          <p>
            <span className="font-medium">היקף משרה: </span>
            {job.scope}
          </p>
          <p>
            <span className="font-medium">תיאור: </span>
            {job.description}
          </p>

          {applyArea}
        </CardContent>
      </Card>
    </main>
  );
}
