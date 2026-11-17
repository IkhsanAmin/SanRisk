"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { InputField } from "@/components/sanrisk/InputField";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/format";
import { calcRiskReward } from "@/lib/calculators/riskReward";

export default function RiskRewardPage() {
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [positionSize, setPositionSize] = useState("");
  const [contractSize, setContractSize] = useState("1");

  const result = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLossPrice);
    const tp = parseFloat(takeProfitPrice);

    if (!entry || !sl || !tp || entry <= 0 || sl <= 0 || tp <= 0 || entry === sl) return null;

    const pos = parseFloat(positionSize) || undefined;
    const cs = parseFloat(contractSize) || 1;

    try {
      return calcRiskReward({ entryPrice: entry, stopLossPrice: sl, takeProfitPrice: tp, direction, positionSize: pos, contractSize: cs });
    } catch { return null; }
  }, [entryPrice, stopLossPrice, takeProfitPrice, direction, positionSize, contractSize]);

  const isFavorable = result && result.rrRatio >= 2;

  return (
    <CalculatorLayout>
      <PageHeader
        title="Risk/Reward Calculator"
        description="Hitung rasio risk-to-reward sebuah trade sebelum membuka posisi."
        icon={<ArrowUpDown className="h-5 w-5" />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4"><CardTitle className="text-sm">Input Perhitungan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Arah Posisi</Label>
              <div className="flex gap-2">
                {(["long", "short"] as const).map((d) => (
                  <button key={d} onClick={() => setDirection(d)} className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${direction === d ? (d === "long" ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400") : "border-border text-muted-foreground hover:bg-muted"}`}>
                    {d === "long" ? "Long" : "Short"}
                  </button>
                ))}
              </div>
            </div>
            <InputField id="entry" label="Harga Entry" value={entryPrice} onChange={setEntryPrice} prefix="$" />
            <InputField id="sl" label="Harga Stop Loss" value={stopLossPrice} onChange={setStopLossPrice} prefix="$" />
            <InputField id="tp" label="Harga Take Profit" value={takeProfitPrice} onChange={setTakeProfitPrice} prefix="$" />
            <InputField id="pos" label="Ukuran Posisi (opsional)" value={positionSize} onChange={setPositionSize} hint="Untuk menghitung potensi profit/loss" />
            <InputField id="cs" label="Contract Size" value={contractSize} onChange={setContractSize} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!result ? (
            <Card><CardContent className="flex h-40 items-center justify-center p-6"><p className="text-sm text-muted-foreground">Masukkan data di sebelah kiri untuk melihat hasil perhitungan.</p></CardContent></Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Risk:Reward Ratio" value={`1:${formatNumber(result.rrRatio)}`} variant={isFavorable ? "success" : "warning"} />
                <ResultCard label="Jarak Risiko" value={formatNumber(result.riskDistance, 5)} sublabel={formatPercent(result.riskPercent)} />
                <ResultCard label="Jarak Reward" value={formatNumber(result.rewardDistance, 5)} sublabel={formatPercent(result.rewardPercent)} />
                {result.potentialLoss !== null && (
                  <ResultCard label="Potensi Kerugian" value={formatCurrency(result.potentialLoss)} variant="warning" />
                )}
                {result.potentialProfit !== null && (
                  <ResultCard label="Potensi Profit" value={formatCurrency(result.potentialProfit)} variant="success" />
                )}
              </div>

              {/* Visual bar */}
              <Card>
                <CardContent className="p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Visualisasi R:R</p>
                  <div className="flex h-6 overflow-hidden rounded-full">
                    <div className="flex items-center justify-center bg-red-500/20 text-xs font-medium text-red-700 dark:text-red-400" style={{ width: `${(1 / (1 + result.rrRatio)) * 100}%` }}>
                      Risk
                    </div>
                    <div className="flex items-center justify-center bg-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400" style={{ width: `${(result.rrRatio / (1 + result.rrRatio)) * 100}%` }}>
                      Reward
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <FormulaAccordion formulas={[
            { title: "Risk", formula: "Risk = |Entry - Stop Loss|" },
            { title: "Reward", formula: "Reward = |Take Profit - Entry|" },
            { title: "R:R Ratio", formula: "R:R = Reward / Risk" },
          ]} />
        </div>
      </div>
    </CalculatorLayout>
  );
}
