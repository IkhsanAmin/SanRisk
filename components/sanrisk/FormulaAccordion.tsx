"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen } from "lucide-react";

interface FormulaAccordionProps {
  formulas: Array<{
    title: string;
    formula: string;
    description?: string;
  }>;
}

export function FormulaAccordion({ formulas }: FormulaAccordionProps) {
  return (
    <Accordion className="rounded-lg border border-border">
      <AccordionItem value="formulas" className="border-none">
        <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Lihat Rumus</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-3">
            {formulas.map((f, i) => (
              <div key={i} className="rounded-md bg-muted/50 p-3">
                <p className="mb-1 text-xs font-medium text-foreground">{f.title}</p>
                <code className="block text-xs text-muted-foreground">{f.formula}</code>
                {f.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground/80">{f.description}</p>
                )}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
