import { prisma } from "@/lib/db";

/**
 * Overlap rule:
 * existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
 */
export async function hasBookingConflict(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  const overlapCount = await prisma.booking.count({
    where: {
      propertyId,
      status: { in: ["PENDING", "CONFIRMED"] },
      AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
    },
  });

  return overlapCount > 0;
}
