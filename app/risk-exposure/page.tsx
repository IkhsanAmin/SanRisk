"use client";

import { useState, useMemo, useCallback } from "react";
import { Layers, Plus, Trash2 } from "lucide-react";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { InputField } from "@/components/sanrisk/InputField";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { WarningAlert } from "@/components/sanrisk/WarningAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { calcRiskExposure, type Position } from "@/lib/calculators/riskExposure";

interface PositionForm {
  id: string;
  name: string;
  direction: "long" | "short";
  riskAmount: string;
}

let nextId = 1;

export default function RiskExposurePage() {
  const [balance, setBalance] = useState("10000");
  const [maxRisk, setMaxRisk] = useState("6");
  const [positions, setPositions] = useState<PositionForm[]>([
    { id: `pos-${nextId++}`, name: "Posisi 1", direction: "long", riskAmount: "100" },
  ]);

  const addPosition = useCallback(() => {
    setPositions((prev) => [...prev, { id: `pos-${nextId++}`, name: `Posisi ${prev.length + 1}`, direction: "long", riskAmount: "" }]);
  }, []);

  const removePosition = useCallback((id: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePosition = useCallback((id: string, field: keyof PositionForm, value: string) => {
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const result = useMemo(() => {
    const bal = parseFloat(balance);
    const max = parseFloat(maxRisk) || 100;
    if (!bal || bal <= 0) return null;

    const validPositions: Position[] = positions
      .filter((p) => p.name && parseFloat(p.riskAmount) > 0)
      .map((p) => ({ id: p.id, name: p.name, direction: p.direction, riskAmount: parseFloat(p.riskAmount) }));

    if (validPositions.length === 0) return null;

    try {
      return calcRiskExposure(validPositions, bal, max);
    } catch { return null; }
  }, [balance, maxRisk, positions]);

  const isOverLimit = result && result.remainingRiskPercent < 0;

  return (
    <CalculatorLayout>
      <PageHeader
        title="Risk Exposure Calculator"
        description="Pantau total eksposur risiko dari semua posisi terbuka."
        icon={<Layers className="h-5 w-5" />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4"><CardTitle className="text-sm">Pengaturan Akun</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <InputField id="balance" label="Saldo Akun" value={balance} onChange={setBalance} prefix="$" />
              <InputField id="max-risk" label="Batas Risiko Maksimum" value={maxRisk} onChange={setMaxRisk} suffix="%" hint="Umumnya 5-6% dari total modal" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-sm">Daftar Posisi</CardTitle>
              <Button variant="outline" size="sm" onClick={addPosition} className="h-7 text-xs">
                <Plus className="mr-1 h-3 w-3" /> Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {positions.map((pos) => (
                <div key={pos.id} className="flex items-end gap-2 rounded-lg border border-border p-3">
                  <div className="flex-1 space-y-2">
                    <input
                      value={pos.name}
                      onChange={(e) => updatePosition(pos.id, "name", e.target.value)}
                      className="h-7 w-full rounded border border-input bg-background px-2 text-xs"
                      placeholder="Nama posisi"
                    />
                    <div className="flex gap-2">
                      <select
                        value={pos.direction}
                        onChange={(e) => updatePosition(pos.id, "direction", e.target.value)}
                        className="h-7 rounded border border-input bg-background px-2 text-xs"
                      >
                        <option value="long">Long</option>
                        <option value="short">Short</option>
                      </select>
                      <input
                        type="number"
                        value={pos.riskAmount}
                        onChange={(e) => updatePosition(pos.id, "riskAmount", e.target.value)}
                        className="h-7 flex-1 rounded border border-input bg-background px-2 text-xs"
                        placeholder="Risiko ($)"
                      />
                    </div>
                  </div>
                  {positions.length > 1 && (
                    <button onClick={() => removePosition(pos.id)} className="mb-0.5 p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {!result ? (
            <Card><CardContent className="flex h-40 items-center justify-center p-6"><p className="text-sm text-muted-foreground">Tambahkan posisi untuk melihat total eksposur risiko.</p></CardContent></Card>
          ) : (
            <>
              {isOverLimit && (
                <WarningAlert title="Batas Risiko Terlampaui!" message={`Total eksposur ${formatPercent(result.totalRiskPercent)} melebihi batas risiko maksimum ${maxRisk}%.`} />
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Total Risiko" value={formatPercent(result.totalRiskPercent)} variant={isOverLimit ? "warning" : "highlight"} />
                <ResultCard label="Total Jumlah Risiko" value={formatCurrency(result.totalRiskAmount)} />
                <ResultCard label="Sisa Budget Risiko" value={formatCurrency(result.remainingRiskBudget)} variant={isOverLimit ? "warning" : "success"} />
                <ResultCard label="Sisa Budget (%)" value={formatPercent(result.remainingRiskPercent)} variant={isOverLimit ? "warning" : "success"} />
              </div>

              {/* Per-position breakdown */}
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Rincian per Posisi</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {result.positions.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${p.direction === "long" ? "bg-emerald-500" : "bg-red-500"}`} />
                        <span className="text-xs font-medium">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium">{formatCurrency(p.riskAmount)}</span>
                        <span className="ml-2 text-xs text-muted-foreground">({formatPercent(p.riskPercent)})</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          <FormulaAccordion formulas={[
            { title: "Total Risiko", formula: "Total Risk = Σ Risk per Position" },
            { title: "Risk %", formula: "Risk% = Total Risk / Account Balance × 100" },
            { title: "Sisa Budget", formula: "Remaining = Max Risk Budget - Total Risk" },
          ]} />
        </div>
      </div>
    </CalculatorLayout>
  );
}
