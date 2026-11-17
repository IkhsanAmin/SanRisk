"use client";

import { useState, useMemo } from "react";
import { Target } from "lucide-react";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { InputField } from "@/components/sanrisk/InputField";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/format";
import { calcStopLoss, calcTakeProfit } from "@/lib/calculators/stopLossTakeProfit";

export default function StopLossTakeProfitPage() {
  const [balance, setBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [entryPrice, setEntryPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [contractSize, setContractSize] = useState("1");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [rrRatio, setRrRatio] = useState("2");

  const slResult = useMemo(() => {
    const bal = parseFloat(balance);
    const risk = parseFloat(riskPercent);
    const entry = parseFloat(entryPrice);
    const pos = parseFloat(positionSize);
    const cs = parseFloat(contractSize) || 1;

    if (!bal || !risk || !entry || !pos || bal <= 0 || risk <= 0 || entry <= 0 || pos <= 0) return null;
    try {
      return calcStopLoss({ accountBalance: bal, riskPercent: risk, entryPrice: entry, positionSize: pos, contractSize: cs, direction });
    } catch { return null; }
  }, [balance, riskPercent, entryPrice, positionSize, contractSize, direction]);

  const tpResult = useMemo(() => {
    if (!slResult) return null;
    const entry = parseFloat(entryPrice);
    const rr = parseFloat(rrRatio);
    const pos = parseFloat(positionSize);
    const cs = parseFloat(contractSize) || 1;

    if (!entry || !rr || rr <= 0) return null;
    try {
      return calcTakeProfit({ entryPrice: entry, stopLossPrice: slResult.stopLossPrice, rrRatio: rr, direction, positionSize: pos, contractSize: cs });
    } catch { return null; }
  }, [slResult, entryPrice, rrRatio, positionSize, contractSize, direction]);

  return (
    <CalculatorLayout>
      <PageHeader
        title="Stop Loss & Take Profit Calculator"
        description="Tentukan level stop loss berdasarkan risiko, dan harga take profit berdasarkan R:R ratio."
        icon={<Target className="h-5 w-5" />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Input Perhitungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField id="balance" label="Saldo Akun" value={balance} onChange={setBalance} prefix="$" />
            <InputField id="risk" label="Risiko per Trade" value={riskPercent} onChange={setRiskPercent} suffix="%" />
            <InputField id="entry" label="Harga Entry" value={entryPrice} onChange={setEntryPrice} prefix="$" />
            <InputField id="pos-size" label="Ukuran Posisi" value={positionSize} onChange={setPositionSize} />
            <InputField id="cs" label="Contract Size" value={contractSize} onChange={setContractSize} />

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

            <InputField id="rr" label="Risk:Reward Ratio" value={rrRatio} onChange={setRrRatio} hint="Contoh: 2 artinya R:R = 1:2" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!slResult && (
            <Card><CardContent className="flex h-40 items-center justify-center p-6"><p className="text-sm text-muted-foreground">Masukkan data di sebelah kiri untuk melihat hasil perhitungan.</p></CardContent></Card>
          )}

          {slResult && (
            <>
              <h3 className="text-sm font-medium text-muted-foreground">Stop Loss</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Harga Stop Loss" value={formatCurrency(slResult.stopLossPrice, "USD", 5)} variant="warning" />
                <ResultCard label="Jarak SL" value={formatNumber(slResult.stopLossDistance, 5)} sublabel={formatPercent(slResult.stopLossPercent)} />
                <ResultCard label="Potensi Kerugian" value={formatCurrency(slResult.maxPotentialLoss)} />
                <ResultCard label="Risk %" value={formatPercent(slResult.riskPercent)} />
              </div>
            </>
          )}

          {tpResult && (
            <>
              <h3 className="mt-2 text-sm font-medium text-muted-foreground">Take Profit</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Harga Take Profit" value={formatCurrency(tpResult.takeProfitPrice, "USD", 5)} variant="success" />
                <ResultCard label="R:R Ratio" value={`1:${formatNumber(tpResult.rrRatio)}`} />
                <ResultCard label="Jarak Reward" value={formatNumber(tpResult.rewardDistance, 5)} />
                {tpResult.potentialProfit !== null && (
                  <ResultCard label="Potensi Profit" value={formatCurrency(tpResult.potentialProfit)} variant="success" />
                )}
              </div>
            </>
          )}

          <FormulaAccordion formulas={[
            { title: "Stop Loss", formula: "SL Distance = Risk Amount / (Position Size × Contract Size)" },
            { title: "Long SL", formula: "SL Price = Entry - SL Distance" },
            { title: "Short SL", formula: "SL Price = Entry + SL Distance" },
            { title: "Take Profit", formula: "TP Distance = SL Distance × R:R Ratio" },
          ]} />
        </div>
      </div>
    </CalculatorLayout>
  );
}
