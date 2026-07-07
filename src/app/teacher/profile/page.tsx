import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TeacherProfileForm } from "./profile-form";

export default async function TeacherProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/teacher/profile");
  }
  if (session.user.role !== "teacher") {
    redirect("/");
  }

  const teacher = await prisma.teacher.findUnique({
    where: { user_id: session.user.id },
  });

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <TeacherProfileForm
        key={teacher?.id ?? "new"}
        defaultValues={{
          full_name: teacher?.full_name ?? "",
          subjects: teacher?.subjects ?? [],
          education_stages: teacher?.education_stages ?? [],
          preferred_regions: teacher?.preferred_regions ?? [],
          bio: teacher?.bio ?? "",
          cv_url: teacher?.cv_url ?? "",
        }}
      />
    </main>
  );
}
