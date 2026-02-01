// Primexmeta API Types

export type Environment = "sandbox" | "production";

export type ApiStatus = "stable" | "beta" | "deprecated";

// API Request/Response Types
export interface ApiRequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  environment: Environment;
  timestamp: string;
  requestId: string;
  latency?: number;
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  label?: string;
  status?: ApiStatus;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface Heading {
  level: number;
  text: string;
  slug: string;
}
