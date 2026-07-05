import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl">דרושים למורים</CardTitle>
          <CardDescription>לוח משרות למוסדות חינוך ולמורים</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">התחילו כאן</Button>
        </CardContent>
      </Card>
    </main>
  );
}
