"use client";

import { useState, useMemo } from "react";
import { Receipt } from "lucide-react";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { InputField } from "@/components/sanrisk/InputField";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { calcTradingFee } from "@/lib/calculators/tradingFee";

export default function TradingFeePage() {
  const [entryValue, setEntryValue] = useState("");
  const [exitValue, setExitValue] = useState("");
  const [makerFee, setMakerFee] = useState("0.02");
  const [takerFee, setTakerFee] = useState("0.06");
  const [entryFeeType, setEntryFeeType] = useState<"maker" | "taker">("taker");
  const [exitFeeType, setExitFeeType] = useState<"maker" | "taker">("taker");
  const [direction, setDirection] = useState<"long" | "short">("long");

  const result = useMemo(() => {
    const ev = parseFloat(entryValue);
    const xv = parseFloat(exitValue);
    const mk = parseFloat(makerFee);
    const tk = parseFloat(takerFee);

    if (!ev || !xv || ev <= 0 || xv <= 0 || isNaN(mk) || isNaN(tk) || mk < 0 || tk < 0) return null;

    try {
      return calcTradingFee({
        entryValue: ev,
        exitValue: xv,
        makerFeePercent: mk,
        takerFeePercent: tk,
        entryFeeType,
        exitFeeType,
        direction,
      });
    } catch {
      return null;
    }
  }, [entryValue, exitValue, makerFee, takerFee, entryFeeType, exitFeeType, direction]);

  return (
    <CalculatorLayout>
      <PageHeader
        title="Trading Fee Calculator"
        description="Hitung total biaya trading (maker/taker) dan dampaknya terhadap profit/loss."
        icon={<Receipt className="h-5 w-5" />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Input Perhitungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Arah Posisi</Label>
              <div className="flex gap-2">
                {(["long", "short"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDirection(d)}
                    className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                      direction === d
                        ? d === "long"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {d === "long" ? "Long" : "Short"}
                  </button>
                ))}
              </div>
            </div>

            <InputField id="entry-val" label="Nilai Entry (Notional)" value={entryValue} onChange={setEntryValue} prefix="$" placeholder="10000" />
            <InputField id="exit-val" label="Nilai Exit (Notional)" value={exitValue} onChange={setExitValue} prefix="$" placeholder="10500" />

            <div className="grid grid-cols-2 gap-3">
              <InputField id="maker" label="Fee Maker" value={makerFee} onChange={setMakerFee} suffix="%" />
              <InputField id="taker" label="Fee Taker" value={takerFee} onChange={setTakerFee} suffix="%" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tipe Fee Entry</Label>
                <select
                  value={entryFeeType}
                  onChange={(e) => setEntryFeeType(e.target.value as "maker" | "taker")}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="maker">Maker</option>
                  <option value="taker">Taker</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Tipe Fee Exit</Label>
                <select
                  value={exitFeeType}
                  onChange={(e) => setExitFeeType(e.target.value as "maker" | "taker")}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="maker">Maker</option>
                  <option value="taker">Taker</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!result ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">
                  Masukkan data di sebelah kiri untuk melihat hasil perhitungan.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Total Fee" value={formatCurrency(result.totalFee)} variant="highlight" />
                <ResultCard label="Fee Impact" value={formatPercent(result.feeImpactPercent)} sublabel="Terhadap nilai entry" />
                <ResultCard label="Fee Entry" value={formatCurrency(result.entryFee)} sublabel={entryFeeType} />
                <ResultCard label="Fee Exit" value={formatCurrency(result.exitFee)} sublabel={exitFeeType} />
                <ResultCard
                  label="Gross P&L"
                  value={formatCurrency(result.grossPnL)}
                  variant={result.grossPnL >= 0 ? "success" : "warning"}
                />
                <ResultCard
                  label="Net P&L"
                  value={formatCurrency(result.netPnL)}
                  variant={result.netPnL >= 0 ? "success" : "warning"}
                />
                <ResultCard
                  label="Break-Even Price"
                  value={formatCurrency(result.breakEvenPrice, "USD", 5)}
                  sublabel="Harga exit minimum agar tidak rugi"
                />
              </div>
            </>
          )}

          <FormulaAccordion
            formulas={[
              { title: "Entry Fee", formula: "Entry Fee = Entry Value × Fee%" },
              { title: "Exit Fee", formula: "Exit Fee = Exit Value × Fee%" },
              { title: "Total Fee", formula: "Total Fee = Entry Fee + Exit Fee" },
              { title: "Gross P&L (Long)", formula: "Gross = Exit Value - Entry Value" },
              { title: "Net P&L", formula: "Net = Gross P&L - Total Fee" },
              { title: "Break-Even (Long)", formula: "BE = Entry × (1 + Entry Fee%) / (1 - Exit Fee%)" },
            ]}
          />
        </div>
      </div>
    </CalculatorLayout>
  );
}
