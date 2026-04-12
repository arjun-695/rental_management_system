"use client";
import { useState } from "react";
import AnimatedBackground from "@/components/landing/animated-background";
import { Building2, Home, MapPin, AlignLeft, Info, CalendarClock } from "lucide-react";

type CreateBookingResponse =
  | { ok: true; data: { id: string; status: string } }
  | { ok: false; error: string };

type Props = {
  propertyId: string;
};

export default function CreateBookingForm({ propertyId }: Props): any {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<string>("1");
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        checkIn,
        checkOut,
        guests: Number(guests),
      }),
    });

    const body = (await response.json()) as CreateBookingResponse;

    if (!response.ok || !body.ok) {
      setMessage(body.ok ? "Could not create booking request." : body.error);
      return;
    }

    setIsSuccess(true);
    setMessage(`Booking created! Status: ${body.data.status}`);
    setCheckIn("");
    setCheckOut("");
    setGuests("1");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">Check-in Date</label>
        <input
          type="date"
          className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">Check-out Date</label>
        <input
          type="date"
          className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">Number of Guests</label>
        <input
          type="number"
          min={1}
          max={10}
          className="w-full rounded-xl border border-border/50 bg-background/50 py-2.5 px-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="mt-2 w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
      >
        <CalendarClock className="h-4 w-4" />
        Request Booking
      </button>

      {message && (
        <div className={`rounded-xl p-3 text-sm flex items-start gap-2 border ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{message}</p>
        </div>
      )}
    </form>
  );
}
