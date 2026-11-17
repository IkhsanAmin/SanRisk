import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type TradeDirection = "long" | "short";

export interface StopLossInput {
  accountBalance: number;
  riskPercent?: number;
  riskAmount?: number;
  entryPrice: number;
  positionSize: number;
  contractSize?: number;
  direction: TradeDirection;
}

export interface StopLossResult {
  stopLossPrice: number;
  stopLossDistance: number;
  stopLossPercent: number;
  maxPotentialLoss: number;
  riskPercent: number;
}

export interface TakeProfitInput {
  entryPrice: number;
  stopLossPrice: number;
  rrRatio: number;
  direction: TradeDirection;
  positionSize?: number;
  contractSize?: number;
}

export interface TakeProfitResult {
  takeProfitPrice: number;
  riskDistance: number;
  rewardDistance: number;
  rrRatio: number;
  potentialProfit: number | null;
}

/**
 * Hitung Stop Loss berdasarkan risiko
 * SL Distance = Risk Amount / (Position Size × Contract Size)
 * Long:  SL Price = Entry - SL Distance
 * Short: SL Price = Entry + SL Distance
 */
export function calcStopLoss(input: StopLossInput): StopLossResult {
  const balance = new Decimal(input.accountBalance);
  const entry = new Decimal(input.entryPrice);
  const posSize = new Decimal(input.positionSize);
  const contractSize = new Decimal(input.contractSize ?? 1);

  let riskAmt: Decimal;
  if (input.riskAmount !== undefined) {
    riskAmt = new Decimal(input.riskAmount);
  } else {
    riskAmt = balance.mul(new Decimal(input.riskPercent ?? 1).div(100));
  }

  const slDistance = riskAmt.div(posSize.mul(contractSize));
  const slPercent = slDistance.div(entry).mul(100);

  const slPrice =
    input.direction === "long"
      ? entry.minus(slDistance)
      : entry.plus(slDistance);

  const riskPercent = riskAmt.div(balance).mul(100);

  return {
    stopLossPrice: slPrice.toDecimalPlaces(5, Decimal.ROUND_HALF_UP).toNumber(),
    stopLossDistance: slDistance.toNumber(),
    stopLossPercent: slPercent.toNumber(),
    maxPotentialLoss: riskAmt.toNumber(),
    riskPercent: riskPercent.toNumber(),
  };
}

/**
 * Hitung Take Profit berdasarkan R:R ratio
 * Reward Distance = Risk Distance × R:R Ratio
 * Long:  TP Price = Entry + Reward Distance
 * Short: TP Price = Entry - Reward Distance
 */
export function calcTakeProfit(input: TakeProfitInput): TakeProfitResult {
  const entry = new Decimal(input.entryPrice);
  const sl = new Decimal(input.stopLossPrice);
  const rr = new Decimal(input.rrRatio);

  const riskDistance = entry.minus(sl).abs();
  const rewardDistance = riskDistance.mul(rr);

  const tpPrice =
    input.direction === "long"
      ? entry.plus(rewardDistance)
      : entry.minus(rewardDistance);

  let potentialProfit: number | null = null;
  if (input.positionSize !== undefined) {
    const contractSize = new Decimal(input.contractSize ?? 1);
    potentialProfit = rewardDistance
      .mul(input.positionSize)
      .mul(contractSize)
      .toNumber();
  }

  return {
    takeProfitPrice: tpPrice.toDecimalPlaces(5, Decimal.ROUND_HALF_UP).toNumber(),
    riskDistance: riskDistance.toNumber(),
    rewardDistance: rewardDistance.toNumber(),
    rrRatio: rr.toNumber(),
    potentialProfit,
  };
}
