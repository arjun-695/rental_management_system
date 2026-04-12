import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import AnimatedBackground from "@/components/landing/animated-background";
import { CalendarClock, MapPin, Users, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import RazorpayButton from "@/components/payments/razorpay-button";

export default async function TenantBookingsPage(): Promise<any> {
  const session = await requireRole(["TENANT"]);

  const rows = await prisma.booking.findMany({
    where: { tenantId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      checkIn: true,
      checkOut: true,
      guests: true,
      status: true,
      totalAmount: true,
      property: { select: { id: true, title: true, city: true } },
      payment: { select: { status: true } }
    },
  });

  return (
    <main className="relative min-h-screen dark py-8">
      <AnimatedBackground />
      <div className="z-10 mx-auto w-full max-w-4xl px-6 animate-fade-in-up">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage and view your property stay requests.</p>
        </header>

        <div className="space-y-4">
          {rows.map((row: any) => (
            <div key={row.id} className="glass-card flex flex-col md:flex-row justify-between gap-4 rounded-2xl p-6 shadow-xl shadow-indigo-500/5 border-indigo-500/10 transition-all hover:scale-[1.01]">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={`/properties/${row.property.id}`} className="font-semibold text-lg hover:text-indigo-400 transition-colors">
                      {row.property.title}
                    </Link>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      row.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      row.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {row.property.city}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-foreground">
                    <CalendarClock className="h-4 w-4 text-indigo-400" />
                    <span>{row.checkIn.toDateString()}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{row.checkOut.toDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" /> {row.guests} {row.guests === 1 ? 'Guest' : 'Guests'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between items-start md:items-end md:border-l border-border/50 md:pl-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-indigo-400 mb-3">
                    ₹{Number(row.totalAmount).toLocaleString("en-IN")}
                  </p>
                  
                  {row.status === "CONFIRMED" && (!row.payment || row.payment.status === "PENDING" || row.payment.status === "FAILED") && (
                    <RazorpayButton bookingId={row.id} />
                  )}
                  {row.payment?.status === "SUCCESS" && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="h-4 w-4" /> Paid
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground glass-card rounded-2xl">
              <CalendarClock className="mb-4 h-12 w-12 opacity-20" />
              <p>You haven't made any booking requests yet.</p>
              <Link href="/properties" className="mt-4 text-indigo-400 hover:underline">
                Browse properties
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
