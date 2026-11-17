"use client";

import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { InputField } from "@/components/sanrisk/InputField";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { WarningAlert } from "@/components/sanrisk/WarningAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { calcFundingFee } from "@/lib/calculators/fundingFee";

export default function FundingFeePage() {
  const [positionValue, setPositionValue] = useState("");
  const [fundingRate, setFundingRate] = useState("0.01");
  const [periods, setPeriods] = useState("3");
  const [direction, setDirection] = useState<"long" | "short">("long");

  const result = useMemo(() => {
    const pv = parseFloat(positionValue);
    const rate = parseFloat(fundingRate);
    const n = parseInt(periods, 10);

    if (!pv || pv <= 0 || isNaN(rate) || !n || n <= 0) return null;

    try {
      return calcFundingFee({
        positionValue: pv,
        fundingRatePercent: rate,
        numberOfPeriods: n,
        direction,
      });
    } catch {
      return null;
    }
  }, [positionValue, fundingRate, periods, direction]);

  const periodsNum = parseInt(periods, 10) || 0;
  const daysHeld = periodsNum > 0 ? Math.ceil(periodsNum / 3) : 0;

  return (
    <CalculatorLayout>
      <PageHeader
        title="Funding Fee Calculator"
        description="Hitung estimasi biaya funding fee untuk posisi crypto futures."
        icon={<Clock className="h-5 w-5" />}
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

            <InputField
              id="pv"
              label="Nilai Posisi (Notional)"
              value={positionValue}
              onChange={setPositionValue}
              prefix="$"
              placeholder="50000"
            />
            <InputField
              id="rate"
              label="Funding Rate"
              value={fundingRate}
              onChange={setFundingRate}
              suffix="%"
              hint="Rate per 8 jam. Positif: Long bayar, Short terima. Negatif: sebaliknya."
            />
            <InputField
              id="periods"
              label="Jumlah Periode"
              value={periods}
              onChange={setPeriods}
              hint={`${periodsNum} periode = ±${daysHeld} hari (3 periode/hari)`}
            />
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
              {result.isPaying && result.totalFeePercent > 1 && (
                <WarningAlert
                  title="Funding Fee Tinggi!"
                  message={`Total funding fee ${formatPercent(result.totalFeePercent)} dari nilai posisi. Pertimbangkan durasi hold.`}
                />
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard
                  label="Fee per Periode"
                  value={formatCurrency(result.feePerPeriod)}
                  variant="highlight"
                />
                <ResultCard
                  label="Total Fee"
                  value={formatCurrency(result.totalFee)}
                  sublabel={formatPercent(result.totalFeePercent)}
                  variant={result.isPaying ? "warning" : "success"}
                />
                <ResultCard
                  label="Biaya Harian"
                  value={formatCurrency(result.dailyCost)}
                  sublabel="Estimasi 3 periode/hari"
                />
                <ResultCard
                  label="Status"
                  value={result.isPaying ? "Membayar" : "Menerima"}
                  variant={result.isPaying ? "warning" : "success"}
                  sublabel={
                    result.isPaying
                      ? "Anda membayar funding fee"
                      : "Anda menerima funding fee"
                  }
                />
              </div>
            </>
          )}

          <FormulaAccordion
            formulas={[
              { title: "Fee per Periode", formula: "Fee = Position Value × |Funding Rate%|" },
              { title: "Total Fee", formula: "Total = Fee per Period × Jumlah Periode" },
              { title: "Biaya Harian", formula: "Daily = Fee per Period × 3" },
              { title: "Siapa yang Bayar", formula: "Rate > 0 → Long bayar, Short terima\nRate < 0 → Short bayar, Long terima" },
            ]}
          />
        </div>
      </div>
    </CalculatorLayout>
  );
}
