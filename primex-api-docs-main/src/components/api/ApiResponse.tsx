"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, CheckCircle2, Copy } from "lucide-react";
import * as React from "react";

interface ApiResponseProps {
  status: number;
  statusText?: string;
  data: unknown;
  description?: string;
  error?: string;
  headers?: Record<string, string>;
  latency?: number;
  className?: string;
}

const statusColors = {
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  error: "bg-red-500/10 text-red-500 border-red-500/30",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/30",
};

function getStatusType(status: number) {
  if (status >= 200 && status < 300) return "success";
  if (status >= 400) return "error";
  return "warning";
}

export function ApiResponse({
  status,
  statusText,
  data,
  description,
  error,
  headers,
  latency,
  className,
}: ApiResponseProps) {
  const [copied, setCopied] = React.useState(false);
  const statusType = getStatusType(status);
  const jsonString = JSON.stringify(data, null, 2);

  async function handleCopy() {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("group bg-card relative overflow-hidden rounded-lg border", className)}>
      {/* Header */}
      <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn("font-mono text-xs font-bold", statusColors[statusType])}
          >
            {statusType === "success" ? (
              <CheckCircle2 className="mr-1 h-3 w-3" />
            ) : (
              <AlertCircle className="mr-1 h-3 w-3" />
            )}
            {status} {statusText || getStatusText(status)}
          </Badge>
          {latency && <span className="text-muted-foreground text-xs">{latency}ms</span>}
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy response</span>
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-b bg-red-500/5 px-4 py-2">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="bg-muted/30 border-b px-4 py-2">
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      )}

      {/* Response Headers */}
      {headers && Object.keys(headers).length > 0 && (
        <div className="border-b px-4 py-3">
          <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Response Headers
          </h4>
          <div className="space-y-1">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key} className="flex gap-2 text-xs">
                <span className="text-foreground font-medium">{key}:</span>
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Body */}
      <div className="relative max-h-96 overflow-auto">
        <pre className="p-4 text-xs">
          <code className="language-json">{jsonString}</code>
        </pre>
      </div>
    </div>
  );
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusTexts[status] || "";
}
