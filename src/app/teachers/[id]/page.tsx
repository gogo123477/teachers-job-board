import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * פרופיל מורה אינו נגיש דרך חיפוש/URL ישיר (mismach_techni.md §6).
 * כרגע (לפני שלב 4) הגישה היחידה המותרת היא המורה עצמו/ה.
 * כשתתווסף הגשת מועמדות, יתווסף כאן תנאי נוסף: מוסד עם Application מהמורה הזה.
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
  if (!teacher || teacher.user_id !== session.user.id) {
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
        </CardContent>
      </Card>
    </main>
  );
}
