import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface RiskPerTradeInput {
  accountBalance: number;
  entryPrice: number;
  stopLossPrice: number;
  positionSize: number; // lot size or coin quantity
  contractSize?: number; // for forex/commodity (default 1)
  tradingFeePercent?: number;
}

export interface RiskPerTradeResult {
  riskAmount: number;
  riskPercent: number;
  potentialLoss: number;
  feeAmount: number;
  remainingBalance: number;
}

/**
 * Hitung Risk per Trade dari posisi yang sudah ditentukan
 * Risk Amount = |Entry - SL| × Position Size × Contract Size
 */
export function calcRiskPerTrade(input: RiskPerTradeInput): RiskPerTradeResult {
  const balance = new Decimal(input.accountBalance);
  const entry = new Decimal(input.entryPrice);
  const sl = new Decimal(input.stopLossPrice);
  const posSize = new Decimal(input.positionSize);
  const contractSize = new Decimal(input.contractSize ?? 1);
  const feePct = new Decimal(input.tradingFeePercent ?? 0).div(100);

  const slDistance = entry.minus(sl).abs();
  const potentialLoss = slDistance.mul(posSize).mul(contractSize);
  const positionValue = entry.mul(posSize).mul(contractSize);
  const feeAmount = positionValue.mul(feePct).mul(2); // entry + exit
  const riskAmount = potentialLoss.plus(feeAmount);
  const riskPercent = riskAmount.div(balance).mul(100);
  const remainingBalance = balance.minus(riskAmount);

  return {
    riskAmount: riskAmount.toNumber(),
    riskPercent: riskPercent.toNumber(),
    potentialLoss: potentialLoss.toNumber(),
    feeAmount: feeAmount.toNumber(),
    remainingBalance: remainingBalance.toNumber(),
  };
}
