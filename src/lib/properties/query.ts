import type { Prisma } from "@/generated/prisma";
import type { PropertySearchQueryInput } from "@/lib/validations/property";

export function buildPropertyWhere(filters: PropertySearchQueryInput): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: "ACTIVE",
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { description: { contains: filters.q } },
      { city: { contains: filters.q } },
      { state: { contains: filters.q } },
    ];
  }

  if (filters.city) {
    where.city = { contains: filters.city };
  }

  if (typeof filters.bedrooms === "number") {
    where.bedrooms = { gte: filters.bedrooms };
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (typeof filters.minRent === "number" || typeof filters.maxRent === "number") {
    where.monthlyRent = {};
    if (typeof filters.minRent === "number") where.monthlyRent.gte = filters.minRent;
    if (typeof filters.maxRent === "number") where.monthlyRent.lte = filters.maxRent;
  }

  return where;
}

export function buildPropertyOrderBy(
  filters: PropertySearchQueryInput
): Prisma.PropertyOrderByWithRelationInput {
  return { [filters.sortBy]: filters.sortOrder };
}
