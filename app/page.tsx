"use client";

import Link from "next/link";
import {
  Calculator,
  Percent,
  Target,
  ArrowUpDown,
  BarChart2,
  Layers,
  Zap,
  Receipt,
  Clock,
  LineChart,
  TrendingUp,
  Gem,
  Bitcoin,
  ArrowRight,
  Shield,
  Gauge,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CALCULATORS = [
  {
    href: "/position-size",
    icon: Calculator,
    title: "Position Size",
    desc: "Hitung ukuran posisi optimal berdasarkan risiko.",
  },
  {
    href: "/risk-calculator",
    icon: Percent,
    title: "Risk per Trade",
    desc: "Ketahui berapa persen modal yang terpapar risiko.",
  },
  {
    href: "/stop-loss-take-profit",
    icon: Target,
    title: "Stop Loss & Take Profit",
    desc: "Tentukan level SL dan TP berdasarkan risiko.",
  },
  {
    href: "/risk-reward",
    icon: ArrowUpDown,
    title: "Risk/Reward",
    desc: "Hitung rasio risk-to-reward sebuah trade.",
  },
  {
    href: "/drawdown",
    icon: BarChart2,
    title: "Max Drawdown",
    desc: "Analisis drawdown maksimum dari ekuitas.",
  },
  {
    href: "/risk-exposure",
    icon: Layers,
    title: "Risk Exposure",
    desc: "Pantau total eksposur risiko semua posisi.",
  },
  {
    href: "/leverage-margin",
    icon: Zap,
    title: "Leverage & Margin",
    desc: "Hitung margin yang dibutuhkan dan margin level.",
  },
  {
    href: "/trading-fee",
    icon: Receipt,
    title: "Trading Fee",
    desc: "Hitung biaya maker/taker dan dampaknya.",
  },
  {
    href: "/funding-fee",
    icon: Clock,
    title: "Funding Fee",
    desc: "Hitung biaya funding untuk posisi futures.",
  },
  {
    href: "/scenario-simulator",
    icon: LineChart,
    title: "Scenario Simulator",
    desc: "Simulasikan skenario trading dan proyeksi ekuitas.",
  },
];

const MARKETS = [
  { icon: TrendingUp, name: "Forex", desc: "EUR/USD, GBP/USD, USD/JPY, dan lainnya" },
  { icon: Gem, name: "Komoditas", desc: "Emas (XAU), Perak (XAG), Minyak" },
  { icon: Bitcoin, name: "Crypto Spot", desc: "BTC, ETH, dan ratusan altcoin" },
  { icon: Zap, name: "Crypto Futures", desc: "Perpetual, leverage, likuidasi" },
];

const FEATURES = [
  { icon: Shield, title: "Tanpa Login", desc: "Langsung pakai, tanpa registrasi" },
  { icon: Gauge, title: "Hitung Real-time", desc: "Hasil langsung muncul saat mengetik" },
  { icon: Eye, title: "Privasi Terjaga", desc: "Semua kalkulasi lokal di browser" },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Trade Smarter.
            <br />
            <span className="text-muted-foreground">Manage Risk Better.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
            Kalkulator manajemen risiko trading lengkap untuk Forex, Komoditas, dan Crypto. Semua berjalan di browser — tanpa login, tanpa data tersimpan.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/position-size"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Mulai Hitung
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pasar yang Didukung */}
      <section className="mb-16">
        <h2 className="mb-6 text-center text-lg font-semibold tracking-tight">
          Pasar yang Didukung
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MARKETS.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.name} className="transition-colors hover:border-primary/30">
                <CardContent className="p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Semua Kalkulator */}
      <section className="mb-16">
        <h2 className="mb-6 text-center text-lg font-semibold tracking-tight">
          10 Kalkulator Risiko
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link key={calc.href} href={calc.href}>
                <Card className="h-full transition-all hover:border-primary/30 hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <p className="text-sm font-medium">{calc.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {calc.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fitur */}
      <section className="mb-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
