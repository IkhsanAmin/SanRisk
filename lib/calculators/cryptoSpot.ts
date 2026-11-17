import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface CryptoSpotPositionSizeInput {
  accountBalance: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  takerFeePercent?: number; // default 0.1%
}

export interface CryptoSpotPositionSizeResult {
  riskAmount: number;
  stopLossDistance: number;
  stopLossPercent: number;
  coinQuantity: number;
  positionValue: number;
  estimatedFee: number;
  netPositionValue: number;
}

export interface CryptoSpotPnLInput {
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  feePercent: number;
  direction: "buy" | "sell";
}

export interface CryptoSpotPnLResult {
  entryValue: number;
  exitValue: number;
  entryFee: number;
  exitFee: number;
  totalFee: number;
  grossPnL: number;
  netPnL: number;
  netPnLPercent: number;
}

/**
 * Hitung ukuran posisi Crypto Spot
 * Rumus: Quantity = Risk Amount / |Entry - SL| + fee adjustment
 */
export function calcCryptoSpotPositionSize(
  input: CryptoSpotPositionSizeInput
): CryptoSpotPositionSizeResult {
  const balance = new Decimal(input.accountBalance);
  const riskPct = new Decimal(input.riskPercent).div(100);
  const entry = new Decimal(input.entryPrice);
  const sl = new Decimal(input.stopLossPrice);
  const feePct = new Decimal(input.takerFeePercent ?? 0.1).div(100);

  const riskAmount = balance.mul(riskPct);
  const slDistance = entry.minus(sl).abs();
  const slPercent = slDistance.div(entry).mul(100);

  // Quantity tanpa fee
  const rawQty = riskAmount.div(slDistance);

  // Kurangi quantity untuk memperhitungkan biaya entry
  // Position value = quantity × entry
  // Fee entry = positionValue × feePercent
  // Quantity adjusted = riskAmount / (slDistance + entry × feePercent)
  const adjustedQty = riskAmount.div(slDistance.plus(entry.mul(feePct)));

  const positionValue = adjustedQty.mul(entry);
  const estimatedFee = positionValue.mul(feePct);
  const netPositionValue = positionValue.plus(estimatedFee);

  void rawQty; // suppress unused warning

  return {
    riskAmount: riskAmount.toNumber(),
    stopLossDistance: slDistance.toNumber(),
    stopLossPercent: slPercent.toNumber(),
    coinQuantity: adjustedQty.toDecimalPlaces(8, Decimal.ROUND_DOWN).toNumber(),
    positionValue: positionValue.toNumber(),
    estimatedFee: estimatedFee.toNumber(),
    netPositionValue: netPositionValue.toNumber(),
  };
}

/**
 * Hitung Profit/Loss Crypto Spot
 */
export function calcCryptoSpotPnL(input: CryptoSpotPnLInput): CryptoSpotPnLResult {
  const entry = new Decimal(input.entryPrice);
  const exit = new Decimal(input.exitPrice);
  const qty = new Decimal(input.quantity);
  const feePct = new Decimal(input.feePercent).div(100);

  const entryValue = entry.mul(qty);
  const exitValue = exit.mul(qty);
  const entryFee = entryValue.mul(feePct);
  const exitFee = exitValue.mul(feePct);
  const totalFee = entryFee.plus(exitFee);

  const grossPnL = input.direction === "buy"
    ? exitValue.minus(entryValue)
    : entryValue.minus(exitValue);

  const netPnL = grossPnL.minus(totalFee);
  const netPnLPercent = netPnL.div(entryValue).mul(100);

  return {
    entryValue: entryValue.toNumber(),
    exitValue: exitValue.toNumber(),
    entryFee: entryFee.toNumber(),
    exitFee: exitFee.toNumber(),
    totalFee: totalFee.toNumber(),
    grossPnL: grossPnL.toNumber(),
    netPnL: netPnL.toNumber(),
    netPnLPercent: netPnLPercent.toNumber(),
  };
}
