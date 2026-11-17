import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface TradingFeeInput {
  entryValue: number;
  exitValue: number;
  makerFeePercent: number;
  takerFeePercent: number;
  entryFeeType: "maker" | "taker";
  exitFeeType: "maker" | "taker";
  direction: "long" | "short";
}

export interface TradingFeeResult {
  entryFee: number;
  exitFee: number;
  totalFee: number;
  grossPnL: number;
  netPnL: number;
  feeImpactPercent: number;
  breakEvenPrice: number;
}

/**
 * Hitung biaya trading (maker/taker) dan dampaknya terhadap PnL
 */
export function calcTradingFee(input: TradingFeeInput): TradingFeeResult {
  const entryVal = new Decimal(input.entryValue);
  const exitVal = new Decimal(input.exitValue);
  const makerPct = new Decimal(input.makerFeePercent).div(100);
  const takerPct = new Decimal(input.takerFeePercent).div(100);

  const entryFeePct = input.entryFeeType === "maker" ? makerPct : takerPct;
  const exitFeePct = input.exitFeeType === "maker" ? makerPct : takerPct;

  const entryFee = entryVal.mul(entryFeePct);
  const exitFee = exitVal.mul(exitFeePct);
  const totalFee = entryFee.plus(exitFee);

  const grossPnL = input.direction === "long"
    ? exitVal.minus(entryVal)
    : entryVal.minus(exitVal);
  const netPnL = grossPnL.minus(totalFee);
  const feeImpactPercent = totalFee.div(entryVal).mul(100);

  // Hitung break-even price (harga di mana PnL setelah fee = 0)
  // Untuk long: exitVal harus = entryVal + totalFee
  // Break-even exit price = entryValue × (1 + entryFee%) / (1 - exitFee%)
  let breakEvenPrice: Decimal;
  if (input.direction === "long") {
    breakEvenPrice = entryVal.mul(new Decimal(1).plus(entryFeePct)).div(new Decimal(1).minus(exitFeePct));
  } else {
    breakEvenPrice = entryVal.mul(new Decimal(1).minus(entryFeePct)).div(new Decimal(1).plus(exitFeePct));
  }

  return {
    entryFee: entryFee.toNumber(),
    exitFee: exitFee.toNumber(),
    totalFee: totalFee.toNumber(),
    grossPnL: grossPnL.toNumber(),
    netPnL: netPnL.toNumber(),
    feeImpactPercent: feeImpactPercent.toNumber(),
    breakEvenPrice: breakEvenPrice.toNumber(),
  };
}
