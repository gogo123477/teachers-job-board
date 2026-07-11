import { z } from "zod";
import { EDUCATION_STAGES, JOB_SCOPES, SUBJECTS } from "@/lib/taxonomy";
import { isCity } from "@/lib/cities";

export const jobPostingSchema = z.object({
  title: z.string().min(2, "כותרת התפקיד חייבת להכיל לפחות 2 תווים"),
  subject: z.enum(SUBJECTS, { error: "יש לבחור תחום הוראה" }),
  education_stage: z.enum(EDUCATION_STAGES, { error: "יש לבחור שלב חינוכי" }),
  scope: z.enum(JOB_SCOPES, { error: "יש לבחור היקף משרה" }),
  city: z.string().refine(isCity, "יש לבחור יישוב מהרשימה"),
  description: z.string().min(10, "התיאור חייב להכיל לפחות 10 תווים"),
});

export type JobPostingInput = z.infer<typeof jobPostingSchema>;
