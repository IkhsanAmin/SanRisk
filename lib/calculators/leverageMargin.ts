import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface LeverageMarginInput {
  positionValue: number;
  leverage: number;
  accountBalance: number;
  market: "forex" | "commodity" | "crypto-futures";
}

export interface LeverageMarginResult {
  requiredMargin: number;
  marginLevel: number;
  freeMargin: number;
  usedMarginPercent: number;
  effectiveLeverage: number;
}

/**
 * Hitung Leverage & Margin
 * Required Margin = Position Value / Leverage
 * Margin Level = (Balance / Required Margin) × 100
 * Free Margin = Balance - Required Margin
 */
export function calcLeverageMargin(input: LeverageMarginInput): LeverageMarginResult {
  const posVal = new Decimal(input.positionValue);
  const lev = new Decimal(input.leverage);
  const balance = new Decimal(input.accountBalance);

  const requiredMargin = posVal.div(lev);
  const marginLevel = balance.div(requiredMargin).mul(100);
  const freeMargin = balance.minus(requiredMargin);
  const usedMarginPercent = requiredMargin.div(balance).mul(100);
  const effectiveLeverage = posVal.div(balance);

  return {
    requiredMargin: requiredMargin.toNumber(),
    marginLevel: marginLevel.toNumber(),
    freeMargin: freeMargin.toNumber(),
    usedMarginPercent: usedMarginPercent.toNumber(),
    effectiveLeverage: effectiveLeverage.toNumber(),
  };
}
