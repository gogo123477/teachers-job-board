import { z } from "zod";
import { EDUCATION_STAGES, JOB_SCOPES, REGIONS, SUBJECTS } from "@/lib/taxonomy";

export const jobPostingSchema = z.object({
  title: z.string().min(2, "כותרת התפקיד חייבת להכיל לפחות 2 תווים"),
  subject: z.enum(SUBJECTS, { error: "יש לבחור תחום הוראה" }),
  education_stage: z.enum(EDUCATION_STAGES, { error: "יש לבחור שלב חינוכי" }),
  scope: z.enum(JOB_SCOPES, { error: "יש לבחור היקף משרה" }),
  region: z.enum(REGIONS, { error: "יש לבחור אזור" }),
  description: z.string().min(10, "התיאור חייב להכיל לפחות 10 תווים"),
});

export type JobPostingInput = z.infer<typeof jobPostingSchema>;
