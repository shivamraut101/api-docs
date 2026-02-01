import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

interface StepProps {
  title: string;
  children: React.ReactNode;
}

export function Steps({ children, className }: StepsProps) {
  return (
    <div className={cn("relative my-6 ml-3 border-l-2 border-border pl-6", className)}>
      {children}
    </div>
  );
}

export function Step({ title, children }: StepProps) {
  return (
    <div className="relative pb-8 last:pb-0">
      {/* Step indicator */}
      <div className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background">
        <Check className="h-3 w-3 text-primary" />
      </div>

      {/* Content */}
      <div>
        <h4 className="mb-2 font-semibold text-foreground">{title}</h4>
        <div className="text-sm text-muted-foreground [&>p]:mt-1 [&>pre]:my-3">
          {children}
        </div>
      </div>
    </div>
  );
}
