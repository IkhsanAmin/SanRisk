"use client";

import { useState, useMemo } from "react";
import { BarChart2 } from "lucide-react";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { calcMaxDrawdown } from "@/lib/calculators/drawdown";

export default function DrawdownPage() {
  const [equityInput, setEquityInput] = useState("10000\n10500\n9800\n10200\n9500\n9000\n9700");

  const result = useMemo(() => {
    const nums = equityInput
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(Number);

    if (nums.length < 2 || nums.some((n) => isNaN(n) || n <= 0)) return null;

    try {
      return calcMaxDrawdown(nums);
    } catch { return null; }
  }, [equityInput]);

  return (
    <CalculatorLayout>
      <PageHeader
        title="Max Drawdown Calculator"
        description="Analisis drawdown maksimum dari deret ekuitas trading Anda."
        icon={<BarChart2 className="h-5 w-5" />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4"><CardTitle className="text-sm">Input Deret Ekuitas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nilai Ekuitas</Label>
              <textarea
                value={equityInput}
                onChange={(e) => setEquityInput(e.target.value)}
                placeholder="Masukkan nilai ekuitas, satu per baris..."
                rows={10}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground">Pisahkan dengan baris baru, koma, atau titik koma. Minimal 2 nilai.</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!result ? (
            <Card><CardContent className="flex h-40 items-center justify-center p-6"><p className="text-sm text-muted-foreground">Masukkan minimal 2 nilai ekuitas untuk analisis.</p></CardContent></Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Max Drawdown" value={formatPercent(result.drawdownPercent)} variant="warning" />
                <ResultCard label="Jumlah Drawdown" value={formatCurrency(result.drawdownAmount)} variant="warning" />
                <ResultCard label="Puncak Ekuitas" value={formatCurrency(result.peakEquity)} sublabel={`Indeks: ${result.peakIndex + 1}`} />
                <ResultCard label="Lembah Ekuitas" value={formatCurrency(result.troughEquity)} sublabel={`Indeks: ${result.troughIndex + 1}`} />
                <ResultCard label="Recovery Diperlukan" value={formatPercent(result.recoveryRequired)} sublabel="Untuk kembali ke puncak" />
              </div>
            </>
          )}

          <FormulaAccordion formulas={[
            { title: "Max Drawdown", formula: "MDD = Max(Peak - Current) untuk seluruh periode" },
            { title: "Drawdown %", formula: "DD% = (Peak - Trough) / Peak × 100" },
            { title: "Recovery %", formula: "Recovery% = Drawdown / Trough × 100" },
          ]} />
        </div>
      </div>
    </CalculatorLayout>
  );
}
