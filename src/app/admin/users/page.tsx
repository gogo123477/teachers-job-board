import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setUserActive } from "./actions";

const ROLE_LABELS = {
  institution: "מוסד חינוכי",
  teacher: "מורה",
  admin: "אדמין",
} as const;

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: "desc" },
  });

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-bold">ניהול משתמשים</h1>

      <div className="flex w-full max-w-2xl flex-col gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                {user.email}
                <span className="text-xs font-normal text-muted-foreground">
                  {ROLE_LABELS[user.role]} · {user.is_active ? "פעיל" : "חסום"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.role !== "admin" && (
                <form action={setUserActive.bind(null, user.id, !user.is_active)}>
                  <Button type="submit" variant={user.is_active ? "destructive" : "outline"}>
                    {user.is_active ? "חסימת משתמש" : "ביטול חסימה"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
