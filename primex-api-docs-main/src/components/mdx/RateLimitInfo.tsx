import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Info } from "lucide-react";

interface RateLimitInfoProps {
  limits: {
    tier: string;
    requestsPerSecond: number;
    requestsPerDay: number;
    burstLimit?: number;
  }[];
  notes?: string;
  className?: string;
}

export function RateLimitInfo({
  limits,
  notes,
  className,
}: RateLimitInfoProps) {
  return (
    <div className={cn("my-6 rounded-lg border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-semibold">Rate Limits</h4>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2 text-left font-medium">Tier</th>
              <th className="px-4 py-2 text-center font-medium">Requests/sec</th>
              <th className="px-4 py-2 text-center font-medium">Requests/day</th>
              <th className="px-4 py-2 text-center font-medium">Burst</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {limits.map((limit, index) => (
              <tr key={index} className="hover:bg-muted/20">
                <td className="px-4 py-2 font-medium">{limit.tier}</td>
                <td className="px-4 py-2 text-center font-mono">
                  {limit.requestsPerSecond}
                </td>
                <td className="px-4 py-2 text-center font-mono">
                  {limit.requestsPerDay.toLocaleString()}
                </td>
                <td className="px-4 py-2 text-center font-mono">
                  {limit.burstLimit || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {notes && (
        <div className="flex items-start gap-2 border-t bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs text-muted-foreground">{notes}</p>
        </div>
      )}
    </div>
  );
}

interface RateLimitHeadersProps {
  className?: string;
}

export function RateLimitHeaders({ className }: RateLimitHeadersProps) {
  const headers = [
    {
      name: "X-RateLimit-Limit",
      description: "Maximum requests allowed in the current window",
    },
    {
      name: "X-RateLimit-Remaining",
      description: "Requests remaining in the current window",
    },
    {
      name: "X-RateLimit-Reset",
      description: "Unix timestamp when the rate limit resets",
    },
    {
      name: "Retry-After",
      description: "Seconds to wait before retrying (when rate limited)",
    },
  ];

  return (
    <div className={cn("my-6 rounded-lg border bg-card", className)}>
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
        <Info className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-semibold">Rate Limit Headers</h4>
      </div>
      <div className="divide-y">
        {headers.map((header) => (
          <div key={header.name} className="px-4 py-3">
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-medium">
              {header.name}
            </code>
            <p className="mt-1 text-sm text-muted-foreground">
              {header.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
