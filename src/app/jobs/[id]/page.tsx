import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.jobPosting.findUnique({
    where: { id },
    include: { institution: { select: { name: true, region: true } } },
  });

  if (!job || job.status !== "published" || job.moderation_status !== "approved") {
    notFound();
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
            {job.institution.name}
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
            <span className="font-medium">אזור: </span>
            {job.region}
          </p>
          <p>
            <span className="font-medium">היקף משרה: </span>
            {job.scope}
          </p>
          <p>
            <span className="font-medium">תיאור: </span>
            {job.description}
          </p>

          {/* הגשת מועמדות בפועל תתווסף בשלב 4 */}
          <Button disabled className="w-full">
            הגש מועמדות (בקרוב)
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
