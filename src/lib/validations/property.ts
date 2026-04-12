import { z } from "zod";

export const createPropertySchema = z
  .object({
    title: z.string().trim().min(5).max(120),
    description: z.string().trim().min(30).max(4000),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    country: z.string().trim().min(2).max(80).default("India"),
    addressLine1: z.string().trim().min(5).max(200),
    addressLine2: z.string().trim().max(200).optional(),
    postalCode: z.string().trim().min(4).max(12),
    type: z.enum(["APARTMENT", "HOUSE", "STUDIO", "VILLA", "PG"]),
    bedrooms: z.coerce.number().int().min(0).max(20),
    bathrooms: z.coerce.number().int().min(1).max(20),
    areaSqft: z.coerce.number().int().min(50).max(50000).optional(),
    monthlyRent: z.coerce.number().positive().max(1_000_000),
    securityDeposit: z.coerce.number().min(0).max(10_000_000).optional(),
    availableFrom: z.coerce.date(),
  })
  .strict();

export const updatePropertySchema = createPropertySchema.partial().strict();

export const propertySearchQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  type: z.enum(["APARTMENT", "HOUSE", "STUDIO", "VILLA", "PG"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(["createdAt", "monthlyRent", "availableFrom"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertySearchQueryInput = z.infer<typeof propertySearchQuerySchema>;
