"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { applyToJob } from "./actions";

export function ApplySection({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(
    applyToJob.bind(null, jobId),
    undefined
  );

  if (state?.success) {
    return <p className="text-sm text-green-600">המועמדות הוגשה בהצלחה!</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Textarea name="message" placeholder="הודעה אופציונלית למוסד..." rows={3} />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "שולח..." : "הגש מועמדות"}
      </Button>
    </form>
  );
}
