"use client";

import { useState } from "react";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeaveReviewButton({ bookingId, propertyTitle }: { bookingId: string, propertyTitle: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      const data = await res.json();
      if (data.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert(data.error || "Failed to submit review");
      }
    } catch (e) {
      alert("Error submitting review");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-400 transition-all hover:bg-violet-500/20"
      >
        <Star className="h-4 w-4" /> Leave Review
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-background p-6 shadow-2xl animate-fade-in-up">
            <h3 className="mb-2 text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-400" />
              Review Your Stay
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Rate your experience at {propertyTitle}
            </p>

            <div className="mb-6 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`transition-colors ${star <= rating ? "text-amber-400" : "text-muted-foreground/30"}`}
                >
                  <Star className="h-10 w-10 fill-current" />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience..."
              rows={4}
              className="mb-6 w-full resize-none rounded-xl border border-border/50 bg-background/50 p-3 text-sm outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
