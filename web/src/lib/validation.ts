import { z } from "zod";

const optionalField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null));

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
