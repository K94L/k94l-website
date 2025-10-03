import { z } from "zod";

export const portfolioInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  year: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .refine((value) => !value || /^\d{4}$/.test(value), {
      message: "Year must be a four digit number",
    }),
  website: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  tag: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  industry: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
});

export type PortfolioInput = z.infer<typeof portfolioInputSchema>;
