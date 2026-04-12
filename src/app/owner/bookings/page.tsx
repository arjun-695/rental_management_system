import Link from "next/link";
import { CalendarClock, MapPin, UserRound } from "lucide-react";
import type { JSX } from "react";

import AnimatedBackground from "@/components/landing/animated-background";
import OwnerBookingActions from "@/components/bookings/owner-booking-actions";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export default async function OwnerBookingsPage(): Promise<JSX.Element> {
  const session = await requireRole(["OWNER", "ADMIN"]);

  const where =
    session.user.role === "ADMIN"
      ? {}
      : {
          property: {
            ownerId: session.user.id,
          },
        };

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      checkIn: true,
      checkOut: true,
      guests: true,
      totalAmount: true,
      createdAt: true,
      property: {
        select: {
          id: true,
          title: true,
          city: true,
        },
      },
      tenant: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <main className="relative min-h-screen dark py-8">
      <AnimatedBackground />
      <div className="z-10 mx-auto w-full max-w-5xl px-6 animate-fade-in-up">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Booking Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve tenant bookings for your listings.
          </p>
        </header>

        <div className="space-y-4">
          {bookings.map((row) => (
            <div
              key={row.id}
              className="glass-card rounded-2xl border border-emerald-500/10 p-5 shadow-xl shadow-emerald-500/5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/properties/${row.property.id}`}
                      className="text-lg font-semibold text-foreground hover:text-emerald-400"
                    >
                      {row.property.title}
                    </Link>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        row.status === "CONFIRMED"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : row.status === "PENDING"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border-red-500/20 bg-red-500/10 text-red-400"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {row.property.city}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5" />
                    {row.tenant.name} ({row.tenant.email})
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-foreground">
                    <CalendarClock className="h-3.5 w-3.5 text-emerald-400" />
                    {row.checkIn.toDateString()} to {row.checkOut.toDateString()} • {row.guests} guest(s)
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Amount: Rs {Number(row.totalAmount).toLocaleString("en-IN")}
                  </p>
                </div>

                <OwnerBookingActions
                  bookingId={row.id}
                  currentStatus={row.status}
                />
              </div>
            </div>
          ))}

          {bookings.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
              No booking requests found yet.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
