import { mdxComponents } from "@/components/docs/mdx-components";
import { TableOfContents } from "@/components/docs/TableOfContents";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateMdxFromBlocks } from "@/lib/mdx-generator";
import dbConnect from "@/lib/mongodb";
import { sanitizeDoc } from "@/lib/utils";
import Document from "@/models/Document";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { cache } from "react";
import remarkGfm from "remark-gfm";

export const dynamic = "force-dynamic";

interface DocPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Type for the unified Doc object we'll use in the UI
interface UnifiedDoc {
  title: string;
  description: string;
  body: {
    raw: string;
  };
  headings: Array<{
    level: number;
    text: string;
    slug: string;
  }>;
  status?: "stable" | "beta" | "deprecated";
  version?: string;
}

const getDocFromDatabase = cache(async (id: string): Promise<UnifiedDoc | null> => {
  try {
    await dbConnect();

    // Query MongoDB by metadata.id
    const doc = await Document.findOne({
      "metadata.id": id,
      "metadata.status": { $in: ["published", "deprecated"] },
    });

    if (!doc) return null;

    // Force regeneration to ensure latest generator fixes are applied (ignoring corrupted cache)
    const mdxContent = generateMdxFromBlocks(sanitizeDoc(doc));

    // Generate simple headings from blocks (only h1-h4) - simplified for now
    const headings: UnifiedDoc["headings"] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.blocks.forEach((block: any) => {
      if (block.type === "heading") {
        const text = block.data.text;
        const slug = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        headings.push({
          level: block.data.level,
          text: block.data.text,
          slug,
        });
      }
    });

    return {
      title: doc.metadata.title,
      description: doc.metadata.description,
      body: {
        raw: mdxContent.replace(/^---\n[\s\S]*?\n---\n/, ""), // Strip frontmatter
      },
      headings,
      status: doc.metadata.apiStatus as UnifiedDoc["status"],
      version: doc.metadata.version,
    };
  } catch (error) {
    console.error("Error fetching from database:", error);
    return null;
  }
});

async function getDocFromParams(params: { id: string }) {
  return getDocFromDatabase(params.id);
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const doc = await getDocFromParams(resolvedParams);

  if (!doc) {
    return {
      title: "Document Not Found",
    };
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
    },
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const resolvedParams = await params;
  const doc = await getDocFromParams(resolvedParams);

  if (!doc) {
    notFound();
  }

  // Handle status badge
  const statusVariant = doc.status;

  return (
    <div className="flex items-start gap-10">
      {/* Main Content */}
      <article className="max-w-3xl min-w-0 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            {statusVariant && (
              <Badge variant={statusVariant}>
                {statusVariant.charAt(0).toUpperCase() + statusVariant.slice(1)}
              </Badge>
            )}
            {doc.version && <Badge variant="outline">{doc.version}</Badge>}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{doc.title}</h1>
          <p className="text-muted-foreground mt-3 text-lg">{doc.description}</p>
        </div>

        <Separator className="mb-8" />

        {/* MDX Content */}
        <div className="mdx">
          <MDXRemote
            source={doc.body.raw}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>
      </article>

      {/* Table of Contents */}
      <TableOfContents headings={doc.headings} />
    </div>
  );
}
