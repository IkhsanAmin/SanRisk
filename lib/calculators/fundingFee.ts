import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface FundingFeeInput {
  positionValue: number;
  fundingRatePercent: number;
  numberOfPeriods: number;
  direction: "long" | "short";
}

export interface FundingFeeResult {
  feePerPeriod: number;
  totalFee: number;
  totalFeePercent: number;
  /** true jika trader membayar fee, false jika menerima fee */
  isPaying: boolean;
  dailyCost: number;
}

/**
 * Hitung Funding Fee untuk Crypto Futures
 * Fee per period = Position Value × Funding Rate%
 * Total Fee = Fee per Period × Number of Periods
 *
 * Jika funding rate positif:
 *   - Long membayar, Short menerima
 * Jika funding rate negatif:
 *   - Short membayar, Long menerima
 */
export function calcFundingFee(input: FundingFeeInput): FundingFeeResult {
  const posVal = new Decimal(input.positionValue);
  const rate = new Decimal(input.fundingRatePercent).div(100);
  const periods = new Decimal(input.numberOfPeriods);

  const feePerPeriod = posVal.mul(rate).abs();
  const totalFee = feePerPeriod.mul(periods);
  const totalFeePercent = totalFee.div(posVal).mul(100);

  // Tentukan apakah membayar atau menerima
  const rateIsPositive = new Decimal(input.fundingRatePercent).greaterThan(0);
  let isPaying: boolean;
  if (input.direction === "long") {
    isPaying = rateIsPositive;
  } else {
    isPaying = !rateIsPositive;
  }

  // Estimasi biaya harian (asumsi 3 periode per hari, standar exchange)
  const dailyCost = feePerPeriod.mul(3);

  return {
    feePerPeriod: feePerPeriod.toNumber(),
    totalFee: totalFee.toNumber(),
    totalFeePercent: totalFeePercent.toNumber(),
    isPaying,
    dailyCost: dailyCost.toNumber(),
  };
}
