import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const pendingCount = await prisma.jobPosting.count({
    where: { moderation_status: "pending" },
  });

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">אזור ניהול</h1>
      <div className="flex gap-2">
        <Button nativeButton={false} render={<Link href="/admin/jobs" />}>
          מודרציית משרות ({pendingCount} ממתינות)
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/users" />}>
          ניהול משתמשים
        </Button>
      </div>
    </main>
  );
}
