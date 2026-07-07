import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JobForm } from "../job-form";
import { createJob } from "../actions";

export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/institution/jobs/new");
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

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <JobForm title="פרסום משרה חדשה" action={createJob} submitLabel="פרסום" />
    </main>
  );
}
