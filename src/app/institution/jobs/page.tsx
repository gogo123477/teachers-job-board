import Link from "next/link";
import { redirect } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { closeJob } from "./actions";

const STATUS_LABELS = {
  draft: "טיוטה",
  published: "פורסם",
  closed: "סגור",
} as const;

const MODERATION_LABELS = {
  pending: "ממתין לאישור",
  approved: "אושר",
  rejected: "נדחה",
} as const;

export default async function MyJobsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/institution/jobs");
  }
  if (session.user.role !== "institution") {
    redirect("/");
  }

  const institution = await prisma.institution.findUnique({
    where: { user_id: session.user.id },
  });
  if (!institution) {
    redirect("/institution/profile");
  }

  const jobs = await prisma.jobPosting.findMany({
    where: { institution_id: institution.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-2xl font-bold">המשרות שלי</h1>
        <Button nativeButton={false} render={<Link href="/institution/jobs/new" />}>
          משרה חדשה
        </Button>
      </div>

      {jobs.length === 0 && (
        <EmptyState
          icon={FilePlus2}
          title="עדיין לא פרסמת משרות"
          description="פרסום המשרה הראשונה לוקח פחות מדקה"
          action={
            <Button nativeButton={false} render={<Link href="/institution/jobs/new" />}>
              פרסום משרה ראשונה
            </Button>
          }
        />
      )}

      <div className="flex w-full max-w-2xl flex-col gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                {job.title}
                <span className="text-xs font-normal text-muted-foreground">
                  {STATUS_LABELS[job.status]} · {MODERATION_LABELS[job.moderation_status]}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {job.subject} · {job.education_stage} · {job.region}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={`/institution/jobs/${job.id}/applicants`} />}
                >
                  מועמדים ({job._count.applications})
                </Button>
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={`/institution/jobs/${job.id}/edit`} />}
                >
                  עריכה
                </Button>
                {job.status !== "closed" && (
                  <form action={closeJob.bind(null, job.id)}>
                    <Button type="submit" variant="ghost">
                      סגירת משרה
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
