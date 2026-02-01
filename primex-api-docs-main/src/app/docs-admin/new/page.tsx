"use client";

import { createDocument, getEditorSession } from "@/app/actions/editor.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DocMetadata } from "@/lib/editor-types";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

export default function NewDocumentPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    category: "getting-started",
    version: "v1",
  });
  const [dbCategories, setDbCategories] = React.useState<
    { id?: string; title: string; slug?: string }[]
  >([]);

  async function handleCreate() {
    setIsCreating(true);
    try {
      const session = await getEditorSession();
      if (!session.success || !session.data) {
        toast.error("Not authenticated. Please log in again.");
        return;
      }

      const result = await createDocument(session.data, {
        title: form.title,
        description: form.description,
        category: form.category,
        version: form.version,
        slug: form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      } as Partial<DocMetadata>);

      if (result.success && result.data) {
        toast.success("Document created successfully");
        router.push(`/docs-admin/edit/${result.data.metadata.id}`);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  }

  React.useEffect(() => {
    import("@/app/lib/actions/categories").then(({ getCategories }) => {
      getCategories()
        .then((result) => {
          if (result.success && Array.isArray(result.data)) {
            setDbCategories(result.data);
          }
        })
        .catch(() => toast.error("Failed to load categories"));
    });
  }, []);

  const mergedCategories = React.useMemo(() => {
    return dbCategories.map((c) => ({
      id: c.slug || c.id || c.title.toLowerCase().replace(/\s+/g, "-"),
      title: c.title,
    }));
  }, [dbCategories]);

  // ensure default selected category exists in merged categories
  React.useEffect(() => {
    if (mergedCategories.length > 0 && !mergedCategories.find((m) => m.id === form.category)) {
      setForm((f) => ({ ...f, category: mergedCategories[0].id }));
    }
  }, [mergedCategories, form.category]);

  return (
    <div className="mx-auto max-w-2xl p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/docs-admin"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Create New Document</h1>
        <p className="text-muted-foreground mt-1">
          Start with the basic information, then add content in the editor.
        </p>
      </div>

      {/* Form */}
      <div className="bg-card space-y-6 rounded-xl border p-6 shadow-sm">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Flight Search API"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of this documentation page..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.category}
              onValueChange={(val) => setForm({ ...form, category: val })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {mergedCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Version */}
          <div className="space-y-2">
            <Label htmlFor="version">API Version</Label>
            <Select
              value={form.version}
              onValueChange={(val) => setForm({ ...form, version: val })}
            >
              <SelectTrigger id="version">
                <SelectValue placeholder="Select a version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">v1</SelectItem>
                <SelectItem value="v2-beta">v2-beta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" asChild>
            <Link href="/docs-admin">Cancel</Link>
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !form.title || !form.description}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Document
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
