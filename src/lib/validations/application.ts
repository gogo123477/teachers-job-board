import { z } from "zod";

export const applySchema = z.object({
  message: z.string().max(1000, "ההודעה ארוכה מדי").optional(),
});

export type ApplyInput = z.infer<typeof applySchema>;
