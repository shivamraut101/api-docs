"use client";

import * as React from "react";

interface PropertiesProps {
  children: React.ReactNode;
}

export function Properties({ children }: PropertiesProps) {
  return (
    <div className="my-6 w-full overflow-hidden rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 font-medium">Property</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="w-full px-4 py-3 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}

interface PropertyProps {
  name: string;
  type: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Property({ name, type, required, children }: PropertyProps) {
  return (
    <tr className="group hover:bg-muted/30">
      <td className="text-foreground px-4 py-3 font-mono font-medium">
        {name}
        {required && <span className="ml-1 text-red-500">*</span>}
      </td>
      <td className="text-muted-foreground px-4 py-3 font-mono text-xs">{type}</td>
      <td className="text-muted-foreground px-4 py-3 leading-relaxed">{children}</td>
    </tr>
  );
}
