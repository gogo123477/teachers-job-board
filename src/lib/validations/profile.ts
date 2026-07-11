import { z } from "zod";
import {
  EDUCATION_STAGES,
  INSTITUTION_TYPES,
  SUBJECTS,
} from "@/lib/taxonomy";
import { isCity } from "@/lib/cities";

export const institutionProfileSchema = z.object({
  name: z.string().min(2, "שם המוסד חייב להכיל לפחות 2 תווים"),
  institution_type: z.enum(INSTITUTION_TYPES, { error: "יש לבחור סוג מוסד" }),
  city: z.string().refine(isCity, "יש לבחור יישוב מהרשימה"),
  contact_name: z.string().min(2, "שם איש הקשר חייב להכיל לפחות 2 תווים"),
  description: z.string().max(2000).optional(),
});

export type InstitutionProfileInput = z.infer<typeof institutionProfileSchema>;

export const teacherProfileSchema = z.object({
  full_name: z.string().min(2, "שם מלא חייב להכיל לפחות 2 תווים"),
  subjects: z.array(z.enum(SUBJECTS)).min(1, "יש לבחור לפחות תחום הוראה אחד"),
  education_stages: z
    .array(z.enum(EDUCATION_STAGES))
    .min(1, "יש לבחור לפחות שלב חינוכי אחד"),
  preferred_cities: z
    .array(z.string().refine(isCity, "יש לבחור יישוב מהרשימה"))
    .min(1, "יש לבחור לפחות יישוב אחד"),
  bio: z.string().max(2000).optional(),
});

export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>;
