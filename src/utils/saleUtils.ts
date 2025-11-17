// Utility for shop sale logic

const SALE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SALE_START_UTC = Date.UTC(2024, 0, 1, 0, 0, 0, 0); // Jan 1, 2024, 00:00 UTC

// Simple seeded random (for consistent discounts per item per sale period)
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getSaleState() {
  const now = Date.now();
  const msSinceStart = now - SALE_START_UTC;
  const daysSinceStart = Math.floor(msSinceStart / SALE_INTERVAL_MS);
  // Make sale days more frequent (every 2 days instead of every 3)
  const isSaleDay = daysSinceStart % 2 === 0;
  const periodStart = SALE_START_UTC + daysSinceStart * SALE_INTERVAL_MS;
  const periodEnd = periodStart + SALE_INTERVAL_MS;
  const timeUntilNextSale = isSaleDay ? 0 : periodEnd - now;
  
  // Calculate msLeft for sale countdown
  const msLeft = isSaleDay ? periodEnd - now : 0;

  return {
    isSaleDay,
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    timeUntilNextSale,
    daysSinceStart,
    msLeft
  };
}

export function getItemDiscount(itemId: string, basePrice: number) {
  const { isSaleDay, daysSinceStart } = getSaleState();
  
  if (!isSaleDay) {
    return {
      discount: 0,
      finalPrice: basePrice,
      isOnSale: false
    };
  }

  // Generate consistent discount for this item on this sale day
  const seed = parseInt(itemId.replace(/\D/g, '')) + daysSinceStart;
  const discountPercent = Math.floor(seededRandom(seed) * 30) + 10; // 10-40% discount
  const discount = Math.floor(basePrice * (discountPercent / 100));
  const finalPrice = Math.max(1, basePrice - discount);

  return {
    discount,
    finalPrice,
    isOnSale: true,
    discountPercent
  };
}

export function isItemAvailable(itemId: string): boolean {
  // All items are always available for purchase
  return true;
}

export function getItemPrice(itemId: string, basePrice: number) {
  const discountInfo = getItemDiscount(itemId, basePrice);
  return {
    originalPrice: basePrice,
    currentPrice: discountInfo.finalPrice,
    discount: discountInfo.discount,
    isOnSale: discountInfo.isOnSale,
    isAvailable: true // Always available
  };
}

export function formatSaleTime(timeMs: number): string {
  if (timeMs <= 0) return 'Now';
  
  const hours = Math.floor(timeMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Add missing functions that ShopPage expects
export function calculateDiscountedPrice(basePrice: number, discountPercent: number): number {
  const discount = Math.floor(basePrice * (discountPercent / 100));
  return Math.max(1, basePrice - discount);
}

export function getCurrentSalePeriod() {
  const { periodStart, periodEnd } = getSaleState();
  return {
    start: periodStart,
    end: periodEnd,
    isActive: getSaleState().isSaleDay
  };
}

export function isItemOnSale(itemId: string): boolean {
  const { isSaleDay } = getSaleState();
  return isSaleDay;
}

export function formatSaleCountdown(timeMs: number): string {
  // Handle invalid or negative time values
  if (!timeMs || timeMs <= 0 || isNaN(timeMs)) {
    return 'Sale ended';
  }
  
  const hours = Math.floor(timeMs / (1000 * 60 * 60));
  const minutes = Math.floor((timeMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeMs % (1000 * 60)) / 1000);
  
  // Format as HH:MM:SS
  const formatNumber = (num: number) => num.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
  } else if (minutes > 0) {
    return `${formatNumber(minutes)}:${formatNumber(seconds)}`;
  } else {
    return `${formatNumber(seconds)}s`;
  }
} 