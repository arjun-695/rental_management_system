import Link from "next/link";
import { prisma } from "@/lib/db";
import { propertySearchQuerySchema } from "@/lib/validations/property";
import { buildPropertyOrderBy, buildPropertyWhere } from "@/lib/properties/query";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<JSX.Element> {
  const params = await searchParams;
  const normalized: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") normalized[key] = value;
  });

  const parsed = propertySearchQuerySchema.safeParse(normalized);
  const filters = parsed.success ? parsed.data : propertySearchQuerySchema.parse({});

  const where = buildPropertyWhere(filters);
  const orderBy = buildPropertyOrderBy(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: filters.pageSize,
      select: {
        id: true,
        title: true,
        city: true,
        state: true,
        type: true,
        bedrooms: true,
        bathrooms: true,
        monthlyRent: true,
      },
    }),
    prisma.property.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Property Listings</h1>

      <form className="mb-6 grid grid-cols-1 gap-3 rounded border p-4 md:grid-cols-6">
        <input name="q" defaultValue={filters.q ?? ""} placeholder="Search..." className="rounded border p-2 md:col-span-2" />
        <input name="city" defaultValue={filters.city ?? ""} placeholder="City" className="rounded border p-2" />
        <input name="minRent" defaultValue={filters.minRent ?? ""} placeholder="Min rent" type="number" className="rounded border p-2" />
        <input name="maxRent" defaultValue={filters.maxRent ?? ""} placeholder="Max rent" type="number" className="rounded border p-2" />
        <button type="submit" className="rounded bg-black p-2 text-white">Apply</button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((row) => (
          <Link key={row.id} href={`/properties/${row.id}`} className="rounded border p-4 hover:bg-zinc-50">
            <h2 className="text-lg font-semibold">{row.title}</h2>
            <p className="text-sm text-zinc-600">{row.city}, {row.state}</p>
            <p className="text-sm">{row.type} • {row.bedrooms} bed • {row.bathrooms} bath</p>
            <p className="mt-2 font-medium">₹{Number(row.monthlyRent).toLocaleString("en-IN")}/month</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <p>Page {filters.page} of {totalPages}</p>
      </div>
    </main>
  );
}
