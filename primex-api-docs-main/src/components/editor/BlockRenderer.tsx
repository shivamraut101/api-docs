"use client";

import { ApiResponse } from "@/components/api/ApiResponse";

import { Badge } from "@/components/ui/badge";

import type {
  ApiRequestBlockData,
  ApiResponseBlockData,
  CalloutBlockData,
  CodeBlockData,
  EditorBlock,
  HeadingBlockData,
  ListBlockData,
  ParagraphBlockData,
  RateLimitBlockData,
  StepsBlockData,
  TableBlockData,
} from "@/lib/editor-types";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, Lightbulb, Plus, Trash2 } from "lucide-react";
import * as React from "react";

interface BlockRendererProps {
  block: EditorBlock;
  isSelected: boolean;
  onChange: (data: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function BlockRenderer({ block, isSelected, onChange, readOnly }: BlockRendererProps) {
  const handleChange = (data: unknown) => {
    onChange(data as Record<string, unknown>);
  };

  switch (block.type) {
    case "heading":
      return (
        <HeadingBlock
          data={block.data as unknown as HeadingBlockData}
          isSelected={isSelected}
          onChange={handleChange}
          readOnly={readOnly}
        />
      );
    case "paragraph":
      return (
        <ParagraphBlock
          data={block.data as unknown as ParagraphBlockData}
          isSelected={isSelected}
          onChange={handleChange}
          readOnly={readOnly}
        />
      );
    case "code":
      return (
        <CodeBlock
          data={block.data as unknown as CodeBlockData}
          isSelected={isSelected}
          onChange={handleChange}
          readOnly={readOnly}
        />
      );
    case "callout":
      return (
        <CalloutBlock
          data={block.data as unknown as CalloutBlockData}
          isSelected={isSelected}
          onChange={handleChange}
          readOnly={readOnly}
        />
      );
    case "steps":
      return (
        <StepsBlock
          data={block.data as unknown as StepsBlockData}
          isSelected={isSelected}
          onChange={handleChange}
          readOnly={readOnly}
        />
      );
    case "api-request":
      return (
        <ApiRequestBlock
          data={block.data as unknown as ApiRequestBlockData}
          isSelected={isSelected}
          onChange={handleChange}
          readOnly={readOnly}
        />
      );
    case "api-response":
      return readOnly ? (
        <ApiResponseBlockView data={block.data as unknown as ApiResponseBlockData} />
      ) : (
        <ApiResponseBlockEdit
          data={block.data as unknown as ApiResponseBlockData}
          onChange={handleChange}
        />
      );
    case "table":
      return (
        <TableBlock
          data={block.data as unknown as TableBlockData}
          isSelected={isSelected}
          onChange={handleChange}
          readOnly={readOnly}
        />
      );
    case "list":
      return (
        <ListBlock
          data={block.data as unknown as ListBlockData}
          isSelected={isSelected}
          onChange={handleChange}
          readOnly={readOnly}
        />
      );
    case "rate-limit":
      return (
        <RateLimitBlock
          data={block.data as unknown as RateLimitBlockData}
          isSelected={isSelected}
          onChange={handleChange}
          readOnly={readOnly}
        />
      );

    case "divider":
      return <hr className="border-border my-4" />;

    default:
      return (
        <div className="rounded-lg bg-red-500/10 p-4 text-red-500">
          Unknown block type: {block.type}
        </div>
      );
  }
}

// Individual block components with inline editing

function HeadingBlock({
  data,
  onChange,
  readOnly,
}: {
  data: HeadingBlockData;
  isSelected: boolean;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
}) {
  const sizes = {
    1: "text-3xl font-bold",
    2: "text-2xl font-bold",
    3: "text-xl font-medium",
    4: "text-lg font-medium",
  };
  const headingTag = `h${Math.min(Math.max(data.level, 1), 4)}` as const;

  return (
    <div className="p-3">
      {readOnly ? (
        React.createElement(headingTag, { className: sizes[data.level] }, data.text)
      ) : (
        <input
          type="text"
          value={data.text}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          className={cn(sizes[data.level], "w-full bg-transparent focus:outline-none")}
          placeholder="Enter heading..."
        />
      )}
    </div>
  );
}

function ParagraphBlock({
  data,
  onChange,
  readOnly,
}: {
  data: ParagraphBlockData;
  isSelected: boolean;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="p-3">
      {readOnly ? (
        <p>{data.text}</p>
      ) : (
        <textarea
          value={data.text}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          className="min-h-[80px] w-full resize-none bg-transparent focus:outline-none"
          placeholder="Enter text..."
        />
      )}
    </div>
  );
}

function CodeBlock({
  data,
  onChange,
  readOnly,
}: {
  data: CodeBlockData;
  isSelected: boolean;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <input
          type="text"
          value={data.language}
          onChange={(e) => onChange({ ...data, language: e.target.value })}
          className="bg-transparent text-xs text-white/60 focus:outline-none"
          placeholder="language"
          disabled={readOnly}
        />
      </div>
      <textarea
        value={data.code}
        onChange={(e) => onChange({ ...data, code: e.target.value })}
        className="min-h-[120px] w-full bg-transparent p-4 font-mono text-sm text-white focus:outline-none"
        placeholder="// Enter code..."
        disabled={readOnly}
      />
    </div>
  );
}

function CalloutBlock({
  data,
  onChange,
  readOnly,
}: {
  data: CalloutBlockData;
  isSelected: boolean;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
}) {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    danger: AlertCircle,
    tip: Lightbulb,
  };
  const colors = {
    info: "border-blue-500/20 bg-blue-500/10",
    warning: "border-amber-500/20 bg-amber-500/10",
    danger: "border-red-500/20 bg-red-500/10",
    tip: "border-emerald-500/20 bg-emerald-500/10",
  };

  const Icon = icons[data.type];

  return (
    <div className={cn("rounded-lg border p-4", colors[data.type])}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {readOnly ? (
          <span className="font-medium">{data.title}</span>
        ) : (
          <>
            <select
              value={data.type}
              onChange={(e) =>
                onChange({ ...data, type: e.target.value as CalloutBlockData["type"] })
              }
              className="bg-transparent text-xs font-medium focus:outline-none"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
              <option value="tip">Tip</option>
            </select>
            <input
              type="text"
              value={data.title || ""}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
              className="flex-1 bg-transparent font-medium focus:outline-none"
              placeholder="Title (optional)"
            />
          </>
        )}
      </div>
      {readOnly ? (
        <p>{data.content}</p>
      ) : (
        <textarea
          value={data.content}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          className="min-h-[60px] w-full resize-none bg-transparent focus:outline-none"
          placeholder="Callout content..."
        />
      )}
    </div>
  );
}

function StepsBlock({
  data,
  onChange,
  readOnly,
}: {
  data: StepsBlockData;
  isSelected: boolean;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
}) {
  const updateStep = (index: number, field: "title" | "content", value: string) => {
    const newSteps = [...data.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onChange({ ...data, steps: newSteps });
  };

  const addStep = () => {
    onChange({
      ...data,
      steps: [...data.steps, { title: "New Step", content: "" }],
    });
  };

  return (
    <div className="space-y-3 p-3">
      {data.steps.map((step, index) => (
        <div key={index} className="flex gap-3">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {index + 1}
          </div>
          <div className="flex-1">
            {readOnly ? (
              <>
                <p className="font-medium">{step.title}</p>
                <p className="text-muted-foreground">{step.content}</p>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStep(index, "title", e.target.value)}
                  className="w-full bg-transparent font-medium focus:outline-none"
                  placeholder="Step title..."
                />
                <textarea
                  value={step.content}
                  onChange={(e) => updateStep(index, "content", e.target.value)}
                  className="text-muted-foreground mt-1 w-full resize-none bg-transparent focus:outline-none"
                  placeholder="Step content..."
                />
              </>
            )}
          </div>
        </div>
      ))}
      {!readOnly && (
        <button onClick={addStep} className="text-primary text-sm hover:underline">
          + Add step
        </button>
      )}
    </div>
  );
}

function ApiRequestBlock({
  data,
  onChange,
  readOnly,
}: {
  data: ApiRequestBlockData;
  isSelected: boolean;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
}) {
  const methodColors: Record<string, string> = {
    GET: "bg-emerald-500",
    POST: "bg-blue-500",
    PUT: "bg-amber-500",
    DELETE: "bg-red-500",
    PATCH: "bg-purple-500",
  };

  const addHeader = () => {
    const newHeaders = { ...data.headers, "": "" };
    onChange({ ...data, headers: newHeaders });
  };

  const updateHeaderKey = (oldKey: string, newKey: string) => {
    const newHeaders = { ...data.headers };
    if (newKey !== oldKey) {
      newHeaders[newKey] = newHeaders[oldKey];
      delete newHeaders[oldKey];
      onChange({ ...data, headers: newHeaders });
    }
  };

  const updateHeaderValue = (key: string, value: string) => {
    onChange({
      ...data,
      headers: { ...data.headers, [key]: value },
    });
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...data.headers };
    delete newHeaders[key];
    onChange({ ...data, headers: newHeaders });
  };

  const [bodyJson, setBodyJson] = React.useState(JSON.stringify(data.body || {}, null, 2));

  const handleBodyChange = (value: string) => {
    setBodyJson(value);
    try {
      const parsed = JSON.parse(value);
      onChange({ ...data, body: parsed });
    } catch {
      // Invalid JSON
    }
  };

  return (
    <div className="bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        {readOnly ? (
          <Badge className={methodColors[data.method]}>{data.method}</Badge>
        ) : (
          <select
            value={data.method}
            onChange={(e) =>
              onChange({ ...data, method: e.target.value as ApiRequestBlockData["method"] })
            }
            className={cn(
              "rounded px-2 py-1 text-xs font-bold text-white",
              methodColors[data.method]
            )}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        )}
        {readOnly ? (
          <code className="text-sm">{data.endpoint}</code>
        ) : (
          <input
            type="text"
            value={data.endpoint || ""}
            onChange={(e) => onChange({ ...data, endpoint: e.target.value })}
            className="flex-1 bg-transparent font-mono text-sm focus:outline-none"
            placeholder="https://api.primexmeta.com/v1/..."
          />
        )}
      </div>

      {/* Description */}
      {(data.description || !readOnly) && (
        <div className="text-muted-foreground border-b px-4 py-2 text-sm">
          {readOnly ? (
            data.description
          ) : (
            <input
              type="text"
              value={data.description || ""}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              className="w-full bg-transparent focus:outline-none"
              placeholder="Description..."
            />
          )}
        </div>
      )}

      {/* Headers Section */}
      <div className="border-b px-4 py-2">
        <div className="text-muted-foreground mb-2 text-xs font-semibold">Headers</div>
        <div className="space-y-2">
          {data.headers &&
            Object.entries(data.headers).map(([key, value], index) => (
              <div key={index} className="flex gap-2">
                {readOnly ? (
                  <div className="flex gap-2 font-mono text-sm">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{value}</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => updateHeaderKey(key, e.target.value)}
                      placeholder="Key"
                      className="flex-1 rounded border bg-transparent px-2 py-1 font-mono text-xs"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateHeaderValue(key, e.target.value)}
                      placeholder="Value"
                      className="flex-1 rounded border bg-transparent px-2 py-1 font-mono text-xs"
                    />
                    <button
                      onClick={() => removeHeader(key)}
                      className="hover:text-destructive p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          {!readOnly && (
            <button
              onClick={addHeader}
              className="text-primary flex items-center gap-1 text-xs hover:underline"
            >
              <Plus className="h-3 w-3" /> Add Header
            </button>
          )}
        </div>
      </div>

      {/* Body Section */}
      <div className="px-4 py-2">
        <div className="text-muted-foreground mb-2 text-xs font-semibold">Body (JSON)</div>
        {readOnly ? (
          <pre className="bg-muted/50 overflow-auto rounded p-2 font-mono text-xs">
            {JSON.stringify(data.body, null, 2)}
          </pre>
        ) : (
          <textarea
            value={bodyJson}
            onChange={(e) => handleBodyChange(e.target.value)}
            className="bg-muted/50 h-32 w-full resize-none rounded p-2 font-mono text-xs focus:outline-none"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

function ApiResponseBlockView({ data }: { data: ApiResponseBlockData }) {
  return (
    <ApiResponse
      status={data.status}
      data={data.data}
      description={data.description}
      latency={data.latency}
    />
  );
}

function ApiResponseBlockEdit({
  data,
  onChange,
}: {
  data: ApiResponseBlockData;
  onChange: (data: unknown) => void;
}) {
  const [jsonString, setJsonString] = React.useState(JSON.stringify(data.data, null, 2));
  const [statusValue, setStatusValue] = React.useState(String(data.status));
  const [descriptionValue, setDescriptionValue] = React.useState(data.description || "");
  const [latencyValue, setLatencyValue] = React.useState(String(data.latency || ""));

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonString(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      onChange({
        ...data,
        data: parsed,
      });
    } catch {
      // Invalid JSON, don't update
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = parseInt(e.target.value);
    setStatusValue(e.target.value);
    onChange({
      ...data,
      status: newStatus,
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionValue(e.target.value);
    onChange({
      ...data,
      description: e.target.value,
    });
  };

  const handleLatencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLatency = e.target.value ? parseInt(e.target.value) : undefined;
    setLatencyValue(e.target.value);
    onChange({
      ...data,
      latency: newLatency,
    });
  };

  return (
    <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
      {/* Status and Metadata */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-muted-foreground text-xs font-semibold">Status</label>
          <input
            type="number"
            value={statusValue}
            onChange={handleStatusChange}
            className="bg-card mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-muted-foreground text-xs font-semibold">Latency (ms)</label>
          <input
            type="number"
            value={latencyValue}
            onChange={handleLatencyChange}
            placeholder="0"
            className="bg-card mt-1 w-full rounded border px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-muted-foreground text-xs font-semibold">Description</label>
        <input
          type="text"
          value={descriptionValue}
          onChange={handleDescriptionChange}
          placeholder="Optional description"
          className="bg-card mt-1 w-full rounded border px-2 py-1 text-sm"
        />
      </div>

      {/* JSON Response */}
      <div>
        <label className="text-muted-foreground text-xs font-semibold">Response Data (JSON)</label>
        <textarea
          value={jsonString}
          onChange={handleJsonChange}
          className="bg-card mt-1 w-full rounded border p-2 font-mono text-xs"
          rows={8}
          spellCheck="false"
        />
      </div>
    </div>
  );
}

function TableBlock({
  data,
  onChange,
  readOnly,
}: {
  data: TableBlockData;
  isSelected: boolean;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
}) {
  const addColumn = () => {
    const newHeaders = [...(data.headers || []), "New Header"];
    const newRows = (data.rows || []).map((row) => [...row, ""]);
    // If there are no rows, add one empty row so the column is visible
    if (newRows.length === 0) {
      newRows.push([""]);
    }
    onChange({ ...data, headers: newHeaders, rows: newRows });
  };

  const removeColumn = (index: number) => {
    if ((data.headers || []).length <= 1) return;
    const newHeaders = data.headers.filter((_, i) => i !== index);
    const newRows = data.rows.map((row) => row.filter((_, i) => i !== index));
    onChange({ ...data, headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const colCount = (data.headers || []).length || 1;
    const newRow = new Array(colCount).fill("");
    onChange({ ...data, rows: [...(data.rows || []), newRow] });
  };

  const removeRow = (index: number) => {
    const newRows = data.rows.filter((_, i) => i !== index);
    onChange({ ...data, rows: newRows });
  };

  return (
    <div className="overflow-x-auto p-3">
      {!readOnly && (
        <div className="mb-2 flex gap-2">
          <button
            onClick={addColumn}
            className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
          >
            <Plus className="h-3 w-3" /> Add Column
          </button>
          <button
            onClick={addRow}
            className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
          >
            <Plus className="h-3 w-3" /> Add Row
          </button>
        </div>
      )}
      <table className="w-full min-w-[300px] border-collapse text-sm">
        <thead>
          <tr>
            {(data.headers || []).map((header, i) => (
              <th
                key={i}
                className="bg-muted/50 group relative min-w-[120px] border-b px-4 py-2 text-left"
              >
                {readOnly ? (
                  header
                ) : (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={header || ""}
                      onChange={(e) => {
                        const newHeaders = [...data.headers];
                        newHeaders[i] = e.target.value;
                        onChange({ ...data, headers: newHeaders });
                      }}
                      className="w-full bg-transparent font-semibold focus:outline-none"
                      placeholder="Header"
                    />
                    <button
                      onClick={() => removeColumn(i)}
                      className="text-muted-foreground hover:text-destructive absolute top-1/2 right-1 -translate-y-1/2 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      title="Remove column"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </th>
            ))}
            {!readOnly && <th className="w-8 border-b"></th>}
          </tr>
        </thead>
        <tbody>
          {(data.rows || []).map((row, rowIndex) => (
            <tr key={rowIndex} className="group/row hover:bg-muted/20">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border-b px-4 py-2">
                  {readOnly ? (
                    cell
                  ) : (
                    <input
                      type="text"
                      value={cell || ""}
                      onChange={(e) => {
                        const newRows = data.rows.map((r, ri) =>
                          ri === rowIndex
                            ? r.map((c, ci) => (ci === cellIndex ? e.target.value : c))
                            : r
                        );
                        onChange({ ...data, rows: newRows });
                      }}
                      className="w-full bg-transparent focus:outline-none"
                      placeholder="..."
                    />
                  )}
                </td>
              ))}
              {!readOnly && (
                <td className="w-8 border-b px-2 py-2 text-center">
                  <button
                    onClick={() => removeRow(rowIndex)}
                    className="text-muted-foreground hover:text-destructive p-1 opacity-0 transition-opacity group-hover/row:opacity-100"
                    title="Remove row"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {(!data.rows || data.rows.length === 0) && (
        <div className="text-muted-foreground py-4 text-center text-xs italic">
          No rows yet. Click "Add Row" to start.
        </div>
      )}
    </div>
  );
}

function ListBlock({
  data,
  onChange,
  readOnly,
}: {
  data: ListBlockData;
  isSelected: boolean;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
}) {
  const addItem = () => {
    onChange({ ...data, items: [...data.items, ""] });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...data.items];
    newItems[index] = value;
    onChange({ ...data, items: newItems });
  };

  const ListTag = data.ordered ? "ol" : "ul";

  const listStyles = [
    { value: "disc", label: "Disc" },
    { value: "circle", label: "Circle" },
    { value: "square", label: "Square" },
    { value: "decimal", label: "Decimal" },
    { value: "lower-alpha", label: "Lower Alpha" },
    { value: "upper-alpha", label: "Upper Alpha" },
    { value: "lower-roman", label: "Lower Roman" },
    { value: "upper-roman", label: "Upper Roman" },
  ];

  return (
    <div className="p-3">
      {!readOnly && (
        <div className="border-border/50 mb-4 flex items-center gap-4 border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-semibold whitespace-nowrap uppercase">
              Type:
            </span>
            <select
              value={data.ordered ? "ordered" : "unordered"}
              onChange={(e) =>
                onChange({
                  ...data,
                  ordered: e.target.value === "ordered",
                  style: e.target.value === "ordered" ? "decimal" : "disc",
                })
              }
              className="hover:text-primary cursor-pointer bg-transparent text-xs font-medium transition-colors focus:outline-none"
            >
              <option value="unordered" className="bg-background">
                Unordered
              </option>
              <option value="ordered" className="bg-background">
                Ordered
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-semibold whitespace-nowrap uppercase">
              Style:
            </span>
            <select
              value={data.style || (data.ordered ? "decimal" : "disc")}
              onChange={(e) => onChange({ ...data, style: e.target.value })}
              className="hover:text-primary cursor-pointer bg-transparent text-xs font-medium transition-colors focus:outline-none"
            >
              {listStyles.map((s) => (
                <option key={s.value} value={s.value} className="bg-background">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <ListTag
        className={cn("space-y-1.5 pl-6", data.ordered ? "list-decimal" : "list-disc")}
        style={{ listStyleType: data.style || (data.ordered ? "decimal" : "disc") }}
      >
        {data.items.map((item, index) => (
          <li key={index} className="group/item relative pr-8">
            <div className="flex items-start gap-2">
              {readOnly ? (
                <span className="block py-1 text-sm">{item}</span>
              ) : (
                <>
                  <input
                    type="text"
                    value={item || ""}
                    onChange={(e) => updateItem(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                    className="placeholder:text-muted-foreground/50 w-full bg-transparent py-1 text-sm focus:outline-none"
                    placeholder="List item..."
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 absolute top-1/2 right-0 -translate-y-1/2 rounded-md p-1.5 opacity-0 transition-all group-hover/item:opacity-100"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ListTag>

      {!readOnly && (
        <button
          onClick={addItem}
          className="text-primary/80 hover:text-primary hover:bg-primary/5 mt-3 flex w-fit items-center gap-1.5 rounded px-1 py-1 text-xs font-semibold transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Item</span>
        </button>
      )}
    </div>
  );
}

function RateLimitBlock({
  data,
  onChange,
  readOnly,
}: {
  data: RateLimitBlockData;
  isSelected: boolean;
  onChange: (data: unknown) => void;
  readOnly?: boolean;
}) {
  const addLimit = () => {
    onChange({
      ...data,
      limits: [...data.limits, { tier: "New Tier", requestsPerSecond: 10, requestsPerDay: 1000 }],
    });
  };

  const removeLimit = (index: number) => {
    const newLimits = data.limits.filter((_, i) => i !== index);
    onChange({ ...data, limits: newLimits });
  };

  const updateLimit = (
    index: number,
    field: keyof RateLimitBlockData["limits"][0],
    value: string | number | undefined
  ) => {
    const newLimits = [...data.limits];
    newLimits[index] = { ...newLimits[index], [field]: value };
    onChange({ ...data, limits: newLimits });
  };

  return (
    <div className="overflow-x-auto rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Rate Limits</h4>
        {!readOnly && (
          <button
            onClick={addLimit}
            className="text-primary flex items-center gap-1 text-xs hover:underline"
          >
            <Plus className="h-3 w-3" /> Add Tier
          </button>
        )}
      </div>

      <table className="w-full text-left text-sm">
        <thead className="text-muted-foreground bg-muted/50 text-xs uppercase">
          <tr>
            <th className="px-4 py-2">Tier</th>
            <th className="px-4 py-2">Req/Sec</th>
            <th className="px-4 py-2">Req/Day</th>
            <th className="px-4 py-2">Burst</th>
            {!readOnly && <th className="w-8 px-4 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {data.limits.map((limit, index) => (
            <tr key={index} className="hover:bg-muted/50 border-b last:border-0">
              <td className="px-4 py-2">
                {readOnly ? (
                  limit.tier
                ) : (
                  <input
                    type="text"
                    value={limit.tier || ""}
                    onChange={(e) => updateLimit(index, "tier", e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                  />
                )}
              </td>
              <td className="px-4 py-2">
                {readOnly ? (
                  limit.requestsPerSecond
                ) : (
                  <input
                    type="number"
                    value={limit.requestsPerSecond}
                    onChange={(e) =>
                      updateLimit(index, "requestsPerSecond", parseInt(e.target.value))
                    }
                    className="w-full bg-transparent focus:outline-none"
                  />
                )}
              </td>
              <td className="px-4 py-2">
                {readOnly ? (
                  limit.requestsPerDay
                ) : (
                  <input
                    type="number"
                    value={limit.requestsPerDay}
                    onChange={(e) => updateLimit(index, "requestsPerDay", parseInt(e.target.value))}
                    className="w-full bg-transparent focus:outline-none"
                  />
                )}
              </td>
              <td className="px-4 py-2">
                {readOnly ? (
                  limit.burstLimit || "-"
                ) : (
                  <input
                    type="number"
                    value={limit.burstLimit || ""}
                    placeholder="-"
                    onChange={(e) =>
                      updateLimit(
                        index,
                        "burstLimit",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-full bg-transparent focus:outline-none"
                  />
                )}
              </td>
              {!readOnly && (
                <td className="px-4 py-2">
                  <button
                    onClick={() => removeLimit(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {(data.notes || !readOnly) && (
        <div className="mt-4 border-t pt-4">
          {readOnly ? (
            <p className="text-muted-foreground text-sm">{data.notes}</p>
          ) : (
            <input
              type="text"
              value={data.notes || ""}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Add notes..."
            />
          )}
        </div>
      )}
    </div>
  );
}
