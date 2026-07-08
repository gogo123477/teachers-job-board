import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { StatusSelect } from "./status-select";
import { updateApplicationStatus } from "./actions";

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/institution/jobs/${id}/applicants`);
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

  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (!job || job.institution_id !== institution.id) {
    notFound();
  }

  const applications = await prisma.application.findMany({
    where: { job_posting_id: id },
    include: { teacher: { select: { id: true, full_name: true } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold">מועמדים · {job.title}</h1>

      {applications.length === 0 && (
        <EmptyState
          icon={Users}
          title="עדיין אין מועמדים למשרה זו"
          description="ברגע שמורים יגישו מועמדות, הם יופיעו כאן"
        />
      )}

      <div className="flex w-full max-w-2xl flex-col gap-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href={`/teachers/${application.teacher.id}`} className="hover:underline">
                  {application.teacher.full_name}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {application.message && (
                <p className="text-sm text-muted-foreground">{application.message}</p>
              )}
              <form
                action={async (formData) => {
                  "use server";
                  await updateApplicationStatus(id, application.id, formData);
                }}
                className="flex items-center gap-2"
              >
                <StatusSelect defaultValue={application.status} />
                <Button type="submit" variant="outline">
                  עדכון
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
