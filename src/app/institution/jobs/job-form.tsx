"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDUCATION_STAGES, JOB_SCOPES, SUBJECTS } from "@/lib/taxonomy";
import { CityCombobox } from "@/components/city-combobox";
import type { JobFormState } from "./actions";

type JobFormProps = {
  title: string;
  action: (state: JobFormState, formData: FormData) => Promise<JobFormState>;
  submitLabel: string;
  defaultValues?: {
    title: string;
    subject: string;
    education_stage: string;
    scope: string;
    city: string;
    description: string;
  };
};

export function JobForm({ title, action, submitLabel, defaultValues }: JobFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">תפקיד</Label>
            <Input id="title" name="title" required defaultValue={defaultValues?.title} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="subject">תחום הוראה</Label>
            <Select name="subject" defaultValue={defaultValues?.subject || undefined}>
              <SelectTrigger id="subject" className="w-full">
                <SelectValue placeholder="בחר/י תחום הוראה" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="education_stage">שלב חינוכי</Label>
            <Select
              name="education_stage"
              defaultValue={defaultValues?.education_stage || undefined}
            >
              <SelectTrigger id="education_stage" className="w-full">
                <SelectValue placeholder="בחר/י שלב חינוכי" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="scope">היקף משרה</Label>
            <Select name="scope" defaultValue={defaultValues?.scope || undefined}>
              <SelectTrigger id="scope" className="w-full">
                <SelectValue placeholder="בחר/י היקף משרה" />
              </SelectTrigger>
              <SelectContent>
                {JOB_SCOPES.map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {scope}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city">יישוב</Label>
            <CityCombobox id="city" name="city" required defaultValue={defaultValues?.city} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">תיאור ותנאים</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              required
              defaultValue={defaultValues?.description}
            />
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "שומר..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
