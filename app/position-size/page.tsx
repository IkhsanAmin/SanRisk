"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import { useMarketStore } from "@/store/marketStore";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { MarketSelector } from "@/components/sanrisk/MarketSelector";
import { InputField } from "@/components/sanrisk/InputField";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { WarningAlert } from "@/components/sanrisk/WarningAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatNumber, formatPercent, formatLots } from "@/lib/utils/format";
import { calcForexPositionSize, FOREX_PAIRS } from "@/lib/calculators/forex";
import { calcCommodityPositionSize, COMMODITY_SPECS } from "@/lib/calculators/commodity";
import { calcCryptoSpotPositionSize } from "@/lib/calculators/cryptoSpot";
import { calcCryptoFuturesPositionSize } from "@/lib/calculators/cryptoFutures";

export default function PositionSizePage() {
  const { market } = useMarketStore();

  // Shared inputs
  const [balance, setBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");

  // Forex-specific
  const [pair, setPair] = useState("EUR/USD");

  // Commodity-specific
  const [commodity, setCommodity] = useState("XAU/USD");

  // Crypto Spot-specific
  const [takerFee, setTakerFee] = useState("0.1");

  // Crypto Futures-specific
  const [leverage, setLeverage] = useState("10");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [mmr, setMmr] = useState("0.5");

  const result = useMemo(() => {
    const bal = parseFloat(balance);
    const risk = parseFloat(riskPercent);
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLossPrice);

    if (!bal || !risk || !entry || !sl || bal <= 0 || risk <= 0 || entry <= 0 || sl <= 0 || entry === sl) {
      return null;
    }

    try {
      switch (market) {
        case "forex":
          return { type: "forex" as const, data: calcForexPositionSize({ accountBalance: bal, riskPercent: risk, entryPrice: entry, stopLossPrice: sl, pair }) };
        case "commodity": {
          const spec = COMMODITY_SPECS[commodity];
          if (!spec) return null;
          return { type: "commodity" as const, data: calcCommodityPositionSize({ accountBalance: bal, riskPercent: risk, entryPrice: entry, stopLossPrice: sl, contractSize: spec.contractSize, tickSize: spec.tickSize, tickValue: spec.tickValue }) };
        }
        case "crypto-spot":
          return { type: "crypto-spot" as const, data: calcCryptoSpotPositionSize({ accountBalance: bal, riskPercent: risk, entryPrice: entry, stopLossPrice: sl, takerFeePercent: parseFloat(takerFee) || 0.1 }) };
        case "crypto-futures": {
          const lev = parseFloat(leverage) || 10;
          return { type: "crypto-futures" as const, data: calcCryptoFuturesPositionSize({ accountBalance: bal, riskPercent: risk, entryPrice: entry, stopLossPrice: sl, leverage: lev, direction, maintenanceMarginRate: parseFloat(mmr) || 0.5 }) };
        }
      }
    } catch {
      return null;
    }
  }, [balance, riskPercent, entryPrice, stopLossPrice, market, pair, commodity, takerFee, leverage, direction, mmr]);

  return (
    <CalculatorLayout>
      <PageHeader
        title="Position Size Calculator"
        description="Hitung ukuran posisi optimal berdasarkan toleransi risiko Anda."
        icon={<Calculator className="h-5 w-5" />}
      />

      <MarketSelector />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Input Perhitungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField id="balance" label="Saldo Akun" value={balance} onChange={setBalance} prefix="$" placeholder="10000" />
            <InputField id="risk" label="Risiko per Trade" value={riskPercent} onChange={setRiskPercent} suffix="%" placeholder="1" />
            <InputField id="entry" label="Harga Entry" value={entryPrice} onChange={setEntryPrice} prefix="$" placeholder="1.1050" />
            <InputField id="sl" label="Harga Stop Loss" value={stopLossPrice} onChange={setStopLossPrice} prefix="$" placeholder="1.1000" />

            {/* Market-specific inputs */}
            {market === "forex" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Pasangan Mata Uang</Label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {Object.keys(FOREX_PAIRS).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {market === "commodity" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Komoditas</Label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {Object.keys(COMMODITY_SPECS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {market === "crypto-spot" && (
              <InputField id="taker-fee" label="Taker Fee" value={takerFee} onChange={setTakerFee} suffix="%" placeholder="0.1" />
            )}

            {market === "crypto-futures" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Arah Posisi</Label>
                  <div className="flex gap-2">
                    {(["long", "short"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDirection(d)}
                        className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${direction === d ? (d === "long" ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400") : "border-border text-muted-foreground hover:bg-muted"}`}
                      >
                        {d === "long" ? "Long" : "Short"}
                      </button>
                    ))}
                  </div>
                </div>
                <InputField id="leverage" label="Leverage" value={leverage} onChange={setLeverage} suffix="x" placeholder="10" />
                <InputField id="mmr" label="Maintenance Margin Rate" value={mmr} onChange={setMmr} suffix="%" placeholder="0.5" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-4">
          {!result && (
            <Card>
              <CardContent className="flex h-40 items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">
                  Masukkan data di sebelah kiri untuk melihat hasil perhitungan.
                </p>
              </CardContent>
            </Card>
          )}

          {result?.type === "forex" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Ukuran Posisi" value={formatLots(result.data.lotSize)} variant="highlight" />
                <ResultCard label="Risiko" value={formatCurrency(result.data.riskAmount)} />
                <ResultCard label="Jarak SL" value={`${formatNumber(result.data.stopLossPips)} pips`} />
                <ResultCard label="Pip Value / Lot" value={formatCurrency(result.data.pipValue)} />
                <ResultCard label="Nilai Posisi" value={formatCurrency(result.data.positionValue)} />
                {result.data.requiredMargin !== null && (
                  <ResultCard label="Margin Dibutuhkan" value={formatCurrency(result.data.requiredMargin)} />
                )}
              </div>
            </>
          )}

          {result?.type === "commodity" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="Ukuran Posisi" value={formatLots(result.data.lotSize)} variant="highlight" />
              <ResultCard label="Risiko" value={formatCurrency(result.data.riskAmount)} />
              <ResultCard label="Jarak SL" value={formatNumber(result.data.stopLossDistance, 4)} />
              <ResultCard label="Jarak SL (Ticks)" value={formatNumber(result.data.stopLossTicks)} />
              <ResultCard label="Nilai per Tick" value={formatCurrency(result.data.valuePerTick)} />
              <ResultCard label="Nilai Posisi" value={formatCurrency(result.data.positionValue)} />
            </div>
          )}

          {result?.type === "crypto-spot" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="Jumlah Koin" value={formatNumber(result.data.coinQuantity, 8)} variant="highlight" />
              <ResultCard label="Risiko" value={formatCurrency(result.data.riskAmount)} />
              <ResultCard label="Jarak SL" value={`${formatPercent(result.data.stopLossPercent)}`} sublabel={formatCurrency(result.data.stopLossDistance)} />
              <ResultCard label="Nilai Posisi" value={formatCurrency(result.data.positionValue)} />
              <ResultCard label="Estimasi Fee" value={formatCurrency(result.data.estimatedFee)} />
              <ResultCard label="Nilai Posisi + Fee" value={formatCurrency(result.data.netPositionValue)} />
            </div>
          )}

          {result?.type === "crypto-futures" && (
            <>
              {result.data.slOutsideLiquidation && (
                <WarningAlert
                  title="Stop Loss Melampaui Likuidasi!"
                  message={`Harga stop loss berada di luar harga likuidasi (${formatCurrency(result.data.estimatedLiquidationPrice)}). Posisi Anda berpotensi terlikuidasi sebelum stop loss tercapai.`}
                />
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Quantity Kontrak" value={formatNumber(result.data.contractQuantity, 4)} variant="highlight" />
                <ResultCard label="Risiko" value={formatCurrency(result.data.riskAmount)} />
                <ResultCard label="Nilai Posisi" value={formatCurrency(result.data.positionSize)} />
                <ResultCard label="Initial Margin" value={formatCurrency(result.data.initialMargin)} />
                <ResultCard label="Maintenance Margin" value={formatCurrency(result.data.maintenanceMargin)} />
                <ResultCard label="Harga Likuidasi" value={formatCurrency(result.data.estimatedLiquidationPrice)} variant={result.data.slOutsideLiquidation ? "warning" : "default"} />
                <ResultCard label="Jarak SL" value={formatPercent(result.data.stopLossPercent)} />
                <ResultCard label="Estimasi Fee" value={formatCurrency(result.data.estimatedFee)} />
              </div>
            </>
          )}

          {/* Formula Accordion */}
          <FormulaAccordion
            formulas={[
              { title: "Forex", formula: "Lot Size = Risk Amount / (SL Pips × Pip Value per Lot)", description: "Dibulatkan ke bawah ke 0.01 lot (micro lot)." },
              { title: "Komoditas", formula: "Lots = Risk Amount / (SL Ticks × Tick Value)" },
              { title: "Crypto Spot", formula: "Quantity = Risk Amount / (SL Distance + Entry × Fee%)" },
              { title: "Crypto Futures", formula: "Quantity = Risk Amount / SL Distance" },
            ]}
          />
        </div>
      </div>
    </CalculatorLayout>
  );
}
