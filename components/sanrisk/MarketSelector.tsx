"use client";

import { MarketCategory, useMarketStore } from "@/store/marketStore";
import { cn } from "@/lib/utils";
import { TrendingUp, Gem, Bitcoin, Zap } from "lucide-react";

const MARKETS: { key: MarketCategory; label: string; icon: React.ElementType }[] = [
  { key: "forex", label: "Forex", icon: TrendingUp },
  { key: "commodity", label: "Komoditas", icon: Gem },
  { key: "crypto-spot", label: "Crypto Spot", icon: Bitcoin },
  { key: "crypto-futures", label: "Crypto Futures", icon: Zap },
];

interface MarketSelectorProps {
  /** Filter pasar yang tersedia (opsional, tampilkan semua jika tidak ada) */
  availableMarkets?: MarketCategory[];
}

export function MarketSelector({ availableMarkets }: MarketSelectorProps) {
  const { market, setMarket } = useMarketStore();
  const markets = availableMarkets
    ? MARKETS.filter((m) => availableMarkets.includes(m.key))
    : MARKETS;

  return (
    <div className="flex flex-wrap gap-2">
      {markets.map((m) => {
        const Icon = m.icon;
        const active = market === m.key;
        return (
          <button
            key={m.key}
            onClick={() => setMarket(m.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
