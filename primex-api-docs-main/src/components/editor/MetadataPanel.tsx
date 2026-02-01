"use client";

import { deleteDocument, setDefaultDocument } from "@/app/actions/editor.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import type { DocMetadata, DocStatus, EditorSession } from "@/lib/editor-types";
import type { ApiStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

interface MetadataPanelProps {
  metadata: DocMetadata;
  session?: EditorSession;
  onChange: (metadata: Partial<DocMetadata>) => void;
  readOnly?: boolean;
}

const apiStatuses: { id: ApiStatus; label: string }[] = [
  { id: "stable", label: "Stable" },
  { id: "beta", label: "Beta" },
  { id: "deprecated", label: "Deprecated" },
];

const docStatuses: { id: DocStatus; label: string; color: string }[] = [
  { id: "draft", label: "Draft", color: "bg-amber-500" },
  { id: "in_review", label: "In Review", color: "bg-blue-500" },
  { id: "published", label: "Published", color: "bg-emerald-500" },
  { id: "deprecated", label: "Deprecated", color: "bg-red-500" },
];

export function MetadataPanel({ metadata, session, onChange, readOnly }: MetadataPanelProps) {
  const router = useRouter();
  const [isSettingDefault, setIsSettingDefault] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [categories, setCategories] = React.useState<{ id: string; label: string }[]>([]);

  React.useEffect(() => {
    import("@/app/lib/actions/categories").then(({ getCategories }) => {
      getCategories()
        .then((result) => {
          if (result.success && Array.isArray(result.data)) {
            setCategories(
              result.data.map((c) => ({
                id: c.slug || c.id || "",
                label: c.title,
              }))
            );
          }
        })
        .catch((err) => console.error("Failed to load categories", err));
    });
  }, []);

  const handleSetDefault = async () => {
    if (!session || isSettingDefault) return;
    setIsSettingDefault(true);
    try {
      const result = await setDefaultDocument(session, metadata.id);
      if (result.success && result.data) {
        onChange(result.data.metadata);
        toast.success("This document is now the default landing page!");
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (err) {
      toast.error("Failed to set default document");
      console.error(err);
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleDelete = async () => {
    if (!session || isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteDocument(session, metadata.id);
      if (result.success) {
        toast.success("Document deleted");
        router.push("/docs-admin");
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (err) {
      toast.error("Failed to delete document");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Default Page Button */}
      {session?.role === "admin" && (
        <div className="border-b pb-4">
          <Button
            variant={metadata.isDefault ? "secondary" : "outline"}
            className={cn("w-full gap-2", metadata.isDefault && "border-primary text-primary")}
            onClick={handleSetDefault}
            disabled={isSettingDefault || metadata.isDefault || metadata.status !== "published"}
          >
            {isSettingDefault ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star className={cn("h-4 w-4", metadata.isDefault && "fill-current")} />
            )}
            {metadata.isDefault ? "Default Landing Page" : "Set as Default Page"}
          </Button>
          {!metadata.isDefault && (
            <p className="text-muted-foreground mt-2 text-center text-[10px]">
              The default page is shown when users click Documentation or Get Started
            </p>
          )}
        </div>
      )}

      {/* Status */}
      <div>
        <Label className="text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase">
          Document Status
        </Label>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              docStatuses.find((s) => s.id === metadata.status)?.color
            )}
          />
          <span className="text-sm font-medium capitalize">
            {metadata.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={metadata.title}
          onChange={(e) => onChange({ title: e.target.value })}
          disabled={readOnly}
          placeholder="Document title"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={metadata.description}
          onChange={(e) => onChange({ description: e.target.value })}
          disabled={readOnly}
          rows={3}
          placeholder="Brief description"
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={metadata.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
          disabled={readOnly}
          placeholder="my-document"
          className="font-mono text-xs"
        />
        <p className="text-muted-foreground mt-1 truncate text-[10px]">/docs/{metadata.id}</p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={metadata.category}
          onValueChange={(val) => onChange({ category: val })}
          disabled={readOnly}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* API Status */}
      <div className="space-y-2">
        <Label className="block">API Status</Label>
        <div className="flex flex-wrap gap-2">
          {apiStatuses.map((status) => (
            <Button
              key={status.id}
              variant={metadata.apiStatus === status.id ? "secondary" : "outline"}
              size="sm"
              onClick={() => onChange({ apiStatus: status.id })}
              disabled={readOnly}
              className={cn(
                "h-8 text-xs",
                metadata.apiStatus === status.id && "border-primary text-primary"
              )}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="space-y-2">
        <Label htmlFor="version">Version</Label>
        <Select
          value={metadata.version}
          onValueChange={(val) => onChange({ version: val })}
          disabled={readOnly}
        >
          <SelectTrigger id="version">
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="v1">v1</SelectItem>
            <SelectItem value="v2-beta">v2-beta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order */}
      <div className="space-y-2">
        <Label htmlFor="order">Sort Order</Label>
        <Input
          id="order"
          type="number"
          value={metadata.order}
          onChange={(e) => onChange({ order: parseInt(e.target.value) || 999 })}
          disabled={readOnly}
        />
      </div>

      {/* Metadata Info */}
      <div className="bg-muted/30 text-muted-foreground space-y-1 rounded-lg border p-3 text-[10px]">
        <div className="flex justify-between">
          <span>Created:</span>
          <span className="text-foreground font-medium">
            {new Date(metadata.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Updated:</span>
          <span className="text-foreground font-medium">
            {new Date(metadata.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Last edited by:</span>
          <span className="text-foreground ml-2 truncate font-medium">{metadata.lastEditedBy}</span>
        </div>
      </div>

      {/* Delete Button */}
      {session?.permissions?.canDelete && (
        <div className="border-t pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">Delete Document</span>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the document &quot;
                  {metadata.title}&quot; and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
