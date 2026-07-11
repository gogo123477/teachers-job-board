import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobForm } from "../../job-form";
import { updateJob } from "../../actions";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/institution/jobs/${id}/edit`);
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

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <JobForm
        title="עריכת משרה"
        action={updateJob.bind(null, id)}
        submitLabel="שמירה"
        defaultValues={{
          title: job.title,
          subject: job.subject,
          education_stage: job.education_stage,
          scope: job.scope,
          city: job.city,
          description: job.description,
        }}
      />
    </main>
  );
}
