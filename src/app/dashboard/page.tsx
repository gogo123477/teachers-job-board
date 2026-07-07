import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

const ROLE_LABELS = {
  institution: "מוסד חינוכי",
  teacher: "מורה",
  admin: "אדמין",
} as const;

const PROFILE_PATH = {
  institution: "/institution/profile",
  teacher: "/teacher/profile",
  admin: null,
} as const;

export default async function DashboardPage() {
  const session = await auth();
  const profilePath = PROFILE_PATH[session!.user.role];

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">אזור אישי</h1>
      <p className="text-muted-foreground">
        מחובר/ת כ-{session!.user.email} ({ROLE_LABELS[session!.user.role]})
      </p>
      {profilePath && (
        <Button nativeButton={false} render={<Link href={profilePath} />}>
          עריכת פרופיל
        </Button>
      )}
    </main>
  );
}
