import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InstitutionProfileForm } from "./profile-form";

export default async function InstitutionProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/institution/profile");
  }
  if (session.user.role !== "institution") {
    redirect("/");
  }

  const institution = await prisma.institution.findUnique({
    where: { user_id: session.user.id },
  });

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <InstitutionProfileForm
        key={institution?.id ?? "new"}
        defaultValues={{
          name: institution?.name ?? "",
          institution_type: institution?.institution_type ?? "",
          region: institution?.region ?? "",
          contact_name: institution?.contact_name ?? "",
          description: institution?.description ?? "",
        }}
      />
    </main>
  );
}
