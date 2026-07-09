import { z } from "zod";

export const registerSchema = z.object({
  email: z.email("כתובת מייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
  role: z.enum(["institution", "teacher"], {
    error: "יש לבחור סוג חשבון",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("כתובת מייל לא תקינה"),
  password: z.string().min(1, "יש להזין סיסמה"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const onboardingSchema = z.object({
  role: z.enum(["institution", "teacher"], {
    error: "יש לבחור סוג חשבון",
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
