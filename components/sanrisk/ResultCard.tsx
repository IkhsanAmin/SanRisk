"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  label: string;
  value: string;
  sublabel?: string;
  variant?: "default" | "highlight" | "warning" | "success";
  icon?: React.ReactNode;
}

export function ResultCard({ label, value, sublabel, variant = "default", icon }: ResultCardProps) {
  return (
    <Card
      className={cn(
        "transition-all",
        variant === "highlight" && "border-primary/30 bg-primary/5",
        variant === "warning" && "border-amber-500/30 bg-amber-50 dark:bg-amber-950/20",
        variant === "success" && "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
              className={cn(
                "mt-0.5 text-lg font-semibold tracking-tight",
                variant === "warning" && "text-amber-700 dark:text-amber-400",
                variant === "success" && "text-emerald-700 dark:text-emerald-400"
              )}
            >
              {value}
            </p>
            {sublabel && (
              <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
            )}
          </div>
          {icon && (
            <div className="shrink-0 text-muted-foreground">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
