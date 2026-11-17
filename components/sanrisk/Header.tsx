
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  ChevronDown,
  Sun,
  Moon,
  TrendingUp,
  Calculator,
  Target,
  ArrowUpDown,
  BarChart2,
  Layers,
  Percent,
  Zap,
  Receipt,
  Clock,
  LineChart,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: TrendingUp },
  { href: "/position-size", label: "Position Size", icon: Calculator },
  { href: "/risk-calculator", label: "Risk per Trade", icon: Percent },
  { href: "/stop-loss-take-profit", label: "Stop Loss & Take Profit", icon: Target },
  { href: "/risk-reward", label: "Risk/Reward", icon: ArrowUpDown },
  { href: "/drawdown", label: "Max Drawdown", icon: BarChart2 },
  { href: "/risk-exposure", label: "Risk Exposure", icon: Layers },
  { href: "/leverage-margin", label: "Leverage & Margin", icon: Zap },
  { href: "/trading-fee", label: "Trading Fee", icon: Receipt },
  { href: "/funding-fee", label: "Funding Fee", icon: Clock },
  { href: "/scenario-simulator", label: "Scenario Simulator", icon: LineChart },
];

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("sanrisk-theme-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("sanrisk-theme-change", callback);
  };
}

function getThemeSnapshot(): "light" | "dark" {
  const stored = localStorage.getItem("theme");

  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getThemeServerSnapshot(): "light" | "dark" {
  return "light";
}

export function Header() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";

    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.dispatchEvent(new Event("sanrisk-theme-change"));
  };

  const currentPage = NAV_ITEMS.find((item) => item.href === pathname);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
            SR
          </div>
          <span className="text-sm font-semibold tracking-tight">SanRisk</span>
        </Link>

        <div className="relative hidden md:block">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:bg-muted",
              dropdownOpen && "bg-muted"
            )}
          >
            <span className="text-muted-foreground">
              {currentPage?.label ?? "Kalkulator"}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-lg border border-border bg-popover shadow-lg">
                <div className="p-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex-1" />

        <button
          onClick={toggleTheme}
          className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>

        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="rounded-md border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto max-w-[1200px] px-4 py-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
