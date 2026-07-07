import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_LABELS = {
  VIEWED: "נצפה",
  IN_PROGRESS: "בתהליך",
  REJECTED: "נדחה",
  ACCEPTED: "התקבל",
} as const;

export default async function MyApplicationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/teacher/applications");
  }
  if (session.user.role !== "teacher") {
    redirect("/");
  }

  const teacher = await prisma.teacher.findUnique({
    where: { user_id: session.user.id },
  });
  if (!teacher) {
    redirect("/teacher/profile");
  }

  const applications = await prisma.application.findMany({
    where: { teacher_id: teacher.id },
    include: { job_posting: { include: { institution: { select: { name: true } } } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold">המועמדויות שלי</h1>

      {applications.length === 0 && (
        <p className="text-muted-foreground">עדיין לא הגשת מועמדות למשרה.</p>
      )}

      <div className="flex w-full max-w-2xl flex-col gap-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <Link
                  href={`/jobs/${application.job_posting.id}`}
                  className="hover:underline"
                >
                  {application.job_posting.title}
                </Link>
                <span className="text-xs font-normal text-muted-foreground">
                  {STATUS_LABELS[application.status]}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {application.job_posting.institution.name}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
