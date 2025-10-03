import { z } from "zod";

const optionalField = z
  .string()
  .optional()
  .transform((value) => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

export const portfolioInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  year: optionalField.refine((value) => !value || /^\d{4}$/.test(value), {
    message: "Year must be a four digit number",
  }),
  website: optionalField,
  tag: optionalField,
  industry: optionalField,
});

export type PortfolioInput = z.output<typeof portfolioInputSchema>;

export type PortfolioFormValues = z.input<typeof portfolioInputSchema>;
