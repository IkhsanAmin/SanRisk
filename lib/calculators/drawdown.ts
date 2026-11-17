import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface MaxDrawdownResult {
  peakEquity: number;
  troughEquity: number;
  drawdownAmount: number;
  drawdownPercent: number;
  recoveryRequired: number;
  peakIndex: number;
  troughIndex: number;
}

/**
 * Hitung Maximum Drawdown dari deret ekuitas
 * Drawdown = Peak - Current
 * Drawdown% = (Drawdown / Peak) × 100
 * Recovery Required% = (Drawdown / Current) × 100
 */
export function calcMaxDrawdown(equityValues: number[]): MaxDrawdownResult {
  if (equityValues.length < 2) {
    throw new Error("Minimal 2 nilai ekuitas diperlukan");
  }

  let maxDrawdown = new Decimal(0);
  let peak = new Decimal(equityValues[0]);
  let peakIdx = 0;
  let finalPeakIdx = 0;
  let finalTroughIdx = 0;
  let currentTroughIdx = 0;

  for (let i = 1; i < equityValues.length; i++) {
    const current = new Decimal(equityValues[i]);

    if (current.greaterThan(peak)) {
      peak = current;
      peakIdx = i;
      currentTroughIdx = i;
    } else {
      const drawdown = peak.minus(current);
      if (drawdown.greaterThan(maxDrawdown)) {
        maxDrawdown = drawdown;
        finalPeakIdx = peakIdx;
        finalTroughIdx = i;
      }
      currentTroughIdx = i;
    }
  }
  void currentTroughIdx;

  const peakVal = new Decimal(equityValues[finalPeakIdx]);
  const troughVal = new Decimal(equityValues[finalTroughIdx]);

  const drawdownPct = maxDrawdown.div(peakVal).mul(100);
  const recoveryPct = troughVal.greaterThan(0)
    ? maxDrawdown.div(troughVal).mul(100)
    : new Decimal(0);

  return {
    peakEquity: peakVal.toNumber(),
    troughEquity: troughVal.toNumber(),
    drawdownAmount: maxDrawdown.toNumber(),
    drawdownPercent: drawdownPct.toNumber(),
    recoveryRequired: recoveryPct.toNumber(),
    peakIndex: finalPeakIdx,
    troughIndex: finalTroughIdx,
  };
}
