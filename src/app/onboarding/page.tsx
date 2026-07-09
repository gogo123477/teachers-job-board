import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <OnboardingForm email={session.user.email ?? ""} />
    </main>
  );
}
