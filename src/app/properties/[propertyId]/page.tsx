import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth/auth-options";
import CreateBookingForm from "@/components/bookings/create-booking-form";
import AnimatedBackground from "@/components/landing/animated-background";
import { MapPin, Home, Bed, Bath, ArrowLeft, Calendar, User } from "lucide-react";

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}): Promise<any> {
  const { propertyId } = await params;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      title: true,
      description: true,
      city: true,
      state: true,
      type: true,
      bedrooms: true,
      bathrooms: true,
      monthlyRent: true,
      coverImageUrl: true,
      availableFrom: true,
      owner: { select: { name: true } },
    },
  });

  if (!property) {
    return (
      <main className="relative min-h-screen dark flex flex-col items-center justify-center">
        <AnimatedBackground />
        <div className="glass-card z-10 p-8 rounded-2xl text-center">
          <p className="text-lg font-medium text-muted-foreground mb-4">Property not found.</p>
          <Link href="/properties" className="text-indigo-400 hover:text-indigo-300 underline">Back to listings</Link>
        </div>
      </main>
    );
  }

  const session = await getServerSession(authOptions);

  return (
    <main className="relative min-h-screen dark py-8">
      <AnimatedBackground />
      <div className="z-10 mx-auto w-full max-w-5xl px-6 animate-fade-in-up">
        
        <Link href="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-indigo-400 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="grid gap-8 md:grid-cols-3">
          
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-8 border-indigo-500/10 shadow-xl">
              {property.coverImageUrl ? (
                <img
                  src={property.coverImageUrl}
                  alt={property.title}
                  className="mb-6 h-72 w-full rounded-xl object-cover"
                />
              ) : null}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs font-medium text-indigo-400">
                <Home className="h-3.5 w-3.5" /> {property.type}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{property.title}</h1>
              <div className="flex items-center text-muted-foreground text-sm mb-6">
                <MapPin className="mr-1.5 h-4 w-4" /> {property.city}, {property.state}
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                  <Bed className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                  <Bath className="h-5 w-5 text-violet-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Available from</p>
                    <p className="font-semibold">{property.availableFrom.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>

              <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white font-bold text-xs shadow-lg">
                    {property.owner.name[0]}
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground">Listed by Owner</span>
                    <span className="font-medium text-foreground">{property.owner.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-24 border-indigo-500/20 shadow-2xl">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-indigo-400">
                    ₹{Number(property.monthlyRent).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {session?.user?.role === "TENANT" ? (
                <CreateBookingForm propertyId={property.id} />
              ) : !session?.user ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Sign in as a tenant to book this property</p>
                  <Link href="/sign-in" className="block w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500">
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
                  <p className="text-sm text-amber-500">
                    Only tenants can book properties.
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
