"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import * as React from "react";

export function Pre({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = React.useState(false);
  const preRef = React.useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const code = preRef.current?.innerText || "";
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-muted/50 relative my-4 overflow-hidden rounded-lg border">
      <div className="absolute top-2 right-2 z-10 w-fit">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground bg-muted/50 h-8 w-8 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre ref={preRef} className={cn("overflow-x-auto p-4 py-3 text-sm", className)} {...props}>
        {children}
      </pre>
    </div>
  );
}
