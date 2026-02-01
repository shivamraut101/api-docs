import type {
  ApiRequestBlockData,
  ApiResponseBlockData,
  CalloutBlockData,
  CodeBlockData,
  EditorBlock,
  EditorDocument,
  HeadingBlockData,
  ListBlockData,
  ParagraphBlockData,
  RateLimitBlockData,
  StepsBlockData,
  TableBlockData,
} from "./editor-types";

/**
 * Generate MDX content from editor blocks
 * This is the core function that transforms visual blocks into valid MDX
 */
export function generateMdxFromBlocks(doc: EditorDocument): string {
  const lines: string[] = [];

  // Generate frontmatter
  lines.push("---");
  lines.push(`title: ${doc.metadata.title}`);
  lines.push(`description: ${doc.metadata.description}`);
  lines.push(`category: ${doc.metadata.category}`);
  lines.push(`order: ${doc.metadata.order}`);
  lines.push(`status: ${doc.metadata.apiStatus}`);
  lines.push(`version: ${doc.metadata.version}`);
  lines.push("published: true");
  lines.push("---");
  lines.push("");

  // Generate block content
  for (const block of doc.blocks) {
    const mdx = blockToMdx(block);
    lines.push(mdx);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Convert a single block to MDX
 */
function blockToMdx(block: EditorBlock): string {
  switch (block.type) {
    case "heading":
      return headingToMdx(block.data as unknown as HeadingBlockData);
    case "paragraph":
      return paragraphToMdx(block.data as unknown as ParagraphBlockData);
    case "code":
      return codeToMdx(block.data as unknown as CodeBlockData);
    case "callout":
      return calloutToMdx(block.data as unknown as CalloutBlockData);
    case "steps":
      return stepsToMdx(block.data as unknown as StepsBlockData);
    case "api-request":
      return apiRequestToMdx(block.data as unknown as ApiRequestBlockData);
    case "api-response":
      return apiResponseToMdx(block.data as unknown as ApiResponseBlockData);
    case "table":
      return tableToMdx(block.data as unknown as TableBlockData);
    case "list":
      return listToMdx(block.data as unknown as ListBlockData);
    case "divider":
      return "---";
    case "rate-limit":
      return rateLimitToMdx(block.data as unknown as RateLimitBlockData);

    default:
      return "";
  }
}

function headingToMdx(data: HeadingBlockData): string {
  const prefix = "#".repeat(data.level);
  return `${prefix} ${data.text}`;
}

function escapeMdx(text: string): string {
  return (
    text
      .replace(/[{}]/g, (c) => (c === "{" ? "&#123;" : "&#125;"))
      .replace(/</g, "&lt;")
      // Escape Markdown structural triggers at the start of the line to prevent
      // Paragraph blocks from turning into Headers, Lists, or Blockquotes unintentionally.
      .replace(/^(#{1,6} )/gm, "\\$1") // Headers
      .replace(/^([-*+] )/gm, "\\$1") // Lists
      .replace(/^(\d+\. )/gm, "\\$1") // Ordered Lists
      .replace(/^(> )/gm, "\\$1")
  ); // Blockquotes
}

function paragraphToMdx(data: ParagraphBlockData): string {
  return escapeMdx(data.text);
}

function codeToMdx(data: CodeBlockData): string {
  const lines: string[] = [];
  const meta = data.filename ? ` filename={${JSON.stringify(data.filename)}}` : "";
  lines.push(`\`\`\`${data.language}${meta}`);
  lines.push(data.code);
  lines.push("```");
  return lines.join("\n");
}

function calloutToMdx(data: CalloutBlockData): string {
  const title = data.title ? ` title={${JSON.stringify(data.title)}}` : "";
  // Content inside callout likely needs to be processed or escaped if it's just strings
  // But usually content comes from blocks?
  // Wait, existing logic inserted raw content.
  // If callout content contains blocks, we can't escape it all.
  // But callout data structure in this editor seems to be simple string content?
  // Looking at parseMdxToBlocks, it captures everything inside Callout.
  // If we escape it, we might break inner markdown elements like **bold**.
  // However, for now, let's assume Callout content is Markdown and leave it,
  // BUT the crash is likely in top-level paragraphs.
  return `<Callout type="${data.type}"${title}>
  ${data.content}
</Callout>`;
}

function stepsToMdx(data: StepsBlockData): string {
  const steps = data.steps
    .map(
      (step) => `  <Step title={${JSON.stringify(step.title)}}>
    ${step.content}
  </Step>`
    )
    .join("\n");
  return `<Steps>
${steps}
</Steps>`;
}

function apiRequestToMdx(data: ApiRequestBlockData): string {
  const props: string[] = [];
  props.push(`method={${JSON.stringify(data.method)}}`);
  props.push(`endpoint={${JSON.stringify(data.endpoint)}}`);

  if (data.description) {
    props.push(`description={${JSON.stringify(data.description)}}`);
  }

  if (data.headers && Object.keys(data.headers).length > 0) {
    props.push(`headers={${JSON.stringify(data.headers)}}`);
  }

  if (data.body && Object.keys(data.body).length > 0) {
    props.push(`body={${JSON.stringify(data.body, null, 2)}}`);
  }

  return `<ApiRequest
  ${props.join("\n  ")}
/>`;
}

function apiResponseToMdx(data: ApiResponseBlockData): string {
  const props: string[] = [];
  props.push(`status={${data.status}}`);

  if (data.latency) {
    props.push(`latency={${data.latency}}`);
  }

  props.push(`data={${JSON.stringify(data.data, null, 2)}}`);

  return `<ApiResponse
  ${props.join("\n  ")}
/>`;
}

function tableToMdx(data: TableBlockData): string {
  const lines: string[] = [];

  // Header row
  lines.push(`| ${data.headers.join(" | ")} |`);
  lines.push(`| ${data.headers.map(() => "---").join(" | ")} |`);

  // Data rows
  for (const row of data.rows) {
    lines.push(`| ${row.join(" | ")} |`);
  }

  return lines.join("\n");
}

function listToMdx(data: ListBlockData): string {
  return data.items
    .map((item, i) => (data.ordered ? `${i + 1}. ${escapeMdx(item)}` : `- ${escapeMdx(item)}`))
    .join("\n");
}

function rateLimitToMdx(data: RateLimitBlockData): string {
  const limits = JSON.stringify(data.limits, null, 2);
  const notes = data.notes ? `\n  notes={${JSON.stringify(data.notes)}}` : "";
  return `<RateLimitInfo
  limits={${limits}}${notes}
/>`;
}

/**
 * Parse MDX content back to editor blocks
 * This is used when loading existing MDX files into the editor
 */
export function parseMdxToBlocks(mdx: string): {
  metadata: Partial<EditorDocument["metadata"]>;
  blocks: EditorBlock[];
} {
  const blocks: EditorBlock[] = [];
  const metadata: Partial<EditorDocument["metadata"]> = {};

  // Split into frontmatter and content
  const frontmatterMatch = mdx.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const lines = frontmatter.split("\n");
    for (const line of lines) {
      const [key, ...valueParts] = line.split(": ");
      const value = valueParts.join(": ").trim();
      switch (key.trim()) {
        case "title":
          metadata.title = value;
          break;
        case "description":
          metadata.description = value;
          break;
        case "category":
          metadata.category = value;
          break;
        case "order":
          metadata.order = parseInt(value);
          break;
        case "status":
          metadata.apiStatus = value as "stable" | "beta" | "deprecated";
          break;
        case "version":
          metadata.version = value;
          break;
      }
    }
  }

  // Parse content into blocks (simplified parsing)
  const content = mdx.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  const sections = content.split(/\n\n+/);

  let blockId = 0;
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Detect block type
    if (trimmed.startsWith("#")) {
      const match = trimmed.match(/^(#+)\s+(.+)$/);
      if (match) {
        blocks.push({
          id: `block_${blockId++}`,
          type: "heading",
          data: {
            level: match[1].length as 1 | 2 | 3 | 4,
            text: match[2],
          },
        });
      }
    } else if (trimmed.startsWith("```")) {
      const match = trimmed.match(/^```(\w*)\n([\s\S]*?)```$/);
      if (match) {
        blocks.push({
          id: `block_${blockId++}`,
          type: "code",
          data: {
            language: match[1] || "text",
            code: match[2].trim(),
          },
        });
      }
    } else if (trimmed.startsWith("<Callout")) {
      // Parse Callout component
      const typeMatch = trimmed.match(/type="(\w+)"/);
      const titleMatch = trimmed.match(/title="([^"]+)"/);
      const contentMatch = trimmed.match(/<Callout[^>]*>\s*([\s\S]*?)\s*<\/Callout>/);
      blocks.push({
        id: `block_${blockId++}`,
        type: "callout",
        data: {
          type: typeMatch?.[1] || "info",
          title: titleMatch?.[1] || "",
          content: contentMatch?.[1] || "",
        },
      });
    } else if (trimmed.startsWith("<ApiRequest")) {
      // Parse ApiRequest component
      blocks.push({
        id: `block_${blockId++}`,
        type: "api-request",
        data: parseApiRequestProps(trimmed) as unknown as Record<string, unknown>,
      });
    } else if (trimmed.startsWith("<ApiResponse")) {
      blocks.push({
        id: `block_${blockId++}`,
        type: "api-response",
        data: parseApiResponseProps(trimmed) as unknown as Record<string, unknown>,
      });
    } else if (trimmed.startsWith("|")) {
      // Parse table
      const rows = trimmed.split("\n").filter((r) => r.trim() && !r.includes("---"));
      const headers =
        rows[0]
          ?.split("|")
          .filter((c) => c.trim())
          .map((c) => c.trim()) || [];
      const dataRows = rows.slice(1).map((r) =>
        r
          .split("|")
          .filter((c) => c.trim())
          .map((c) => c.trim())
      );
      blocks.push({
        id: `block_${blockId++}`,
        type: "table",
        data: { headers, rows: dataRows },
      });
    } else if (trimmed.startsWith("-") || /^\d+\./.test(trimmed)) {
      // Parse list
      const items = trimmed.split("\n").map((l) => l.replace(/^[-\d.]+\s*/, "").trim());
      blocks.push({
        id: `block_${blockId++}`,
        type: "list",
        data: {
          ordered: /^\d+\./.test(trimmed),
          items,
        },
      });
    } else {
      // Default to paragraph
      blocks.push({
        id: `block_${blockId++}`,
        type: "paragraph",
        data: { text: trimmed },
      });
    }
  }

  return { metadata, blocks };
}

function parseApiRequestProps(content: string): ApiRequestBlockData {
  const methodMatch = content.match(/method="(\w+)"/);
  const endpointMatch = content.match(/endpoint="([^"]+)"/);
  const descMatch = content.match(/description="([^"]+)"/);

  return {
    method: (methodMatch?.[1] || "GET") as ApiRequestBlockData["method"],
    endpoint: endpointMatch?.[1] || "",
    description: descMatch?.[1],
  };
}

function parseApiResponseProps(content: string): ApiResponseBlockData {
  const statusMatch = content.match(/status=\{(\d+)\}/);
  const latencyMatch = content.match(/latency=\{(\d+)\}/);

  return {
    status: parseInt(statusMatch?.[1] || "200"),
    latency: latencyMatch ? parseInt(latencyMatch[1]) : undefined,
    data: {},
  };
}
