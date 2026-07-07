import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * פרופיל מורה אינו נגיש דרך חיפוש/URL ישיר (mismach_techni.md §6).
 * גישה מותרת: המורה עצמו/ה, או מוסד שיש לו Application מהמורה הזה
 * למשרה שהוא בעליה (mismach_techni.md §6, backlog 4.2).
 */
export default async function TeacherProfileViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/teachers/${id}`);
  }

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    notFound();
  }

  const isOwner = teacher.user_id === session.user.id;
  let isInstitutionWithApplication = false;

  if (!isOwner && session.user.role === "institution") {
    const institution = await prisma.institution.findUnique({
      where: { user_id: session.user.id },
    });
    if (institution) {
      const application = await prisma.application.findFirst({
        where: {
          teacher_id: teacher.id,
          job_posting: { institution_id: institution.id },
        },
      });
      isInstitutionWithApplication = !!application;
    }
  }

  if (!isOwner && !isInstitutionWithApplication) {
    notFound();
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{teacher.full_name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p>
            <span className="font-medium">תחומי הוראה: </span>
            {teacher.subjects.join(", ")}
          </p>
          <p>
            <span className="font-medium">שלבי חינוך: </span>
            {teacher.education_stages.join(", ")}
          </p>
          <p>
            <span className="font-medium">אזורים מועדפים: </span>
            {teacher.preferred_regions.join(", ")}
          </p>
          {teacher.bio && (
            <p>
              <span className="font-medium">תיאור: </span>
              {teacher.bio}
            </p>
          )}
          {teacher.cv_url && (
            <a
              href={teacher.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              קובץ קו&quot;ח
            </a>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
