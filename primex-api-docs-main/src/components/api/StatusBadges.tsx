import { Badge } from "@/components/ui/badge";
import { ENVIRONMENT_COLORS, STATUS_COLORS } from "@/lib/constants";
import type { ApiStatus, Environment } from "@/lib/types";
import { cn } from "@/lib/utils";

// Environment Badge
interface EnvironmentBadgeProps {
  environment: Environment;
  className?: string;
}

export function EnvironmentBadge({ environment, className }: EnvironmentBadgeProps) {
  return (
    <Badge variant="outline" className={cn(ENVIRONMENT_COLORS[environment], className)}>
      {environment === "production" ? "Production" : "Sandbox"}
    </Badge>
  );
}

// Status Badge
interface StatusBadgeProps {
  status: ApiStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const labels = {
    stable: "Stable",
    beta: "Beta",
    deprecated: "Deprecated",
  };

  return (
    <Badge variant="outline" className={cn(STATUS_COLORS[status], className)}>
      {labels[status]}
    </Badge>
  );
}

// Version Badge
interface VersionBadgeProps {
  version: string;
  className?: string;
}

export function VersionBadge({ version, className }: VersionBadgeProps) {
  return (
    <Badge variant="outline" className={className}>
      {version}
    </Badge>
  );
}
