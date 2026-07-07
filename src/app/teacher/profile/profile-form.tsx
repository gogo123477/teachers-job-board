"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EDUCATION_STAGES, REGIONS, SUBJECTS } from "@/lib/taxonomy";
import { saveTeacherProfile } from "./actions";

type TeacherProfileFormProps = {
  defaultValues: {
    full_name: string;
    subjects: string[];
    education_stages: string[];
    preferred_regions: string[];
    bio: string;
    cv_url: string;
  };
};

function CheckboxGroup({
  name,
  options,
  defaultValues,
}: {
  name: string;
  options: readonly string[];
  defaultValues: string[];
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2 text-sm">
          <Checkbox name={name} value={option} defaultChecked={defaultValues.includes(option)} />
          {option}
        </label>
      ))}
    </div>
  );
}

export function TeacherProfileForm({ defaultValues }: TeacherProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveTeacherProfile, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">פרופיל מורה</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="full_name">שם מלא</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              defaultValue={defaultValues.full_name}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>תחומי הוראה</Label>
            <CheckboxGroup
              name="subjects"
              options={SUBJECTS}
              defaultValues={defaultValues.subjects}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>שלבי חינוך</Label>
            <CheckboxGroup
              name="education_stages"
              options={EDUCATION_STAGES}
              defaultValues={defaultValues.education_stages}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>אזורים מועדפים</Label>
            <CheckboxGroup
              name="preferred_regions"
              options={REGIONS}
              defaultValues={defaultValues.preferred_regions}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">תיאור / קורות חיים</Label>
            <Textarea id="bio" name="bio" rows={4} defaultValue={defaultValues.bio} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="cv">קובץ קו&quot;ח (אופציונלי)</Label>
            {defaultValues.cv_url && (
              <a
                href={defaultValues.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline"
              >
                הקובץ הקיים
              </a>
            )}
            <Input
              id="cv"
              name="cv"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.success && (
            <p className="text-sm text-green-600">הפרופיל נשמר בהצלחה</p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "שומר..." : "שמירה"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
