"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <AlertTriangle className="size-7" />
      </div>
      <h1 className="text-2xl font-bold">משהו השתבש</h1>
      <p className="max-w-sm text-muted-foreground">
        אירעה שגיאה בלתי צפויה. אפשר לנסות שוב, או לחזור לדף הבית.
      </p>
      <div className="flex gap-2">
        <Button onClick={() => reset()}>ניסיון חוזר</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          חזרה לדף הבית
        </Button>
      </div>
    </main>
  );
}
