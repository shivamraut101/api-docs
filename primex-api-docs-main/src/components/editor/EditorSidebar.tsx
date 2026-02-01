"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocMetadata, EditorSession } from "@/lib/editor-types";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  FilePlus,
  FileText,
  FolderOpen,
  GripVertical,
  Home,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  addCategory as addCategoryAction,
  deleteCategory as deleteCategoryAction,
  reorderCategories,
  updateCategory as updateCategoryAction,
} from "../docs/category.actions";
import { deleteDoc, reorderDocs, updateDocTitle } from "../docs/doc.actions";

function SortableItem({
  id,
  children,
  className,
}: {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (listeners: any) => React.ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.3 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={className} {...attributes}>
      {children(listeners)}
    </div>
  );
}

interface EditorSidebarProps {
  session: EditorSession;
  documents?: DocMetadata[];
}

export function EditorSidebar({ session, documents = [] }: EditorSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>(["getting-started"]);

  // Dialog States
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Action Item States
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [renamingItem, setRenamingItem] = React.useState<{
    id: string;
    type: "category" | "doc";
    title: string;
  } | null>(null);
  const [deletingItem, setDeletingItem] = React.useState<{
    id: string;
    type: "category" | "doc";
    title: string;
  } | null>(null);
  const [newName, setNewName] = React.useState("");

  const [categoriesState, setCategoriesState] = React.useState<
    { id: string; label: string; icon: React.ElementType; _id?: string }[]
  >([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);
  const [dbCategories, setDbCategories] = React.useState<
    { id?: string; title: string; slug?: string }[]
  >([]);

  // Docs State
  const [docsState, setDocsState] = React.useState<DocMetadata[]>(documents);
  React.useEffect(() => {
    setDocsState(documents);
  }, [documents]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Filter documents based on search query
  const filteredDocuments = React.useMemo(() => {
    if (!searchQuery) return docsState;
    return docsState.filter((doc) => {
      if (!doc) return false;
      return (
        (doc.title?.toLowerCase() || "").includes((searchQuery || "").toLowerCase()) ||
        (doc.category?.toLowerCase() || "").includes((searchQuery || "").toLowerCase())
      );
    });
  }, [docsState, searchQuery]);

  // Auto-expand categories if searching
  React.useEffect(() => {
    if (searchQuery) {
      const activeCats = categoriesState
        .filter((cat) => filteredDocuments.some((doc) => doc.category === cat.id))
        .map((cat) => cat.id);
      setExpandedCategories((prev) => Array.from(new Set([...prev, ...activeCats])));
    }
  }, [searchQuery, filteredDocuments, categoriesState]);

  // load categories from API
  React.useEffect(() => {
    import("@/app/lib/actions/categories").then(({ getCategories }) => {
      getCategories()
        .then((result) => {
          if (result.success && Array.isArray(result.data)) {
            setDbCategories(result.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingCategories(false));
    });
  }, []);

  // normalize and merge categories
  React.useEffect(() => {
    if (loadingCategories) return;

    const iconMap: Record<string, React.ElementType> = {
      "getting-started": Home,
    };

    const merged = dbCategories.map((c) => {
      const id = c.slug || c.id || c.title.toLowerCase().replace(/\s+/g, "-");
      return {
        id,
        label: c.title,
        icon: iconMap[id] || FolderOpen,
        _id: c.id, // Keep original ID for updates
      };
    });

    setCategoriesState(merged);
  }, [dbCategories, loadingCategories]);

  const handleStartRename = (item: { id: string; type: "category" | "doc"; title: string }) => {
    setRenamingItem(item);
    setNewName(item.title);
    setRenameDialogOpen(true);
  };

  const handleStartDelete = (item: { id: string; type: "category" | "doc"; title: string }) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!renamingItem || !newName.trim()) return;

    if (renamingItem.type === "category") {
      // Find the category object to get distinct ID if needed,
      // but here renamingItem.id is likely the slug.
      // Wait, we need the DB _id for updateCategory() in backend.
      // The categoriesState map above stores `_id`. I should modify how I pass ID.
      // I'll grab the ID from state.
      const cat = categoriesState.find(
        (c) => c.id === renamingItem.id || c.label === renamingItem.title
      );
      // If we don't have _id, maybe we can't update. `dbCategories` has it.
      // Let's rely on `cat._id` from the updated state logic above.

      const realId = cat?._id;
      if (!realId) {
        console.error("Cannot find ID for category", renamingItem);
        return;
      }

      const res = await updateCategoryAction(realId, newName);
      if (res && res.success && res.data) {
        setCategoriesState((prev) =>
          prev.map((c) =>
            c.id === renamingItem.id ? { ...c, label: res.data!.title, id: res.data!.slug } : c
          )
        );
        setRenameDialogOpen(false);
      }
    } else {
      // Document
      const res = await updateDocTitle(renamingItem.id, newName);
      if (res.success) {
        // Force refresh or just assume reload?
        // Documents prop comes from parent. Ideally parent refreshes.
        // But we can't update props. We rely on Next.js `revalidatePath`.
        setRenameDialogOpen(false);
        window.location.reload(); // Simplest way to see change effectively if state doesn't update
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // Handling Category Reorder
    if (activeIdStr.startsWith("cat-") && overIdStr.startsWith("cat-")) {
      const oldIndex = categoriesState.findIndex((i) => `cat-${i._id || i.id}` === activeIdStr);
      const newIndex = categoriesState.findIndex((i) => `cat-${i._id || i.id}` === overIdStr);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(categoriesState, oldIndex, newIndex);

        // Optimistic UI update
        setCategoriesState(newOrder);

        // Server Action with proper error handling
        reorderCategories(newOrder.map((c, idx) => ({ id: c._id || c.id, order: idx })))
          .then((result) => {
            if (!result.success) {
              // Revert on failure
              setCategoriesState(categoriesState);
              toast.error("Failed to reorder categories");
            }
          })
          .catch(() => {
            // Revert on error
            setCategoriesState(categoriesState);
            toast.error("Error reordering categories");
          });
      }
      return;
    }

    // Handling Document Reorder
    if (activeIdStr.startsWith("doc-") && overIdStr.startsWith("doc-")) {
      const oldIndex = docsState.findIndex((i) => `doc-${i.id}` === activeIdStr);
      const newIndex = docsState.findIndex((i) => `doc-${i.id}` === overIdStr);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Prevent reordering across different categories
        if (docsState[oldIndex].category !== docsState[newIndex].category) {
          return;
        }

        const newOrder = arrayMove(docsState, oldIndex, newIndex);

        // Optimistic UI update
        setDocsState(newOrder);

        // Server Action with proper error handling
        const categoryDocs = newOrder.filter((d) => d.category === docsState[oldIndex].category);
        reorderDocs(categoryDocs.map((d, idx) => ({ id: d.id, order: idx })))
          .then((result) => {
            if (!result.success) {
              // Revert on failure
              setDocsState(docsState);
              toast.error("Failed to reorder documents");
            }
          })
          .catch(() => {
            // Revert on error
            setDocsState(docsState);
            toast.error("Error reordering documents");
          });
      }
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingItem) return;

    if (deletingItem.type === "category") {
      const res = await deleteCategoryAction(deletingItem.id);
      if (res.success) {
        setCategoriesState((prev) => prev.filter((c) => c.id !== deletingItem.id));
        setDeleteDialogOpen(false);
      }
    } else {
      const res = await deleteDoc(deletingItem.id);
      if (res.success) {
        setDeleteDialogOpen(false);
        window.location.reload();
      }
    }
  };

  return (
    <aside className="bg-card w-64 border-r">
      <div className="bg-card flex h-full flex-col">
        {/* Local Filter */}
        <div className="border-b p-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <input
              type="text"
              placeholder="Filter documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background focus:ring-primary w-full rounded-md border py-2 pr-3 pl-8 text-sm transition-all focus:ring-1 focus:outline-none"
            />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <div className="p-3">
            {/* Quick Actions */}
            <div className="mb-4">
              <p className="text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase">
                Quick Actions
              </p>
              <Link
                href="/docs-admin"
                className={cn(
                  "hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  pathname === "/docs-admin" && "bg-muted font-medium"
                )}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              {session.permissions.canCreate && (
                <Link
                  href="/docs-admin/new"
                  className={cn(
                    "hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    pathname === "/docs-admin/new" && "bg-muted font-medium"
                  )}
                >
                  <FilePlus className="h-4 w-4" />
                  New Document
                </Link>
              )}
            </div>

            {/* Document Tree */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div>
                <p className="text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase">
                  Documents {searchQuery && "(" + filteredDocuments.length + ")"}
                </p>
                <SortableContext
                  items={categoriesState.map((c) => `cat-${c._id || c.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {categoriesState.map((category) => {
                    const isExpanded = expandedCategories.includes(category.id);
                    const categoryDocs = filteredDocuments.filter(
                      (d) =>
                        (d.category?.toLowerCase() || "") === (category.id?.toLowerCase() || "")
                    );

                    if (searchQuery && categoryDocs.length === 0) return null;

                    return (
                      <SortableItem
                        key={category.id}
                        id={`cat-${category._id || category.id}`}
                        className="relative"
                      >
                        {(listeners) => (
                          <div>
                            <div className="group/item hover:bg-muted/50 relative flex w-full items-center rounded-md text-sm transition-colors">
                              {/* Left Actions (Overlay on hover) */}
                              <div className="bg-muted pointer-events-none absolute left-0 z-20 flex h-full items-center gap-0.5 rounded-md px-1 opacity-0 transition-opacity duration-200 group-hover/item:pointer-events-auto group-hover/item:opacity-100 group-hover/item:delay-150">
                                <button
                                  className="text-muted-foreground hover:text-foreground hover:bg-background/50 cursor-grab rounded p-1 active:cursor-grabbing"
                                  {...listeners}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="sr-only">Move</span>
                                  <GripVertical className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartRename({
                                      id: category.id,
                                      type: "category",
                                      title: category.label,
                                    });
                                  }}
                                  className="text-muted-foreground hover:text-foreground hover:bg-background/50 rounded p-1"
                                  title="Rename"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartDelete({
                                      id: category.id,
                                      type: "category",
                                      title: category.label,
                                    });
                                  }}
                                  className="text-muted-foreground hover:bg-background/50 rounded p-1 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <div className="bg-border mx-0.5 h-4 w-px" />
                              </div>

                              <button
                                onClick={() => toggleCategory(category.id)}
                                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left transition-transform duration-200 ease-out group-hover/item:translate-x-[68px] group-hover/item:delay-150"
                              >
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 shrink-0 transition-transform",
                                    isExpanded && "rotate-90"
                                  )}
                                />
                                <category.icon className="h-4 w-4 shrink-0" />
                                <span className="truncate font-medium">{category.label}</span>
                              </button>
                            </div>

                            {isExpanded && (
                              <div
                                className="mt-1 space-y-0.5 border-l pl-2"
                                style={{ marginLeft: "1.2rem" }}
                              >
                                {categoryDocs.length === 0 && (
                                  <div className="text-muted-foreground px-2 py-1 text-xs italic">
                                    No documents
                                  </div>
                                )}
                                <SortableContext
                                  items={categoryDocs.map((d) => `doc-${d.id}`)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {categoryDocs.map((doc) => (
                                    <SortableItem
                                      key={doc.id}
                                      id={`doc-${doc.id}`}
                                      className="relative"
                                    >
                                      {(docListeners) => (
                                        <div className="group/item hover:bg-muted relative flex items-center rounded-md transition-colors">
                                          {/* Document Actions (Overlays on left) */}
                                          <div className="bg-muted pointer-events-none absolute left-0 z-20 flex h-full items-center gap-0.5 rounded-md px-1 opacity-0 transition-opacity duration-200 group-hover/item:pointer-events-auto group-hover/item:opacity-100 group-hover/item:delay-150">
                                            <button
                                              className="text-muted-foreground hover:text-foreground hover:bg-background/50 cursor-grab rounded p-1 active:cursor-grabbing"
                                              {...docListeners}
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <span className="sr-only">Move</span>
                                              <GripVertical className="h-4 w-4" />
                                            </button>

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartRename({
                                                  id: doc.id,
                                                  type: "doc",
                                                  title: doc.title,
                                                });
                                              }}
                                              className="text-muted-foreground hover:text-foreground hover:bg-background/50 rounded p-1"
                                              title="Rename"
                                            >
                                              <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartDelete({
                                                  id: doc.id,
                                                  type: "doc",
                                                  title: doc.title,
                                                });
                                              }}
                                              className="text-muted-foreground hover:bg-background/50 rounded p-1 hover:text-red-600"
                                              title="Delete"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                            <div className="bg-border mx-0.5 h-4 w-px" />
                                          </div>

                                          <Link
                                            href={"/docs-admin/edit/" + doc.id}
                                            className={cn(
                                              "flex min-w-0 flex-1 items-center gap-2 truncate px-2 py-1.5 text-sm transition-transform duration-200 ease-out group-hover/item:translate-x-[68px] group-hover/item:delay-150",
                                              pathname === "/docs-admin/edit/" + doc.id &&
                                                "bg-muted font-medium"
                                            )}
                                          >
                                            <FileText className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">{doc.title}</span>
                                          </Link>
                                        </div>
                                      )}
                                    </SortableItem>
                                  ))}
                                </SortableContext>
                              </div>
                            )}
                          </div>
                        )}
                      </SortableItem>
                    );
                  })}
                </SortableContext>
                {searchQuery && filteredDocuments.length === 0 && (
                  <p className="text-muted-foreground px-2 py-4 text-center text-xs">
                    No documents match &quot;{searchQuery}&quot;
                  </p>
                )}
              </div>
            </DndContext>
          </div>
        </ScrollArea>

        {/* Add category, Dialogs hidden in Render, Triggered via State */}
        <div className="border-t p-3">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground hover:border-foreground/50 flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-2 py-2 text-sm transition-all">
                <FilePlus className="h-4 w-4" />
                Add category
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>Enter a name for the new category.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <input
                  className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose className="btn">Cancel</DialogClose>
                <button
                  className="btn bg-primary text-primary-foreground ml-2 rounded px-3 py-1"
                  onClick={async () => {
                    const name = newCategoryName.trim();
                    if (!name) return;
                    const result = await addCategoryAction(name);
                    if (result?.success) {
                      const slug = result.data?.slug || name.toLowerCase().replace(/\s+/g, "-");
                      setCategoriesState((prev) => [
                        ...prev,
                        {
                          id: slug,
                          label: result.data?.title || name,
                          icon: FolderOpen,
                          _id: result.data?.id,
                        },
                      ]);
                      setNewCategoryName("");
                      setAddDialogOpen(false);
                    }
                  }}
                >
                  Save
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rename Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Rename {renamingItem?.type === "category" ? "Category" : "Document"}
              </DialogTitle>
              <DialogDescription>
                Enter a new name for &quot;{renamingItem?.title}&quot;
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <input
                className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <button
                className="px-3 py-2 text-sm hover:underline"
                onClick={() => setRenameDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm"
                onClick={handleRenameSubmit}
              >
                Save
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete {deletingItem?.type}</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deletingItem?.title}&quot;?
                {deletingItem?.type === "category" &&
                  " This will remove all documents in this category."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                className="px-3 py-2 text-sm hover:underline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-600 px-4 py-2 text-sm text-white"
                onClick={handleDeleteSubmit}
              >
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="border-t p-3">
          <div className="bg-muted/50 text-muted-foreground rounded-md p-3 text-xs">
            <p className="text-foreground font-medium">Role: {session.role}</p>
            <p className="mt-1">
              {session.role === "admin"
                ? "Full access to create, edit, and publish"
                : "Can create and edit drafts"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
