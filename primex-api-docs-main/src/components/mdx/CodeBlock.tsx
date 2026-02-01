"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  className,
  language,
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const preRef = React.useRef<HTMLPreElement>(null);

  async function handleCopy() {
    const code = preRef.current?.textContent || "";
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn("group bg-muted/50 relative my-4 overflow-hidden rounded-lg border", className)}
    >
      {/* Header */}
      {(filename || language) && (
        <div className="bg-muted flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-muted-foreground text-xs font-medium">{filename}</span>
            )}
            {language && !filename && (
              <span className="text-muted-foreground text-xs uppercase">{language}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      )}

      {/* Code content */}
      <div className="relative">
        {!filename && !language && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        )}
        <pre
          ref={preRef}
          className={cn(
            "overflow-x-auto p-4 text-sm",
            showLineNumbers && "[counter-reset:line]",
            showLineNumbers &&
              "[&>code]:before:text-muted-foreground [&>code]:before:mr-4 [&>code]:before:inline-block [&>code]:before:w-4 [&>code]:before:text-right [&>code]:before:content-[counter(line)] [&>code]:before:[counter-increment:line]"
          )}
        >
          {children}
        </pre>
      </div>
    </div>
  );
}
