import type { NavSection } from "./types";

export const SITE_CONFIG = {
  name: "Primexmeta API",
  description: "Unified Travel API documentation for flights, hotels, and booking services",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "",
  ogImage: "/og.png",
  version: "1.0.0",
  github: "https://github.com/primexmeta/primex-api-docs",
} as const;


export const DOCS_NAV: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs/getting-started/introduction" },
      { title: "Quick Start", href: "/docs/getting-started/quick-start" },
      { title: "Installation", href: "/docs/getting-started/installation" },
    ],
  },
];

export const API_VERSIONS = ["v1", "v2-beta"] as const;

export const STATUS_COLORS = {
  stable: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  beta: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  deprecated: "bg-red-500/10 text-red-500 border-red-500/20",
} as const;

export const ENVIRONMENT_COLORS = {
  sandbox: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  production: "bg-blue-500/10 text-blue-500 border-blue-500/20",
} as const;
