import Decimal from "decimal.js";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type FuturesDirection = "long" | "short";
export type FuturesContractType = "linear" | "inverse";
export type FuturesMarginMode = "isolated" | "cross";

export interface CryptoFuturesPositionSizeInput {
  accountBalance: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  leverage: number;
  direction: FuturesDirection;
  maintenanceMarginRate?: number; // default 0.5%
  contractType?: FuturesContractType; // default linear
  contractMultiplier?: number; // default 1 (for inverse contracts)
  takerFeePercent?: number; // default 0.05%
}

export interface CryptoFuturesPositionSizeResult {
  riskAmount: number;
  stopLossDistance: number;
  stopLossPercent: number;
  contractQuantity: number;
  positionSize: number;
  initialMargin: number;
  maintenanceMargin: number;
  estimatedLiquidationPrice: number;
  slOutsideLiquidation: boolean;
  estimatedFee: number;
}

export interface LiquidationPriceInput {
  entryPrice: number;
  direction: FuturesDirection;
  leverage: number;
  maintenanceMarginRate: number;
  marginMode: FuturesMarginMode;
  additionalMargin?: number;
  contractType?: FuturesContractType;
}

export interface LiquidationPriceResult {
  liquidationPrice: number;
  distanceToLiquidation: number;
  distancePercent: number;
  estimatedMarginLevel: number;
}

/**
 * Estimasi harga likuidasi untuk Linear Contract:
 * Long:  Liq = Entry × (1 - 1/Leverage + MMR)
 * Short: Liq = Entry × (1 + 1/Leverage - MMR)
 *
 * Untuk Inverse Contract:
 * Long:  Liq = Entry / (1 + Leverage × (1 - MMR))
 * Short: Liq = Entry / (1 - Leverage × (1 - MMR))
 *
 * Catatan: ini adalah estimasi, bukan harga likuidasi aktual exchange.
 */
export function calcLiquidationPrice(input: LiquidationPriceInput): LiquidationPriceResult {
  const entry = new Decimal(input.entryPrice);
  const lev = new Decimal(input.leverage);
  const mmr = new Decimal(input.maintenanceMarginRate).div(100);
  const contractType = input.contractType ?? "linear";

  let liqPrice: Decimal;

  if (contractType === "linear") {
    if (input.direction === "long") {
      // Liq = Entry × (1 - 1/Lev + MMR)
      liqPrice = entry.mul(new Decimal(1).minus(new Decimal(1).div(lev)).plus(mmr));
    } else {
      // Liq = Entry × (1 + 1/Lev - MMR)
      liqPrice = entry.mul(new Decimal(1).plus(new Decimal(1).div(lev)).minus(mmr));
    }
  } else {
    // Inverse contract
    if (input.direction === "long") {
      liqPrice = entry.div(new Decimal(1).plus(lev.mul(new Decimal(1).minus(mmr))));
    } else {
      liqPrice = entry.div(new Decimal(1).minus(lev.mul(new Decimal(1).minus(mmr))));
    }
  }

  const distance = entry.minus(liqPrice).abs();
  const distancePercent = distance.div(entry).mul(100);
  const estimatedMarginLevel = new Decimal(100).div(lev);

  return {
    liquidationPrice: liqPrice.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    distanceToLiquidation: distance.toNumber(),
    distancePercent: distancePercent.toNumber(),
    estimatedMarginLevel: estimatedMarginLevel.toNumber(),
  };
}

/**
 * Hitung ukuran posisi Crypto Futures
 * Risk Amount = Balance × Risk%
 * SL Distance = |Entry - SL|
 * Contracts = Risk Amount / SL Distance (linear)
 * Initial Margin = Contracts × Entry / Leverage
 */
export function calcCryptoFuturesPositionSize(
  input: CryptoFuturesPositionSizeInput
): CryptoFuturesPositionSizeResult {
  const balance = new Decimal(input.accountBalance);
  const riskPct = new Decimal(input.riskPercent).div(100);
  const entry = new Decimal(input.entryPrice);
  const sl = new Decimal(input.stopLossPrice);
  const lev = new Decimal(input.leverage);
  const mmr = new Decimal(input.maintenanceMarginRate ?? 0.5);
  const feePct = new Decimal(input.takerFeePercent ?? 0.05).div(100);
  const contractType = input.contractType ?? "linear";

  const riskAmount = balance.mul(riskPct);
  const slDistance = entry.minus(sl).abs();
  const slPercent = slDistance.div(entry).mul(100);

  let contractQuantity: Decimal;
  let positionSize: Decimal;

  if (contractType === "linear") {
    // Quantity (coins) = Risk Amount / SL Distance
    contractQuantity = riskAmount.div(slDistance);
    positionSize = contractQuantity.mul(entry);
  } else {
    // Inverse: Risk Amount (in base) = Risk Amount / Entry
    // Quantity (contracts) = Risk Amount (in base) × Entry² / (SL Distance)
    const riskAmountBase = riskAmount.div(entry);
    contractQuantity = riskAmountBase.mul(entry).div(slDistance);
    positionSize = contractQuantity;
  }

  const initialMargin = positionSize.div(lev);
  const maintenanceMargin = positionSize.mul(mmr).div(100);
  const estimatedFee = positionSize.mul(feePct);

  // Hitung liquidation price
  const liqResult = calcLiquidationPrice({
    entryPrice: input.entryPrice,
    direction: input.direction,
    leverage: input.leverage,
    maintenanceMarginRate: input.maintenanceMarginRate ?? 0.5,
    marginMode: "isolated",
    contractType,
  });

  // Cek apakah SL berada di luar harga likuidasi
  let slOutsideLiquidation = false;
  const liqPrice = new Decimal(liqResult.liquidationPrice);
  if (input.direction === "long") {
    // Untuk Long: SL harus lebih tinggi dari liq price
    if (sl.lessThan(liqPrice) || sl.equals(liqPrice)) {
      slOutsideLiquidation = true;
    }
  } else {
    // Untuk Short: SL harus lebih rendah dari liq price
    if (sl.greaterThan(liqPrice) || sl.equals(liqPrice)) {
      slOutsideLiquidation = true;
    }
  }

  return {
    riskAmount: riskAmount.toNumber(),
    stopLossDistance: slDistance.toNumber(),
    stopLossPercent: slPercent.toNumber(),
    contractQuantity: contractQuantity.toDecimalPlaces(4, Decimal.ROUND_DOWN).toNumber(),
    positionSize: positionSize.toNumber(),
    initialMargin: initialMargin.toNumber(),
    maintenanceMargin: maintenanceMargin.toNumber(),
    estimatedLiquidationPrice: liqResult.liquidationPrice,
    slOutsideLiquidation,
    estimatedFee: estimatedFee.toNumber(),
  };
}
