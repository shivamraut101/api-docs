"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { BlockType, EditorBlock } from "@/lib/editor-types";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { BlockPalette } from "./BlockPalette";
import { BlockRenderer } from "./BlockRenderer";

interface VisualEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
  readOnly?: boolean;
}

export function VisualEditor({ blocks, onChange, readOnly }: VisualEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null);
  const [showPalette, setShowPalette] = React.useState(false);
  const [insertIndex, setInsertIndex] = React.useState<number>(blocks.length);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onChange(arrayMove(blocks, oldIndex, newIndex));
    }
  }

  function handleAddBlock(type: BlockType, data: Record<string, unknown>) {
    const newBlock: EditorBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      data,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(insertIndex, 0, newBlock);
    onChange(newBlocks);
    setShowPalette(false);
    setSelectedBlockId(newBlock.id);
  }

  function handleUpdateBlock(blockId: string, data: Record<string, unknown>) {
    onChange(blocks.map((b) => (b.id === blockId ? { ...b, data } : b)));
  }

  function handleDeleteBlock(blockId: string) {
    onChange(blocks.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }

  function handleInsertBelow(index: number) {
    setInsertIndex(index + 1);
    setShowPalette(true);
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="bg-muted/30 flex items-center gap-2 border-b px-4 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setInsertIndex(blocks.length);
            setShowPalette(true);
          }}
          disabled={readOnly}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Block
        </Button>
      </div>

      {/* Editor Canvas */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto max-w-4xl p-8">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center">
              <p className="text-muted-foreground mb-4 text-lg">Start building your document</p>
              <Button
                onClick={() => {
                  setInsertIndex(0);
                  setShowPalette(true);
                }}
                disabled={readOnly}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Block
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className={cn(
                        "group bg-card relative rounded-lg border transition-all",
                        selectedBlockId === block.id
                          ? "border-primary ring-primary/20 ring-2"
                          : "hover:border-border border-transparent"
                      )}
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      {/* Block Controls */}
                      <div
                        className={cn(
                          "absolute top-1/2 -left-10 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition-opacity",
                          "group-hover:opacity-100"
                        )}
                      >
                        <button className="hover:bg-muted cursor-grab rounded p-1">
                          <GripVertical className="text-muted-foreground h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id);
                          }}
                          className="hover:bg-destructive/10 hover:text-destructive rounded p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Block Content */}
                      <BlockRenderer
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onChange={(data) => handleUpdateBlock(block.id, data)}
                        readOnly={readOnly}
                      />

                      {/* Insert Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInsertBelow(index);
                        }}
                        className={cn(
                          "bg-background hover:bg-muted absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border p-1 opacity-0 transition-opacity",
                          "group-hover:opacity-100"
                        )}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>

      {/* Block Palette Modal */}
      {showPalette && (
        <BlockPalette onSelect={handleAddBlock} onClose={() => setShowPalette(false)} />
      )}
    </div>
  );
}
