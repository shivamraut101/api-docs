"use client";

import { API_VERSIONS } from "@/lib/constants";
import * as React from "react";

type ApiVersion = (typeof API_VERSIONS)[number];

interface DocsContextType {
  version: ApiVersion;
  setVersion: (version: ApiVersion) => void;
}

const DocsContext = React.createContext<DocsContextType | undefined>(undefined);

export function DocsProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = React.useState<ApiVersion>(API_VERSIONS[0]);

  return <DocsContext.Provider value={{ version, setVersion }}>{children}</DocsContext.Provider>;
}

export function useDocs() {
  const context = React.useContext(DocsContext);
  if (context === undefined) {
    throw new Error("useDocs must be used within a DocsProvider");
  }
  return context;
}
