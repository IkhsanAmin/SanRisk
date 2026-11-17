"use client";

import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="sticky bottom-0 z-40 border-t border-amber-200/50 bg-amber-50/90 backdrop-blur-sm dark:border-amber-900/30 dark:bg-amber-950/80">
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 py-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs text-amber-700 dark:text-amber-300">
          <strong>Disclaimer:</strong> Hasil perhitungan hanya bersifat estimasi dan bukan merupakan saran finansial. Selalu lakukan riset mandiri sebelum mengambil keputusan trading.
        </p>
      </div>
    </div>
  );
}
