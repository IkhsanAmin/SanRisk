import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/** Spesifikasi default Commodity */
export const COMMODITY_SPECS: Record<
  string,
  { contractSize: number; tickSize: number; tickValue: number; currency: string }
> = {
  "XAU/USD": { contractSize: 100, tickSize: 0.01, tickValue: 1.0, currency: "USD" },
  "XAG/USD": { contractSize: 5000, tickSize: 0.001, tickValue: 5.0, currency: "USD" },
  "WTI":     { contractSize: 1000, tickSize: 0.01, tickValue: 10.0, currency: "USD" },
  "BRENT":   { contractSize: 1000, tickSize: 0.01, tickValue: 10.0, currency: "USD" },
};

export interface CommodityPositionSizeInput {
  accountBalance: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  contractSize: number;
  tickSize: number;
  tickValue: number;
  leverage?: number;
}

export interface CommodityPositionSizeResult {
  riskAmount: number;
  stopLossDistance: number;
  stopLossTicks: number;
  valuePerTick: number;
  lotSize: number;
  positionValue: number;
  requiredMargin: number | null;
}

/**
 * Hitung ukuran posisi Commodity
 * Rumus: Lots = Risk Amount / (SL Ticks × Tick Value)
 * Dibulatkan ke bawah ke 0.01 lot
 */
export function calcCommodityPositionSize(
  input: CommodityPositionSizeInput
): CommodityPositionSizeResult {
  const balance = new Decimal(input.accountBalance);
  const riskPct = new Decimal(input.riskPercent).div(100);
  const entry = new Decimal(input.entryPrice);
  const sl = new Decimal(input.stopLossPrice);
  const tickSize = new Decimal(input.tickSize);
  const tickValue = new Decimal(input.tickValue);
  const contractSize = new Decimal(input.contractSize);

  const riskAmount = balance.mul(riskPct);
  const slDistance = entry.minus(sl).abs();
  const slTicks = slDistance.div(tickSize);
  const riskPerLot = slTicks.mul(tickValue);
  const rawLots = riskAmount.div(riskPerLot);
  const lotSize = rawLots.toDecimalPlaces(2, Decimal.ROUND_DOWN);

  const positionValue = lotSize.mul(contractSize).mul(entry);
  const requiredMargin =
    input.leverage && input.leverage > 1
      ? positionValue.div(input.leverage)
      : null;

  return {
    riskAmount: riskAmount.toNumber(),
    stopLossDistance: slDistance.toNumber(),
    stopLossTicks: slTicks.toNumber(),
    valuePerTick: tickValue.toNumber(),
    lotSize: lotSize.toNumber(),
    positionValue: positionValue.toNumber(),
    requiredMargin: requiredMargin?.toNumber() ?? null,
  };
}

export function calcCommodityMargin(
  lotSize: number,
  entryPrice: number,
  contractSize: number,
  leverage: number
): number {
  const val = new Decimal(lotSize)
    .mul(entryPrice)
    .mul(contractSize)
    .div(leverage);
  return val.toNumber();
}
