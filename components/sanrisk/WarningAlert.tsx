"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WarningAlertProps {
  title?: string;
  message: string;
}

export function WarningAlert({ title = "Peringatan", message }: WarningAlertProps) {
  return (
    <Alert variant="destructive" className="border-amber-500/50 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-sm font-semibold">{title}</AlertTitle>
      <AlertDescription className="text-sm">{message}</AlertDescription>
    </Alert>
  );
}
