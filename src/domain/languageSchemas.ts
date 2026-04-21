import { z } from "zod";

export const languageResponseSchema = z.object({
  code: z.string()
});

export type LanguageResponse = z.infer<typeof languageResponseSchema>;
