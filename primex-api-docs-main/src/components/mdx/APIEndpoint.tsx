"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import * as React from "react";

interface APIEndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
}

const methodColors = {
  GET: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
  POST: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
  PUT: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
  PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
};

export function APIEndpoint({ method, path }: APIEndpointProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-muted/50 my-6 flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3 overflow-hidden">
        <Badge variant="outline" className={`${methodColors[method]} font-mono font-bold`}>
          {method}
        </Badge>
        <code className="text-muted-foreground truncate font-mono text-sm font-medium">{path}</code>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
