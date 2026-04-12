import Link from "next/link";
import { prisma } from "@/lib/db";
import { propertySearchQuerySchema } from "@/lib/validations/property";
import { buildPropertyOrderBy, buildPropertyWhere } from "@/lib/properties/query";
import { MapPin, Search, Filter, Home, Bed, Bath } from "lucide-react";
import AnimatedBackground from "@/components/landing/animated-background";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<any> {
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
        imageUrls: true,
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
    <main className="relative min-h-screen dark py-8">
      <AnimatedBackground />
      <div className="z-10 mx-auto w-full max-w-6xl px-6 animate-fade-in-up">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Explore Properties</h1>
          <p className="text-muted-foreground mt-1">Find your next perfect home from our verified listings.</p>
        </header>

        <form className="glass-card mb-8 grid grid-cols-1 gap-4 rounded-2xl p-6 shadow-xl shadow-indigo-500/5 md:grid-cols-6 border-indigo-500/10">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Search by keyword..."
              className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              name="city"
              defaultValue={filters.city ?? ""}
              placeholder="City"
              className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              name="minRent"
              defaultValue={filters.minRent ?? ""}
              placeholder="Min rent"
              type="number"
              className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              name="maxRent"
              defaultValue={filters.maxRent ?? ""}
              placeholder="Max rent"
              type="number"
              className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]">
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
          <Link
            key={row.id}
            href={`/properties/${row.id}`}
            className="group glass-card flex flex-col rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30"
          >
            {Array.isArray(row.imageUrls) && row.imageUrls.length > 0 ? (
              <img
                src={row.imageUrls[0] as string}
                alt={row.title}
                className="mb-4 h-40 w-full rounded-xl border border-white/5 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="mb-4 flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-white/5">
                <Home className="h-10 w-10 text-indigo-400 opacity-50" />
              </div>
            )}
              <div className="flex-1">
                <h2 className="text-lg font-bold group-hover:text-indigo-400 transition-colors">{row.title}</h2>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  {row.city}, {row.state}
                </div>
                <div className="mt-4 gap-3 flex flex-wrap text-sm font-medium text-foreground">
                  <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 border border-white/10 text-xs">
                    <Home className="h-3 w-3" /> {row.type}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 border border-white/10 text-xs">
                    <Bed className="h-3 w-3" /> {row.bedrooms} Beds
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 border border-white/10 text-xs">
                    <Bath className="h-3 w-3" /> {row.bathrooms} Baths
                  </span>
                </div>
              </div>
              <div className="mt-5 border-t border-border/50 pt-4 text-right">
                <span className="text-2xl font-extrabold text-indigo-400">
                  ₹{Number(row.monthlyRent).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-muted-foreground ml-1">/ mo</span>
              </div>
            </Link>
          ))}
        </div>

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground glass-card rounded-2xl">
            <Home className="mb-4 h-12 w-12 opacity-20" />
            <p>No properties found matching your criteria.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <span className="rounded-full bg-white/5 px-4 py-1.5 text-sm font-medium border border-white/10">
              Page {filters.page} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
