import { create } from "zustand";

export type MarketCategory = "forex" | "commodity" | "crypto-spot" | "crypto-futures";

interface MarketState {
  market: MarketCategory;
  instrument: string;
  setMarket: (market: MarketCategory) => void;
  setInstrument: (instrument: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  market: "forex",
  instrument: "EUR/USD",
  setMarket: (market) =>
    set(() => ({
      market,
      instrument: getDefaultInstrument(market),
    })),
  setInstrument: (instrument) => set({ instrument }),
}));

function getDefaultInstrument(market: MarketCategory): string {
  switch (market) {
    case "forex":
      return "EUR/USD";
    case "commodity":
      return "XAU/USD";
    case "crypto-spot":
      return "BTC";
    case "crypto-futures":
      return "BTCUSDT";
  }
}
