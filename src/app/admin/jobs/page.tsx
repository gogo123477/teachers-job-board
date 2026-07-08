import { ClipboardCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
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
              <CardTitle className="flex items-center justify-between text-lg">
                {job.title}
                <span className="text-xs font-normal text-muted-foreground">
                  {STATUS_LABELS[job.status]} · {MODERATION_LABELS[job.moderation_status]}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {job.institution.name} · {job.subject} · {job.education_stage} · {job.region}
              </p>
              <div className="flex gap-2">
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
