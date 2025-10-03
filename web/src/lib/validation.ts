import { z } from "zod";

export const portfolioInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  year: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{4}$/.test(value), {
      message: "Year must be a four digit number",
    }),
  website: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  industry: z.string().trim().optional(),
});

export type PortfolioInput = z.infer<typeof portfolioInputSchema>;
