import prisma from "@/lib/prisma";

export interface PriceCalculationResult {
  totalAmount: number;
  breakdown: Array<{
    hour: number;
    basePrice: number;
    finalPrice: number;
  }>;
}

/**
 * Authoritative server-side price calculation.
 * Prevents client-side price tampering by recalculating price against
 * the database pricing config and active special offers.
 */
export async function calculateServerPrice(
  date: Date,
  startHour: number,
  durationHours: number
): Promise<PriceCalculationResult> {
  // Fetch default pricing config from database
  let pricing = await prisma.pricing.findUnique({
    where: { id: "default" },
  });

  if (!pricing) {
    pricing = {
      id: "default",
      offPeak: 800,
      peak: 1100,
      peakStart: 19,
    };
  }

  // Set boundary for the date to query active offers
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  const endOfCheckDay = new Date(checkDate);
  endOfCheckDay.setHours(23, 59, 59, 999);

  const offers = await prisma.specialOffer.findMany({
    where: {
      active: true,
      startDate: { lte: endOfCheckDay },
      endDate: { gte: checkDate },
    },
  });

  let totalAmount = 0;
  const breakdown: PriceCalculationResult["breakdown"] = [];

  for (let i = 0; i < durationHours; i++) {
    const h = (startHour + i) % 24;
    const isOffPeak = h >= 6 && h < pricing.peakStart;
    const basePrice = isOffPeak ? pricing.offPeak : pricing.peak;
    const slotType = isOffPeak ? "OFF_PEAK" : "PEAK";

    let bestFixedPrice: number | null = null;
    let bestDiscount = 0;

    for (const offer of offers) {
      const start = new Date(offer.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(offer.endDate);
      end.setHours(23, 59, 59, 999);

      if (checkDate >= start && checkDate <= end) {
        if (offer.slotType === "BOTH" || offer.slotType === slotType) {
          if (offer.fixedPrice !== null && offer.fixedPrice !== undefined) {
            if (bestFixedPrice === null || offer.fixedPrice < bestFixedPrice) {
              bestFixedPrice = offer.fixedPrice;
            }
          } else if (offer.discountPct > bestDiscount) {
            bestDiscount = offer.discountPct;
          }
        }
      }
    }

    const finalPrice =
      bestFixedPrice !== null
        ? bestFixedPrice
        : basePrice - basePrice * (bestDiscount / 100);

    totalAmount += finalPrice;
    breakdown.push({
      hour: h,
      basePrice,
      finalPrice,
    });
  }

  return {
    totalAmount: Math.round(totalAmount),
    breakdown,
  };
}
