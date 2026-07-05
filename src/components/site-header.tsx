import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-bold">
          דרושים למורים
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
            משרות
          </Link>
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            התחברות
          </Button>
          <Button nativeButton={false} render={<Link href="/register" />}>
            הרשמה
          </Button>
        </nav>
      </div>
    </header>
  );
}
