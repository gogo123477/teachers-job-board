"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">הרשמה</CardTitle>
          <CardDescription>צור/י חשבון כמוסד חינוכי או כמורה</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <fieldset className="flex flex-col gap-2">
              <Label>סוג חשבון</Label>
              <RadioGroup name="role" defaultValue="teacher" className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="teacher" />
                  מורה
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="institution" />
                  מוסד חינוכי
                </label>
              </RadioGroup>
            </fieldset>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">מייל</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "נרשם/ת..." : "הרשמה"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
