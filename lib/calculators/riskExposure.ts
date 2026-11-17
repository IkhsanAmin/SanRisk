import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface Position {
  id: string;
  name: string;
  direction: "long" | "short";
  riskAmount: number;
}

export interface RiskExposureResult {
  totalRiskAmount: number;
  totalRiskPercent: number;
  remainingRiskBudget: number;
  remainingRiskPercent: number;
  positions: Array<{
    id: string;
    name: string;
    direction: "long" | "short";
    riskAmount: number;
    riskPercent: number;
  }>;
}

/**
 * Hitung total eksposur risiko dari beberapa posisi
 */
export function calcRiskExposure(
  positions: Position[],
  accountBalance: number,
  maxRiskPercent?: number
): RiskExposureResult {
  const balance = new Decimal(accountBalance);
  const maxRisk = new Decimal(maxRiskPercent ?? 100).div(100);
  const maxRiskAmount = balance.mul(maxRisk);

  let totalRisk = new Decimal(0);
  const positionsWithPercent = positions.map((pos) => {
    const riskAmt = new Decimal(pos.riskAmount);
    totalRisk = totalRisk.plus(riskAmt);
    const riskPct = riskAmt.div(balance).mul(100);
    return {
      ...pos,
      riskPercent: riskPct.toNumber(),
    };
  });

  const totalRiskPercent = totalRisk.div(balance).mul(100);
  const remainingBudget = maxRiskAmount.minus(totalRisk);
  const remainingPercent = maxRisk.mul(100).minus(totalRiskPercent);

  return {
    totalRiskAmount: totalRisk.toNumber(),
    totalRiskPercent: totalRiskPercent.toNumber(),
    remainingRiskBudget: remainingBudget.toNumber(),
    remainingRiskPercent: remainingPercent.toNumber(),
    positions: positionsWithPercent,
  };
}
