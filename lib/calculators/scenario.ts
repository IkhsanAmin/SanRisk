import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface ScenarioInput {
  initialBalance: number;
  riskPerTradePercent: number;
  winRatePercent: number;
  rrRatio: number;
  numberOfTrades: number;
  /** Jika true, simulasi Monte Carlo (random). Jika false, simulasi alternating pattern. */
  randomize: boolean;
}

export interface ScenarioResult {
  finalBalance: number;
  totalPnL: number;
  totalReturnPercent: number;
  maxDrawdownPercent: number;
  winCount: number;
  lossCount: number;
  equityCurve: number[];
  /** Ekspektasi profit per trade dalam currency */
  expectancy: number;
  /** Ekspektasi profit per trade dalam persen */
  expectancyPercent: number;
}

/**
 * Simulasi skenario trading berdasarkan parameter risiko.
 * Menghitung ekuitas akhir, drawdown, dan equity curve.
 */
export function calcScenario(input: ScenarioInput): ScenarioResult {
  const balance = new Decimal(input.initialBalance);
  const riskPct = new Decimal(input.riskPerTradePercent).div(100);
  const winRate = new Decimal(input.winRatePercent).div(100);
  const rr = new Decimal(input.rrRatio);
  const n = input.numberOfTrades;

  if (n <= 0 || n > 1000) throw new Error("Jumlah trade harus antara 1-1000");

  // Generate win/loss sequence
  const outcomes: boolean[] = [];
  if (input.randomize) {
    for (let i = 0; i < n; i++) {
      outcomes.push(Math.random() < winRate.toNumber());
    }
  } else {
    // Deterministic: distribute wins evenly across trades
    const winCount = Math.round(winRate.toNumber() * n);
    const lossCount = n - winCount;
    // Interleave: pattern-based for predictability
    let winsLeft = winCount;
    let lossesLeft = lossCount;
    for (let i = 0; i < n; i++) {
      if (lossesLeft === 0) {
        outcomes.push(true);
        winsLeft--;
      } else if (winsLeft === 0) {
        outcomes.push(false);
        lossesLeft--;
      } else {
        // Distribute proportionally
        const ratio = winsLeft / (winsLeft + lossesLeft);
        if ((i % 2 === 0 && ratio >= 0.5) || (i % 2 !== 0 && ratio > 0.5)) {
          outcomes.push(true);
          winsLeft--;
        } else {
          outcomes.push(false);
          lossesLeft--;
        }
      }
    }
  }

  // Simulate equity curve
  let equity = balance;
  let peak = balance;
  let maxDD = new Decimal(0);
  const equityCurve: number[] = [balance.toNumber()];
  let winCount = 0;
  let lossCount = 0;

  for (const isWin of outcomes) {
    const riskAmount = equity.mul(riskPct);
    if (isWin) {
      equity = equity.plus(riskAmount.mul(rr));
      winCount++;
    } else {
      equity = equity.minus(riskAmount);
      lossCount++;
    }

    // Cannot go below zero
    if (equity.lessThanOrEqualTo(0)) {
      equity = new Decimal(0);
      equityCurve.push(0);
      // Fill remaining with 0
      for (let j = equityCurve.length; j <= n; j++) {
        equityCurve.push(0);
      }
      break;
    }

    equityCurve.push(equity.toNumber());

    if (equity.greaterThan(peak)) {
      peak = equity;
    }
    const dd = peak.minus(equity).div(peak).mul(100);
    if (dd.greaterThan(maxDD)) {
      maxDD = dd;
    }
  }

  const finalBalance = equity;
  const totalPnL = finalBalance.minus(balance);
  const totalReturnPercent = totalPnL.div(balance).mul(100);

  // Expectancy per trade
  const avgWin = riskPct.mul(rr);
  const avgLoss = riskPct;
  const expectancyPercent = winRate.mul(avgWin).minus(new Decimal(1).minus(winRate).mul(avgLoss)).mul(100);
  const expectancy = expectancyPercent.div(100).mul(balance);

  return {
    finalBalance: finalBalance.toNumber(),
    totalPnL: totalPnL.toNumber(),
    totalReturnPercent: totalReturnPercent.toNumber(),
    maxDrawdownPercent: maxDD.toNumber(),
    winCount,
    lossCount,
    equityCurve,
    expectancy: expectancy.toNumber(),
    expectancyPercent: expectancyPercent.toNumber(),
  };
}
