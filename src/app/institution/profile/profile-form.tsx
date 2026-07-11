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
import { INSTITUTION_TYPES } from "@/lib/taxonomy";
import { CityCombobox } from "@/components/city-combobox";
import { saveInstitutionProfile } from "./actions";

type InstitutionProfileFormProps = {
  defaultValues: {
    name: string;
    institution_type: string;
    city: string;
    contact_name: string;
    description: string;
    logo_url: string;
  };
};

export function InstitutionProfileForm({ defaultValues }: InstitutionProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveInstitutionProfile, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">פרופיל מוסד</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">שם המוסד</Label>
            <Input id="name" name="name" required defaultValue={defaultValues.name} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="institution_type">סוג מוסד</Label>
            <Select
              name="institution_type"
              defaultValue={defaultValues.institution_type || undefined}
            >
              <SelectTrigger id="institution_type" className="w-full">
                <SelectValue placeholder="בחר/י סוג מוסד" />
              </SelectTrigger>
              <SelectContent>
                {INSTITUTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city">יישוב</Label>
            <CityCombobox
              id="city"
              name="city"
              required
              defaultValue={defaultValues.city || undefined}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="contact_name">איש/אשת קשר</Label>
            <Input
              id="contact_name"
              name="contact_name"
              required
              defaultValue={defaultValues.contact_name}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={defaultValues.description}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="logo">לוגו (אופציונלי)</Label>
            {defaultValues.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={defaultValues.logo_url}
                alt="לוגו נוכחי"
                className="size-16 rounded-md border object-contain"
              />
            )}
            <Input id="logo" name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
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
