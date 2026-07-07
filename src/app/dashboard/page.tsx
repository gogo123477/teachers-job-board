import { auth } from "@/auth";

const ROLE_LABELS = {
  institution: "מוסד חינוכי",
  teacher: "מורה",
  admin: "אדמין",
} as const;

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-bold">אזור אישי</h1>
      <p className="text-muted-foreground">
        מחובר/ת כ-{session!.user.email} ({ROLE_LABELS[session!.user.role]})
      </p>
    </main>
  );
}
