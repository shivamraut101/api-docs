import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, Lightbulb, Zap } from "lucide-react";
import * as React from "react";

interface CalloutProps {
  type?: "info" | "warning" | "danger" | "tip" | "note";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutStyles = {
  info: {
    container: "border-blue-500/20 bg-blue-500/5",
    icon: Info,
    iconColor: "text-blue-500",
    title: "text-blue-500",
  },
  warning: {
    container: "border-amber-500/20 bg-amber-500/5",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    title: "text-amber-500",
  },
  danger: {
    container: "border-red-500/20 bg-red-500/5",
    icon: AlertCircle,
    iconColor: "text-red-500",
    title: "text-red-500",
  },
  tip: {
    container: "border-emerald-500/20 bg-emerald-500/5",
    icon: Lightbulb,
    iconColor: "text-emerald-500",
    title: "text-emerald-500",
  },
  note: {
    container: "border-purple-500/20 bg-purple-500/5",
    icon: Zap,
    iconColor: "text-purple-500",
    title: "text-purple-500",
  },
};

export function Callout({
  type = "info",
  title,
  children,
  className,
}: CalloutProps) {
  const styles = calloutStyles[type];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "my-6 rounded-lg border p-4",
        styles.container,
        className
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", styles.iconColor)} />
        <div className="flex-1">
          {title && (
            <h5 className={cn("mb-1 font-semibold", styles.title)}>{title}</h5>
          )}
          <div className="text-sm text-foreground/80 [&>p]:m-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
