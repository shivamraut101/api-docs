"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";
import * as React from "react";

interface ApiRequestProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | unknown[];
  description?: string;
  className?: string;
}

const methodColors = {
  GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  PUT: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/30",
  PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/30",
};

export function ApiRequest({
  method,
  endpoint,
  headers,
  body,
  description,
  className,
}: ApiRequestProps) {
  const [copied, setCopied] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const hasDetails = headers || body;
  const curlCommand = generateCurl(method, endpoint, headers, body);

  async function handleCopy() {
    await navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("group bg-card relative overflow-hidden rounded-lg border", className)}>
      {/* Header */}
      <div className="bg-muted/50 flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Badge
            variant="outline"
            className={cn("font-mono text-xs font-bold", methodColors[method])}
          >
            {method}
          </Badge>
          <code className="text-foreground truncate text-sm font-medium break-all">{endpoint}</code>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy cURL</span>
          </Button>
          {hasDetails && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="text-muted-foreground border-b px-4 py-2 text-sm">{description}</div>
      )}

      {/* Expandable Details */}
      {hasDetails && expanded && (
        <div className="divide-y">
          {/* Headers */}
          {headers && (
            <div className="px-4 py-3">
              <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Headers
              </h4>
              <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                <code>{JSON.stringify(headers, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Request Body */}
          {body && (
            <div className="px-4 py-3">
              <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Request Body
              </h4>
              <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                <code>{JSON.stringify(body, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function generateCurl(
  method: string,
  endpoint: string,
  headers?: Record<string, string>,
  body?: Record<string, unknown> | unknown[]
): string {
  let curl = `curl -X ${method} "${endpoint}"`;

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      curl += ` \\\n  -H "${key}: ${value}"`;
    });
  }

  if (body) {
    curl += ` \\\n  -d '${JSON.stringify(body)}'`;
  }

  return curl;
}
