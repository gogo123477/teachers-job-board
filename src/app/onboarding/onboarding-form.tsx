"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { completeOnboardingAction } from "./actions";

export function OnboardingForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(completeOnboardingAction, undefined);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">כמעט סיימנו</CardTitle>
        <CardDescription>
          {email && `${email} — `}איך תרצה/י להשתמש באתר?
        </CardDescription>
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

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "שומר/ת..." : "המשך"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
