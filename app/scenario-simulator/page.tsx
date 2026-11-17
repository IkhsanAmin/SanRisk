"use client";

import { useState, useMemo, useCallback } from "react";
import { LineChart, Play, RefreshCw } from "lucide-react";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { InputField } from "@/components/sanrisk/InputField";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { calcScenario, type ScenarioResult } from "@/lib/calculators/scenario";

export default function ScenarioSimulatorPage() {
  const [initialBalance, setInitialBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("1");
  const [winRate, setWinRate] = useState("50");
  const [rrRatio, setRrRatio] = useState("2");
  const [numTrades, setNumTrades] = useState("100");
  const [randomize, setRandomize] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [runCount, setRunCount] = useState(0);

  const runSimulation = useCallback(() => {
    const bal = parseFloat(initialBalance);
    const risk = parseFloat(riskPercent);
    const wr = parseFloat(winRate);
    const rr = parseFloat(rrRatio);
    const n = parseInt(numTrades, 10);

    if (!bal || !risk || !wr || !rr || !n || bal <= 0 || risk <= 0 || wr < 0 || wr > 100 || rr <= 0 || n <= 0) {
      return;
    }

    try {
      const r = calcScenario({
        initialBalance: bal,
        riskPerTradePercent: risk,
        winRatePercent: wr,
        rrRatio: rr,
        numberOfTrades: Math.min(n, 1000),
        randomize,
      });
      setResult(r);
      setRunCount((c) => c + 1);
    } catch {
      // ignore
    }
  }, [initialBalance, riskPercent, winRate, rrRatio, numTrades, randomize]);

  // Simple sparkline using CSS
  const sparkline = useMemo(() => {
    if (!result || result.equityCurve.length < 2) return null;
    const curve = result.equityCurve;
    const max = Math.max(...curve);
    const min = Math.min(...curve);
    const range = max - min || 1;
    // Sample to max 100 points for performance
    const step = Math.max(1, Math.floor(curve.length / 100));
    const sampled = curve.filter((_, i) => i % step === 0 || i === curve.length - 1);

    return sampled.map((val, i) => ({
      x: (i / (sampled.length - 1)) * 100,
      y: 100 - ((val - min) / range) * 100,
      val,
    }));
  }, [result]);

  const expectancyLabel = useMemo(() => {
    if (!result) return "";
    if (result.expectancyPercent > 0) return "Positif (Menguntungkan)";
    if (result.expectancyPercent < 0) return "Negatif (Merugikan)";
    return "Netral";
  }, [result]);

  return (
    <CalculatorLayout>
      <PageHeader
        title="Scenario Simulator"
        description="Simulasikan skenario trading untuk memproyeksikan ekuitas berdasarkan parameter risiko."
        icon={<LineChart className="h-5 w-5" />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Parameter Simulasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField id="balance" label="Saldo Awal" value={initialBalance} onChange={setInitialBalance} prefix="$" />
            <InputField id="risk" label="Risiko per Trade" value={riskPercent} onChange={setRiskPercent} suffix="%" />
            <InputField id="wr" label="Win Rate" value={winRate} onChange={setWinRate} suffix="%" />
            <InputField id="rr" label="Risk:Reward Ratio" value={rrRatio} onChange={setRrRatio} hint="Contoh: 2 artinya R:R = 1:2" />
            <InputField id="trades" label="Jumlah Trade" value={numTrades} onChange={setNumTrades} hint="Maks 1000" />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="randomize"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="randomize" className="text-sm">
                Mode Monte Carlo (acak)
              </Label>
            </div>

            <Button onClick={runSimulation} className="w-full gap-2">
              {runCount > 0 ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {runCount > 0 ? "Jalankan Ulang" : "Jalankan Simulasi"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!result ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">
                  Atur parameter dan klik &quot;Jalankan Simulasi&quot; untuk melihat hasil.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard
                  label="Saldo Akhir"
                  value={formatCurrency(result.finalBalance)}
                  variant={result.totalPnL >= 0 ? "success" : "warning"}
                />
                <ResultCard
                  label="Total Return"
                  value={formatPercent(result.totalReturnPercent)}
                  sublabel={formatCurrency(result.totalPnL)}
                  variant={result.totalPnL >= 0 ? "success" : "warning"}
                />
                <ResultCard
                  label="Max Drawdown"
                  value={formatPercent(result.maxDrawdownPercent)}
                  variant={result.maxDrawdownPercent > 20 ? "warning" : "default"}
                />
                <ResultCard
                  label="Expectancy"
                  value={formatPercent(result.expectancyPercent)}
                  sublabel={expectancyLabel}
                  variant={result.expectancyPercent > 0 ? "success" : result.expectancyPercent < 0 ? "warning" : "default"}
                />
                <ResultCard label="Win" value={`${result.winCount}`} sublabel={formatPercent((result.winCount / (result.winCount + result.lossCount)) * 100)} variant="success" />
                <ResultCard label="Loss" value={`${result.lossCount}`} sublabel={formatPercent((result.lossCount / (result.winCount + result.lossCount)) * 100)} variant="warning" />
              </div>

              {/* SVG Equity Curve */}
              {sparkline && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground">Equity Curve</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <svg viewBox="0 0 100 50" className="h-32 w-full" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.3" />
                      {/* Starting balance line */}
                      <line x1="0" y1={sparkline[0].y * 0.5} x2="100" y2={sparkline[0].y * 0.5} stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.2" strokeDasharray="1,1" />
                      {/* Curve */}
                      <polyline
                        fill="none"
                        stroke={result.totalPnL >= 0 ? "#10b981" : "#f59e0b"}
                        strokeWidth="0.5"
                        points={sparkline.map((p) => `${p.x},${p.y * 0.5}`).join(" ")}
                      />
                      {/* Area fill */}
                      <polygon
                        fill={result.totalPnL >= 0 ? "#10b981" : "#f59e0b"}
                        fillOpacity="0.1"
                        points={`0,50 ${sparkline.map((p) => `${p.x},${p.y * 0.5}`).join(" ")} 100,50`}
                      />
                    </svg>
                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                      <span>Trade 1</span>
                      <span>Trade {result.equityCurve.length - 1}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <FormulaAccordion
            formulas={[
              { title: "Risk per Trade", formula: "Risk Amount = Balance × Risk%" },
              { title: "Win Trade", formula: "New Balance = Balance + (Risk Amount × R:R)" },
              { title: "Loss Trade", formula: "New Balance = Balance - Risk Amount" },
              { title: "Expectancy", formula: "E = (Win Rate × R:R × Risk%) - (Loss Rate × Risk%)" },
            ]}
          />
        </div>
      </div>
    </CalculatorLayout>
  );
}
