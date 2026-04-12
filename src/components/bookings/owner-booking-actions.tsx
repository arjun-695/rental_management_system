"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

type BookingActionResponse =
  | { ok: true; data: { id: string; status: BookingStatus } }
  | { ok: false; error: string };

type Props = {
  bookingId: string;
  currentStatus: BookingStatus;
};

export default function OwnerBookingActions({
  bookingId,
  currentStatus,
}: Props): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState<BookingStatus | null>(null);
  const [error, setError] = useState<string>("");

  async function updateStatus(nextStatus: BookingStatus): Promise<void> {
    setLoading(nextStatus);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = (await response.json()) as BookingActionResponse;
      if (!response.ok || !payload.ok) {
        setError(payload.ok ? "Failed to update booking status." : payload.error);
        return;
      }

      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (currentStatus !== "PENDING") {
    return <span className="text-xs text-muted-foreground">No action needed</span>;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void updateStatus("CONFIRMED")}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading === "CONFIRMED" ? "Approving..." : "Approve"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void updateStatus("CANCELLED")}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading === "CANCELLED" ? "Rejecting..." : "Reject"}
        </button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
