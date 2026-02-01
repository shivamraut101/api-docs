// Docs Editor Types

import type { ApiStatus } from "./types";

// Document lifecycle states
export type DocStatus = "draft" | "in_review" | "published" | "deprecated";

// Editor roles
export type EditorRole = "writer" | "admin" | "viewer";

// Document metadata
export interface DocMetadata {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  status: DocStatus;
  apiStatus: ApiStatus;
  version: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastEditedBy: string;
  isDefault: boolean;
}

// Editor session (consumed from existing auth)
export interface EditorSession {
  userId: string;
  name: string;
  email: string;
  role: EditorRole;
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canReview: boolean;
    canPublish: boolean;
    canDelete: boolean;
  };
}

// Block types for the visual editor
export type BlockType =
  | "heading"
  | "paragraph"
  | "code"
  | "callout"
  | "steps"
  | "api-request"
  | "api-response"
  | "table"
  | "list"
  | "divider"
  | "rate-limit";

// Base block interface
export interface EditorBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

// Specific block data types
export interface HeadingBlockData {
  level: 1 | 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlockData {
  text: string;
}

export interface CodeBlockData {
  language: string;
  code: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

export interface CalloutBlockData {
  type: "info" | "warning" | "danger" | "tip";
  title?: string;
  content: string;
}

export interface StepsBlockData {
  steps: Array<{
    title: string;
    content: string;
  }>;
}

export interface ApiRequestBlockData {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  endpoint: string;
  description?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export interface ApiResponseBlockData {
  status: number;
  description?: string;
  data: unknown;
  latency?: number;
}

export interface TableBlockData {
  headers: string[];
  rows: string[][];
}

export interface ListBlockData {
  ordered: boolean;
  style?:
    | "disc"
    | "circle"
    | "square"
    | "decimal"
    | "lower-alpha"
    | "upper-alpha"
    | "lower-roman"
    | "upper-roman";
  items: string[];
}

export interface RateLimitBlockData {
  limits: Array<{
    tier: string;
    requestsPerSecond: number;
    requestsPerDay: number;
    burstLimit?: number;
  }>;
  notes?: string;
}

// Document structure
export interface EditorDocument {
  metadata: DocMetadata;
  blocks: EditorBlock[];
}

// Validation rules
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: "error" | "warning";
  validate: (doc: EditorDocument) => ValidationResult;
}

export interface ValidationResult {
  passed: boolean;
  message?: string;
  blockId?: string;
}

// Forbidden terms for validation
export const FORBIDDEN_TERMS = [
  "tbo",
  "amadeus",
  "brightsun",
  "vendor",
  "third-party api",
  "external api",
  "partner api",
];

// Required sections for API docs
export const REQUIRED_SECTIONS = ["overview", "request", "response", "errors"];
