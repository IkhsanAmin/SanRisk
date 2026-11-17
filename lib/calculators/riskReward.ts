import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type TradeDirection = "long" | "short";

export interface RiskRewardInput {
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  direction: TradeDirection;
  positionSize?: number;
  contractSize?: number;
}

export interface RiskRewardResult {
  riskDistance: number;
  rewardDistance: number;
  rrRatio: number;
  riskPercent: number;
  rewardPercent: number;
  potentialLoss: number | null;
  potentialProfit: number | null;
}

/**
 * Hitung Risk/Reward ratio
 * Risk   = |Entry - SL|
 * Reward = |TP - Entry|
 * R:R    = Reward / Risk
 * 
 * Validasi arah:
 * Long:  SL < Entry < TP
 * Short: TP < Entry < SL
 */
export function calcRiskReward(input: RiskRewardInput): RiskRewardResult {
  const entry = new Decimal(input.entryPrice);
  const sl = new Decimal(input.stopLossPrice);
  const tp = new Decimal(input.takeProfitPrice);

  const riskDistance = entry.minus(sl).abs();
  const rewardDistance = tp.minus(entry).abs();
  const rrRatio = rewardDistance.div(riskDistance);
  const riskPercent = riskDistance.div(entry).mul(100);
  const rewardPercent = rewardDistance.div(entry).mul(100);

  let potentialLoss: number | null = null;
  let potentialProfit: number | null = null;

  if (input.positionSize !== undefined) {
    const posSize = new Decimal(input.positionSize);
    const contractSize = new Decimal(input.contractSize ?? 1);
    potentialLoss = riskDistance.mul(posSize).mul(contractSize).toNumber();
    potentialProfit = rewardDistance.mul(posSize).mul(contractSize).toNumber();
  }

  return {
    riskDistance: riskDistance.toNumber(),
    rewardDistance: rewardDistance.toNumber(),
    rrRatio: rrRatio.toDecimalPlaces(2).toNumber(),
    riskPercent: riskPercent.toNumber(),
    rewardPercent: rewardPercent.toNumber(),
    potentialLoss,
    potentialProfit,
  };
}
