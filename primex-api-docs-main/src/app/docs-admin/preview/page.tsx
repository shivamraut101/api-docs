"use client";

import { getDocument } from "@/app/actions/editor.actions";
import { BlockRenderer } from "@/components/editor/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { EditorDocument } from "@/lib/editor-types";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";

function PreviewContent() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("id");

  const [document, setDocument] = React.useState<EditorDocument | null>(null);
  const [loading, setLoading] = React.useState(!!docId);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!docId) return;

    async function load() {
      try {
        const result = await getDocument(docId!);
        if (result.success && result.data) {
          setDocument(result.data);
        } else {
          setError(result.error || "Document not found");
        }
      } catch {
        setError("An unexpected error occurred while loading the preview");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [docId]);

  if (!docId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold">No Document Selected</h1>
        <p className="text-muted-foreground mt-2">
          Please select a document from the editor to preview it.
        </p>
        <Button asChild className="mt-6">
          <Link href="/docs-admin">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="text-destructive mb-4 h-12 w-12" />
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-muted-foreground mt-2">{error || "Document not found"}</p>
        <Button asChild className="mt-6">
          <Link href="/docs-admin">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="bg-background/80 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-8 py-3 lg:ml-16">
          <Link
            href={`/docs-admin/edit/${docId}`}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-600">
              Preview Mode
            </Badge>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl p-8 lg:ml-16">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {document.metadata.status.replace("_", " ")}
              </Badge>
              <Badge variant="outline">{document.metadata.apiStatus}</Badge>
              <Badge variant="outline">{document.metadata.version}</Badge>
              <Badge variant="secondary">{document.metadata.category}</Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{document.metadata.title}</h1>
            <p className="text-muted-foreground mt-3 text-lg">{document.metadata.description}</p>
          </div>

          <Separator className="mb-8" />

          {/* Content */}
          <div className="space-y-4">
            {document.blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                isSelected={false}
                onChange={() => {}}
                readOnly={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentPreviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      }
    >
      <PreviewContent />
    </React.Suspense>
  );
}
