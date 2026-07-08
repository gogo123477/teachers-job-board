import Link from "next/link";
import { Briefcase, SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDUCATION_STAGES, JOB_SCOPES, REGIONS, SUBJECTS } from "@/lib/taxonomy";
import type { Prisma } from "@/generated/prisma/client";

type SearchParams = {
  q?: string;
  subject?: string;
  education_stage?: string;
  region?: string;
  scope?: string;
};

function isTaxonomyValue(value: string | undefined, options: readonly string[]) {
  return value && (options as readonly string[]).includes(value) ? value : undefined;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();
  const subject = isTaxonomyValue(params.subject, SUBJECTS);
  const education_stage = isTaxonomyValue(params.education_stage, EDUCATION_STAGES);
  const region = isTaxonomyValue(params.region, REGIONS);
  const scope = isTaxonomyValue(params.scope, JOB_SCOPES);

  const where: Prisma.JobPostingWhereInput = {
    status: "published",
    moderation_status: "approved",
    ...(subject && { subject }),
    ...(education_stage && { education_stage }),
    ...(region && { region }),
    ...(scope && { scope }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  const jobs = await prisma.jobPosting.findMany({
    where,
    include: { institution: { select: { name: true } } },
    orderBy: { created_at: "desc" },
  });

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold">משרות</h1>

      <form method="get" className="flex w-full max-w-2xl flex-col gap-3">
        <Input name="q" placeholder="חיפוש חופשי..." defaultValue={q} />
        <div className="flex flex-wrap gap-2">
          <Select name="subject" defaultValue={subject}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="תחום הוראה" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="education_stage" defaultValue={education_stage}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="שלב חינוכי" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="region" defaultValue={region}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="אזור" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="scope" defaultValue={scope}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="היקף משרה" />
            </SelectTrigger>
            <SelectContent>
              {JOB_SCOPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit">סינון</Button>
          {(q || subject || education_stage || region || scope) && (
            <Button variant="ghost" nativeButton={false} render={<Link href="/jobs" />}>
              איפוס
            </Button>
          )}
        </div>
      </form>

      {jobs.length === 0 &&
        (q || subject || education_stage || region || scope ? (
          <EmptyState
            icon={SearchX}
            title="לא נמצאו משרות התואמות את החיפוש"
            description="נסו לשנות את מילות החיפוש או להסיר חלק מהסינונים"
            action={
              <Button variant="outline" nativeButton={false} render={<Link href="/jobs" />}>
                איפוס סינון
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Briefcase}
            title="אין כרגע משרות פתוחות"
            description="משרות חדשות מתפרסמות כאן לאחר אישור. חוזרים לבדוק בקרוב!"
          />
        ))}

      <div className="flex w-full max-w-2xl flex-col gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href={`/jobs/${job.id}`} className="hover:underline">
                  {job.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {job.institution.name} · {job.subject} · {job.education_stage} · {job.region} ·{" "}
              {job.scope}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
