import { z } from "zod";

const optionalField = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
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
