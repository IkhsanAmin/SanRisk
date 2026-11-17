"use client";

import { useState, useMemo } from "react";
import { Percent } from "lucide-react";
import { CalculatorLayout } from "@/components/sanrisk/CalculatorLayout";
import { PageHeader } from "@/components/sanrisk/PageHeader";
import { InputField } from "@/components/sanrisk/InputField";
import { ResultCard } from "@/components/sanrisk/ResultCard";
import { FormulaAccordion } from "@/components/sanrisk/FormulaAccordion";
import { WarningAlert } from "@/components/sanrisk/WarningAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { calcRiskPerTrade } from "@/lib/calculators/riskPerTrade";

export default function RiskCalculatorPage() {
  const [balance, setBalance] = useState("10000");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [contractSize, setContractSize] = useState("1");
  const [tradingFee, setTradingFee] = useState("0");

  const result = useMemo(() => {
    const bal = parseFloat(balance);
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLossPrice);
    const pos = parseFloat(positionSize);
    const cs = parseFloat(contractSize) || 1;
    const fee = parseFloat(tradingFee) || 0;

    if (!bal || !entry || !sl || !pos || bal <= 0 || entry <= 0 || sl <= 0 || pos <= 0) {
      return null;
    }

    try {
      return calcRiskPerTrade({
        accountBalance: bal,
        entryPrice: entry,
        stopLossPrice: sl,
        positionSize: pos,
        contractSize: cs,
        tradingFeePercent: fee,
      });
    } catch {
      return null;
    }
  }, [balance, entryPrice, stopLossPrice, positionSize, contractSize, tradingFee]);

  const isHighRisk = result && result.riskPercent > 5;

  return (
    <CalculatorLayout>
      <PageHeader
        title="Risk per Trade Calculator"
        description="Ketahui berapa persen modal yang terpapar risiko dari sebuah posisi yang sudah ditentukan."
        icon={<Percent className="h-5 w-5" />}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm">Input Perhitungan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField id="balance" label="Saldo Akun" value={balance} onChange={setBalance} prefix="$" placeholder="10000" />
            <InputField id="entry" label="Harga Entry" value={entryPrice} onChange={setEntryPrice} prefix="$" placeholder="1.1050" />
            <InputField id="sl" label="Harga Stop Loss" value={stopLossPrice} onChange={setStopLossPrice} prefix="$" placeholder="1.1000" />
            <InputField id="pos-size" label="Ukuran Posisi" value={positionSize} onChange={setPositionSize} placeholder="0.1" hint="Lot untuk Forex/Commodity, Quantity untuk Crypto" />
            <InputField id="contract-size" label="Contract Size" value={contractSize} onChange={setContractSize} placeholder="100000" hint="Forex: 100000, Crypto: 1" />
            <InputField id="fee" label="Biaya Trading" value={tradingFee} onChange={setTradingFee} suffix="%" placeholder="0" />
          </CardContent>
        </Card>

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

          {result && (
            <>
              {isHighRisk && (
                <WarningAlert
                  title="Risiko Tinggi!"
                  message={`Risiko per trade ${formatPercent(result.riskPercent)} melebihi batas aman (umumnya 1-2%). Pertimbangkan untuk mengurangi ukuran posisi.`}
                />
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="Risiko per Trade" value={formatPercent(result.riskPercent)} variant={isHighRisk ? "warning" : "highlight"} />
                <ResultCard label="Jumlah Risiko" value={formatCurrency(result.riskAmount)} />
                <ResultCard label="Potensi Kerugian" value={formatCurrency(result.potentialLoss)} />
                <ResultCard label="Biaya Trading" value={formatCurrency(result.feeAmount)} />
                <ResultCard label="Saldo Tersisa" value={formatCurrency(result.remainingBalance)} variant={result.remainingBalance > 0 ? "default" : "warning"} />
              </div>
            </>
          )}

          <FormulaAccordion
            formulas={[
              { title: "Potensi Kerugian", formula: "Potential Loss = |Entry - SL| × Position Size × Contract Size" },
              { title: "Risk per Trade", formula: "Risk% = (Potential Loss + Fee) / Account Balance × 100" },
            ]}
          />
        </div>
      </div>
    </CalculatorLayout>
  );
}
