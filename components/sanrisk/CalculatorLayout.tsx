"use client";

import { ReactNode } from "react";
import { DisclaimerBanner } from "./DisclaimerBanner";

interface CalculatorLayoutProps {
  children: ReactNode;
}

export function CalculatorLayout({ children }: CalculatorLayoutProps) {
  return (
    <>
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        {children}
      </div>
      <DisclaimerBanner />
    </>
  );
}
