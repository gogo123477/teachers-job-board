import { ClipboardCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { getPostingOrgName } from "@/lib/job-display";
import { approveJob, rejectJob } from "./actions";

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

export default async function AdminJobsPage() {
  const jobs = await prisma.jobPosting.findMany({
    include: { institution: { select: { name: true } } },
    orderBy: [{ moderation_status: "asc" }, { created_at: "desc" }],
  });

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold">מודרציית משרות</h1>

      {jobs.length === 0 && (
        <EmptyState icon={ClipboardCheck} title="אין משרות במערכת" />
      )}

      <div className="flex w-full max-w-2xl flex-col gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle className="flex flex-col gap-1 text-lg sm:flex-row sm:items-center sm:justify-between">
                {job.title}
                <span className="text-xs font-normal text-muted-foreground">
                  {STATUS_LABELS[job.status]} · {MODERATION_LABELS[job.moderation_status]}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {job.imported && (
                  <>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">מיובא</span>{" "}
                    <a
                      href={job.source_url ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      מקור
                    </a>{" "}
                    ·{" "}
                  </>
                )}
                {getPostingOrgName(job)} · {job.subject} · {job.education_stage} · {job.city}
              </p>
              <div className="flex flex-wrap gap-2">
                {job.moderation_status === "pending" && (
                  <form action={approveJob.bind(null, job.id)}>
                    <Button type="submit">אישור</Button>
                  </form>
                )}
                {job.moderation_status !== "rejected" && (
                  <form action={rejectJob.bind(null, job.id)}>
                    <Button type="submit" variant="destructive">
                      {job.moderation_status === "pending" ? "דחייה" : "הסרה"}
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
