"use client";

import { Button } from "@/components/ui/button";
import type { BlockType } from "@/lib/editor-types";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  AlignLeft,
  ArrowDownLeft,
  Code,
  Footprints,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  Minus,
  Send,
  Table,
  X,
} from "lucide-react";
import * as React from "react";

interface BlockPaletteProps {
  onSelect: (type: BlockType, data: Record<string, unknown>) => void;
  onClose: () => void;
}

interface BlockOption {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "text" | "api" | "layout" | "interactive";
  defaultData: Record<string, unknown>;
}

const blockOptions: BlockOption[] = [
  // Text blocks
  {
    type: "heading",
    label: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    category: "text",
    defaultData: { level: 1, text: "Heading" },
  },
  {
    type: "heading",
    label: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    category: "text",
    defaultData: { level: 2, text: "Subheading" },
  },
  {
    type: "heading",
    label: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    category: "text",
    defaultData: { level: 3, text: "Section" },
  },
  {
    type: "paragraph",
    label: "Paragraph",
    description: "Regular text content",
    icon: AlignLeft,
    category: "text",
    defaultData: { text: "Enter your text here..." },
  },
  {
    type: "code",
    label: "Code Block",
    description: "Syntax-highlighted code",
    icon: Code,
    category: "text",
    defaultData: { language: "typescript", code: "// Your code here" },
  },
  {
    type: "list",
    label: "List",
    description: "Bullet or numbered list",
    icon: ListOrdered,
    category: "text",
    defaultData: { ordered: false, items: ["Item 1", "Item 2", "Item 3"] },
  },
  {
    type: "table",
    label: "Table",
    description: "Data table with headers",
    icon: Table,
    category: "text",
    defaultData: {
      headers: ["Column 1", "Column 2"],
      rows: [["Cell 1", "Cell 2"]],
    },
  },

  // API blocks
  {
    type: "api-request",
    label: "API Request",
    description: "Document an API request",
    icon: Send,
    category: "api",
    defaultData: {
      method: "POST",
      endpoint: "https://api.primexmeta.com/v1/",
      description: "Description of this endpoint",
      headers: { "Content-Type": "application/json" },
      body: {},
    },
  },
  {
    type: "api-response",
    label: "API Response",
    description: "Document an API response",
    icon: ArrowDownLeft,
    category: "api",
    defaultData: {
      status: 200,
      data: { success: true },
      latency: 150,
    },
  },
  {
    type: "rate-limit",
    label: "Rate Limits",
    description: "Rate limit information table",
    icon: Activity,
    category: "api",
    defaultData: {
      limits: [{ tier: "Sandbox", requestsPerSecond: 10, requestsPerDay: 1000 }],
      notes: "Contact sales for higher limits",
    },
  },

  // Layout blocks
  {
    type: "callout",
    label: "Callout",
    description: "Highlighted information box",
    icon: AlertCircle,
    category: "layout",
    defaultData: { type: "info", title: "Note", content: "Important information" },
  },
  {
    type: "steps",
    label: "Steps",
    description: "Numbered step-by-step guide",
    icon: Footprints,
    category: "layout",
    defaultData: {
      steps: [
        { title: "Step 1", content: "First step description" },
        { title: "Step 2", content: "Second step description" },
      ],
    },
  },
  {
    type: "divider",
    label: "Divider",
    description: "Horizontal separator line",
    icon: Minus,
    category: "layout",
    defaultData: {},
  },
];

const categories = [
  { id: "text", label: "Text" },
  { id: "api", label: "API Documentation" },
  { id: "layout", label: "Layout" },
];

export function BlockPalette({ onSelect, onClose }: BlockPaletteProps) {
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  const filteredBlocks = blockOptions.filter((block) => {
    const matchesSearch =
      block.label.toLowerCase().includes(search.toLowerCase()) ||
      block.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || block.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card w-full max-w-2xl rounded-lg border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Add Block</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="border-b px-4 py-3">
          <input
            type="text"
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            autoFocus
          />
          <div className="mt-3 flex gap-2">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Block Grid */}
        <div className="max-h-96 overflow-y-auto p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredBlocks.map((block, index) => (
              <button
                key={`${block.type}-${index}`}
                onClick={() => onSelect(block.type, block.defaultData)}
                className={cn(
                  "hover:bg-muted flex items-start gap-3 rounded-lg border p-3 text-left transition-colors"
                )}
              >
                <div className="bg-primary/10 rounded-md p-2">
                  <block.icon className="text-primary h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{block.label}</p>
                  <p className="text-muted-foreground text-xs">{block.description}</p>
                </div>
              </button>
            ))}
          </div>

          {filteredBlocks.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              No blocks match your search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
