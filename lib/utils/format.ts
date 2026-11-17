/** Format angka sebagai mata uang */
export function formatCurrency(
  value: number,
  currency = "USD",
  maximumFractionDigits = 2
): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(value);
}

/** Format angka dengan pemisah ribuan */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format persentase */
export function formatPercent(value: number, decimals = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

/** Format R:R Ratio */
export function formatRR(value: number): string {
  return `1:${formatNumber(value, 2)}`;
}

/** Format lot size */
export function formatLots(value: number): string {
  return `${formatNumber(value, 2)} lot`;
}

/** Format harga dengan desimal dinamis */
export function formatPrice(value: number): string {
  if (value >= 1000) return formatNumber(value, 2);
  if (value >= 1) return formatNumber(value, 4);
  return formatNumber(value, 6);
}

/** Clamp nilai antara min dan max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
