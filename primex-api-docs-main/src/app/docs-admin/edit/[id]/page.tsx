"use client";

import {
  generatePreview,
  getDocument,
  getEditorSession,
  publishDocument,
  submitForReview,
  updateDocument,
  updateDocumentMetadata,
} from "@/app/actions/editor.actions";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { MetadataPanel } from "@/components/editor/MetadataPanel";
import { ValidationPanel } from "@/components/editor/ValidationPanel";
import { VisualEditor } from "@/components/editor/VisualEditor";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { DocMetadata, EditorBlock, EditorDocument, EditorSession } from "@/lib/editor-types";
import { parseMdxToBlocks } from "@/lib/mdx-generator";
import { AlertCircle, Check, Code, FileText, Loader2, Settings } from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

export default function EditDocumentPage() {
  const params = useParams();
  const docId = params.id as string;

  const [session, setSession] = React.useState<EditorSession | null>(null);
  const [document, setDocument] = React.useState<EditorDocument | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [mdxPreview, setMdxPreview] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState("editor");
  const [error, setError] = React.useState<string | null>(null);

  // Load document
  React.useEffect(() => {
    async function load() {
      try {
        const sessionResult = await getEditorSession();
        if (sessionResult.success && sessionResult.data) {
          setSession(sessionResult.data);
        } else {
          setError(sessionResult.error || "Failed to load session");
        }

        const docResult = await getDocument(docId);
        if (docResult.success && docResult.data) {
          setDocument(docResult.data);
        } else {
          setError(docResult.error || "Document not found");
        }
      } catch (err) {
        setError("An unexpected error occurred while loading the document");
        console.error(err);
      }
    }
    load();
  }, [docId]);

  // Save document implementation
  const performSave = React.useCallback(
    async (docToSave: EditorDocument) => {
      if (!session) return;
      setIsSaving(true);
      try {
        const result = await updateDocument(session, docId, docToSave.blocks);
        if (result.success) {
          setHasChanges(false);
        } else {
          // Notify user of save failure (e.g. invalid MDX) so they know why it's not saving
          toast.error(result.error || "Auto-save failed to valid content");
        }
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [session, docId]
  );

  // Auto-save effect
  React.useEffect(() => {
    if (!hasChanges || isSaving || !document || !session) return;

    const timer = setTimeout(() => {
      performSave(document);
    }, 2000);

    return () => clearTimeout(timer);
  }, [document, hasChanges, isSaving, session, performSave]);

  // Handle block changes
  const handleBlocksChange = React.useCallback(
    (blocks: EditorBlock[]) => {
      if (!document) return;
      setDocument({ ...document, blocks });
      setHasChanges(true);
    },
    [document]
  );

  // Handle metadata changes
  const handleMetadataChange = React.useCallback(
    async (metadata: Partial<DocMetadata>) => {
      if (!document || !session) return;

      const result = await updateDocumentMetadata(session, docId, metadata);
      if (result.success && result.data) {
        // Preserves local blocks (which may have unsaved changes) instead of overwriting with DB blocks
        setDocument({
          ...result.data,
          blocks: document.blocks,
        });
        toast.success("Metadata updated");
      } else {
        toast.error(`Error: ${result.error}`);
      }
    },
    [document, session, docId]
  );

  // Save document (manual)
  const handleSave = React.useCallback(() => {
    if (document) {
      toast.promise(performSave(document), {
        loading: "Saving document...",
        success: "Document saved",
        error: "Failed to save document",
      });
    }
  }, [document, performSave]);

  // Submit for review
  const handleSubmitReview = React.useCallback(async () => {
    if (!session) return;

    const result = await submitForReview(session, docId);
    if (result.success && result.data) {
      setDocument(result.data);
      toast.success("Document submitted for review!");
    } else {
      toast.error(`Error: ${result.error}`);
    }
  }, [session, docId]);

  // Publish
  const handlePublish = React.useCallback(async () => {
    if (!session) return;

    const result = await publishDocument(session, docId);
    if (result.success && result.data) {
      toast.success(`Published! MDX saved to: ${result.data.filePath}`);
      // Update local state to enable "Set Default" immediately
      if (document) {
        setDocument({
          ...document,
          metadata: { ...document.metadata, status: "published" },
        });
      }
    } else {
      toast.error(`Error: ${result.error}`);
    }
  }, [session, docId, document]);

  // Generate preview
  const handlePreview = React.useCallback(async () => {
    const result = await generatePreview(docId);
    if (result.success && result.data) {
      setMdxPreview(result.data);
      setActiveTab("mdx");
    }
  }, [docId]);

  // Handle MDX content change
  const handleMdxChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setMdxPreview(newVal);
    setHasChanges(true);

    // Debounced attempt to sync MDX back to blocks (so auto-save has latest data)
    try {
      const { metadata: newMetadata, blocks: newBlocks } = parseMdxToBlocks(newVal);
      if (document) {
        setDocument({
          ...document,
          metadata: { ...document.metadata, ...newMetadata },
          blocks: newBlocks,
        });
      }
    } catch {
      // Silently fail during typing, only hard sync (button) shows errors
    }
  };

  // Sync MDX back to blocks
  const handleSyncFromMdx = React.useCallback(() => {
    if (!mdxPreview) return;
    try {
      const { metadata: newMetadata, blocks: newBlocks } = parseMdxToBlocks(mdxPreview);

      if (document) {
        setDocument({
          ...document,
          metadata: { ...document.metadata, ...newMetadata },
          blocks: newBlocks,
        });
        setHasChanges(true);
        setActiveTab("editor");
        toast.success("MDX synced to blocks successfully!");
      }
    } catch (err) {
      console.error("Failed to sync MDX:", err);
      toast.error("Failed to parse MDX. Please check the format.");
    }
  }, [mdxPreview, document]);

  if (error) {
    return (
      <div className="bg-background flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="bg-destructive/10 mb-4 rounded-full p-4">
          <AlertCircle className="text-destructive h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Error</h2>
        <p className="text-muted-foreground mt-2 max-w-md">{error}</p>
        <Button variant="outline" className="mt-8" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!session || !document) {
    return (
      <div className="bg-background flex h-full flex-col items-center justify-center">
        <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Loading document...</p>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full flex-col">
      {/* Header */}
      <EditorHeader
        session={session}
        documentTitle={document.metadata.title}
        hasChanges={hasChanges}
        isSaving={isSaving}
        isPublished={document.metadata.status === "published"}
        onSave={handleSave}
        onSubmitReview={document.metadata.status === "draft" ? handleSubmitReview : undefined}
        onPublish={
          session.permissions.canPublish &&
          (document.metadata.status === "in_review" || document.metadata.status === "published")
            ? handlePublish
            : undefined
        }
      />

      {/* Main Editor Area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="flex min-h-0 flex-1 flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="bg-muted/30 border-b px-4">
              <TabsList className="h-10 gap-1 bg-transparent">
                <TabsTrigger
                  value="editor"
                  className="data-[state=active]:bg-background gap-2 data-[state=active]:shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  Visual Editor
                </TabsTrigger>
                <TabsTrigger
                  value="mdx"
                  className="data-[state=active]:bg-background gap-2 data-[state=active]:shadow-sm"
                  onClick={handlePreview}
                >
                  <Code className="h-4 w-4" />
                  MDX Editor
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="editor"
              className="m-0 min-h-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <VisualEditor
                blocks={document.blocks}
                onChange={handleBlocksChange}
                readOnly={
                  document.metadata.status === "published" && !session.permissions.canPublish
                }
              />
            </TabsContent>

            <TabsContent
              value="mdx"
              className="m-0 min-h-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <div className="bg-muted/20 flex items-center justify-between border-b px-4 py-2">
                <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  Raw MDX Editor
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSyncFromMdx}
                  className="h-7 gap-2 text-xs"
                >
                  <Check className="h-3 w-3" />
                  Sync to Blocks
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
                <Textarea
                  value={mdxPreview}
                  onChange={handleMdxChange}
                  className="h-full w-full resize-none rounded-none border-none bg-transparent p-6 font-mono text-sm shadow-none ring-0 outline-none focus:ring-0 focus-visible:ring-0"
                  placeholder="Paste or write MDX here..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Metadata & Validation */}
        <aside className="bg-card z-10 w-80 border-l shadow-sm">
          <ScrollArea className="h-full">
            <Tabs defaultValue="metadata" className="flex h-full flex-col">
              <div className="bg-muted/10 border-b px-4 py-3">
                <TabsList className="grid h-9 w-full grid-cols-2">
                  <TabsTrigger value="metadata" className="gap-2 text-xs">
                    <Settings className="h-3.5 w-3.5" />
                    Metadata
                  </TabsTrigger>
                  <TabsTrigger value="validation" className="gap-2 text-xs">
                    <Check className="h-3.5 w-3.5" />
                    Validate
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="min-h-0 flex-1">
                <TabsContent value="metadata" className="mt-0">
                  <MetadataPanel
                    metadata={document.metadata}
                    session={session}
                    onChange={handleMetadataChange}
                    readOnly={
                      document.metadata.status === "published" && !session.permissions.canPublish
                    }
                  />
                </TabsContent>

                <TabsContent value="validation" className="mt-0">
                  <div className="p-4">
                    <ValidationPanel document={document} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
