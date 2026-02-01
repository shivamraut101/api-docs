"use client";

import { validateDocument } from "@/app/actions/editor.actions";
import { Button } from "@/components/ui/button";
import type { EditorDocument } from "@/lib/editor-types";
import { AlertTriangle, Check, RefreshCw, X } from "lucide-react";
import * as React from "react";

interface ValidationPanelProps {
  document: EditorDocument;
}

export function ValidationPanel({ document }: ValidationPanelProps) {
  const [validation, setValidation] = React.useState<{
    passed: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);

  const runValidation = React.useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateDocument(document.metadata.id);
      if (result.success && result.data) {
        setValidation(result.data);
      }
    } finally {
      setIsValidating(false);
    }
  }, [document.metadata.id]);

  React.useEffect(() => {
    runValidation();
  }, [runValidation]);

  return (
    <div className="rounded-lg border">
      <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Validation</h3>
        <Button variant="ghost" size="sm" onClick={runValidation} disabled={isValidating}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
          Check
        </Button>
      </div>

      <div className="p-4">
        {validation ? (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              {validation.passed ? (
                <>
                  <div className="rounded-full bg-emerald-500/10 p-1">
                    <Check className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="font-medium text-emerald-500">Ready to publish</span>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-red-500/10 p-1">
                    <X className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="font-medium text-red-500">Issues found</span>
                </>
              )}
            </div>

            {/* Errors */}
            {validation.errors.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-red-500">
                  Errors ({validation.errors.length})
                </p>
                <ul className="space-y-1">
                  {validation.errors.map((error, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500"
                    >
                      <X className="mt-0.5 h-3 w-3 shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-amber-500">
                  Warnings ({validation.warnings.length})
                </p>
                <ul className="space-y-1">
                  {validation.warnings.map((warning, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-500"
                    >
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validation.passed && validation.warnings.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No issues found. Document can be published.
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Checking...</p>
        )}
      </div>
    </div>
  );
}
