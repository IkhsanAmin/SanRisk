import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/** Spesifikasi default pasangan Forex yang umum */
export const FOREX_PAIRS: Record<
  string,
  { pipDecimalPlaces: number; contractSize: number; quoteCurrency: string; baseCurrency: string }
> = {
  "EUR/USD": { pipDecimalPlaces: 4, contractSize: 100000, quoteCurrency: "USD", baseCurrency: "EUR" },
  "GBP/USD": { pipDecimalPlaces: 4, contractSize: 100000, quoteCurrency: "USD", baseCurrency: "GBP" },
  "USD/JPY": { pipDecimalPlaces: 2, contractSize: 100000, quoteCurrency: "JPY", baseCurrency: "USD" },
  "AUD/USD": { pipDecimalPlaces: 4, contractSize: 100000, quoteCurrency: "USD", baseCurrency: "AUD" },
  "USD/CAD": { pipDecimalPlaces: 4, contractSize: 100000, quoteCurrency: "CAD", baseCurrency: "USD" },
  "USD/CHF": { pipDecimalPlaces: 4, contractSize: 100000, quoteCurrency: "CHF", baseCurrency: "USD" },
  "NZD/USD": { pipDecimalPlaces: 4, contractSize: 100000, quoteCurrency: "USD", baseCurrency: "NZD" },
};

export interface ForexPositionSizeInput {
  accountBalance: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  pair: string;
  pipDecimalPlaces?: number;
  contractSize?: number;
  accountCurrency?: string;
  leverage?: number;
}

export interface ForexPositionSizeResult {
  riskAmount: number;
  stopLossPips: number;
  pipValue: number;
  lotSize: number;
  positionValue: number;
  requiredMargin: number | null;
}

/** Hitung ukuran pip berdasarkan jumlah desimal pip */
export function getPipSize(pipDecimalPlaces: number): Decimal {
  return new Decimal(10).pow(-pipDecimalPlaces);
}

/** Hitung pip value per lot dalam quote currency */
export function calcPipValuePerLot(contractSize: number, pipDecimalPlaces: number): Decimal {
  const pipSize = getPipSize(pipDecimalPlaces);
  return pipSize.mul(contractSize);
}

/** Hitung margin yang dibutuhkan */
export function calcForexMargin(
  lotSize: number,
  entryPrice: number,
  contractSize: number,
  leverage: number
): Decimal {
  const lots = new Decimal(lotSize);
  const price = new Decimal(entryPrice);
  const cs = new Decimal(contractSize);
  const lev = new Decimal(leverage);
  return lots.mul(price).mul(cs).div(lev);
}

/**
 * Hitung ukuran posisi Forex
 * Rumus: Lot Size = Risk Amount / (SL Pips × Pip Value per Lot)
 * Dibulatkan ke bawah ke 0.01 lot (micro lot)
 */
export function calcForexPositionSize(input: ForexPositionSizeInput): ForexPositionSizeResult {
  const pairSpec = FOREX_PAIRS[input.pair];
  const pipDecimalPlaces = input.pipDecimalPlaces ?? pairSpec?.pipDecimalPlaces ?? 4;
  const contractSize = input.contractSize ?? pairSpec?.contractSize ?? 100000;
  const leverage = input.leverage ?? 1;

  const balance = new Decimal(input.accountBalance);
  const riskPct = new Decimal(input.riskPercent).div(100);
  const entry = new Decimal(input.entryPrice);
  const sl = new Decimal(input.stopLossPrice);
  const pipSize = getPipSize(pipDecimalPlaces);

  const riskAmount = balance.mul(riskPct);
  const priceDiff = entry.minus(sl).abs();
  const slPips = priceDiff.div(pipSize);
  const pipValuePerLot = calcPipValuePerLot(contractSize, pipDecimalPlaces);

  // Jika pair tidak berbasis USD (quote bukan USD), perlu konversi
  // Untuk MVP, asumsikan quote currency = account currency (USD)
  const riskPerPip = pipValuePerLot;
  const rawLots = riskAmount.div(slPips.mul(riskPerPip));

  // Bulatkan ke bawah ke 0.01 lot
  const lotSize = rawLots.toDecimalPlaces(2, Decimal.ROUND_DOWN);
  const positionValue = lotSize.mul(contractSize).mul(entry);
  const requiredMargin = leverage > 1
    ? calcForexMargin(lotSize.toNumber(), input.entryPrice, contractSize, leverage)
    : null;

  return {
    riskAmount: riskAmount.toNumber(),
    stopLossPips: slPips.toNumber(),
    pipValue: pipValuePerLot.toNumber(),
    lotSize: lotSize.toNumber(),
    positionValue: positionValue.toNumber(),
    requiredMargin: requiredMargin?.toNumber() ?? null,
  };
}
