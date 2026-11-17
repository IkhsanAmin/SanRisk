"use client";

import { useState, useMemo } from "react";
import { Zap } from "lucide-react";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { InputField } from "@/components/sanrisk/InputField";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { WarningAlert } from "@/components/sanrisk/WarningAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/format";
import { calcLeverageMargin } from "@/lib/calculators/leverageMargin";

export default function LeverageMarginPage() {
  const [positionValue, setPositionValue] = useState("");
  const [leverage, setLeverage] = useState("10");
  const [balance, setBalance] = useState("10000");
  const [market, setMarket] = useState<"forex" | "commodity" | "crypto-futures">("forex");

  const result = useMemo(() => {
    const pv = parseFloat(positionValue);
    const lev = parseFloat(leverage);
    const bal = parseFloat(balance);

    if (!pv || !lev || !bal || pv <= 0 || lev <= 0 || bal <= 0) return null;

    try {
      return calcLeverageMargin({ positionValue: pv, leverage: lev, accountBalance: bal, market });
    } catch { return null; }
  }, [positionValue, leverage, balance, market]);

  const isOverMargin = result && result.usedMarginPercent > 80;

  return (
    <CalculatorLayout>
      <PageHeader
        title="Leverage & Margin Calculator"
        description="Hitung margin yang dibutuhkan dan margin level berdasarkan leverage."
        icon={<Zap className="h-5 w-5" />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4"><CardTitle className="text-sm">Input Perhitungan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Pasar</Label>
              <select value={market} onChange={(e) => setMarket(e.target.value as typeof market)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="forex">Forex</option>
                <option value="commodity">Komoditas</option>
                <option value="crypto-futures">Crypto Futures</option>
              </select>
            </div>
            <InputField id="balance" label="Saldo Akun" value={balance} onChange={setBalance} prefix="$" />
            <InputField id="pv" label="Nilai Posisi" value={positionValue} onChange={setPositionValue} prefix="$" placeholder="100000" />
            <InputField id="lev" label="Leverage" value={leverage} onChange={setLeverage} suffix="x" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!result ? (
            <Card><CardContent className="flex h-40 items-center justify-center p-6"><p className="text-sm text-muted-foreground">Masukkan data di sebelah kiri untuk melihat hasil perhitungan.</p></CardContent></Card>
          ) : (
            <>
              {isOverMargin && (
                <WarningAlert title="Margin Tinggi!" message={`Margin yang digunakan ${formatPercent(result.usedMarginPercent)} dari saldo. Risiko margin call meningkat.`} />
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Margin Dibutuhkan" value={formatCurrency(result.requiredMargin)} variant="highlight" />
                <ResultCard label="Margin Level" value={formatPercent(result.marginLevel)} variant={result.marginLevel < 150 ? "warning" : "success"} />
                <ResultCard label="Free Margin" value={formatCurrency(result.freeMargin)} variant={result.freeMargin < 0 ? "warning" : "default"} />
                <ResultCard label="Margin Terpakai" value={formatPercent(result.usedMarginPercent)} />
                <ResultCard label="Effective Leverage" value={`${formatNumber(result.effectiveLeverage, 1)}x`} />
              </div>
            </>
          )}

          <FormulaAccordion formulas={[
            { title: "Required Margin", formula: "Margin = Position Value / Leverage" },
            { title: "Margin Level", formula: "Margin Level = (Balance / Margin) × 100" },
            { title: "Free Margin", formula: "Free Margin = Balance - Required Margin" },
          ]} />
        </div>
      </div>
    </CalculatorLayout>
  );
}
