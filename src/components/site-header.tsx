import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

const ROLE_LABELS = {
  institution: "מוסד חינוכי",
  teacher: "מורה",
  admin: "אדמין",
} as const;

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 p-4">
        <Link href="/" className="shrink-0 text-base font-bold whitespace-nowrap sm:text-lg">
          דרושים למורים
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
            משרות
          </Link>
          {session?.user ? (
            <>
              <span className="hidden text-muted-foreground sm:inline">
                {session.user.email} · {ROLE_LABELS[session.user.role]}
              </span>
              <span className="text-xs text-muted-foreground sm:hidden">
                {ROLE_LABELS[session.user.role]}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost">
                  התנתקות
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                התחברות
              </Button>
              <Button nativeButton={false} render={<Link href="/register" />}>
                הרשמה
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
