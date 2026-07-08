import Link from "next/link";
import { GraduationCap, School, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Search,
    title: "חיפוש ממוקד",
    text: "סינון לפי תחום הוראה, שלב חינוכי, אזור והיקף משרה",
  },
  {
    icon: GraduationCap,
    title: "פרופיל אחד",
    text: "מורים בונים פרופיל פעם אחת ומגישים מועמדות בלחיצה",
  },
  {
    icon: School,
    title: "פרסום חינם",
    text: "מוסדות חינוך מפרסמים משרות ורואים את כל המועמדים במקום אחד",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 px-8 py-20 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          לוח המשרות למגזר החינוך
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          מוסדות חינוך מפרסמים משרות, מורים בונים פרופיל אחד ומוצאים את המשרה
          הבאה שלהם.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/register?role=institution" />}
          >
            אני מוסד חינוכי — פרסמו משרה
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/jobs" />}
          >
            אני מורה — חפשו משרה
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 px-8 pb-20 sm:grid-cols-3 max-w-4xl mx-auto w-full">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
