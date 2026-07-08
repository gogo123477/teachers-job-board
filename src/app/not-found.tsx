import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <SearchX className="size-7" />
      </div>
      <h1 className="text-2xl font-bold">הדף לא נמצא</h1>
      <p className="max-w-sm text-muted-foreground">
        ייתכן שהדף הוסר, הכתובת השתנתה, או שאין לך הרשאה לצפות בתוכן הזה.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>
        חזרה לדף הבית
      </Button>
    </main>
  );
}
