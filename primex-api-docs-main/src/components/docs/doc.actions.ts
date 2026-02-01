import {
  deleteDoc as deleteDocServer,
  updateDocTitle as updateDocTitleServer,
} from "@/app/lib/actions/docs";
import { toast } from "sonner";

export async function deleteDoc(id: string) {
  try {
    const result = await deleteDocServer(id);
    if (result.success) {
      toast.success("Document deleted");
      return { success: true };
    }
    toast.error(result.error || "Failed to delete document");
    return { success: false, error: result.error };
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete document");
    return { success: false, error: String(error) };
  }
}

export async function updateDocTitle(id: string, newTitle: string) {
  try {
    const result = await updateDocTitleServer(id, newTitle);
    if (result.success) {
      toast.success("Document renamed");
      return { success: true, data: result.data };
    }
    toast.error(result.error || "Failed to rename document");
    return { success: false, error: result.error };
  } catch (error) {
    console.error(error);
    toast.error("Failed to rename document");
    return { success: false, error: String(error) };
  }
}

export async function moveDoc(id: string, direction: "up" | "down") {
  try {
    const { updateDocOrder } = await import("@/app/lib/actions/docs");
    const result = await updateDocOrder(id, direction);

    if (result.success) {
      return { success: true };
    }
    toast.error(result.error || "Failed to move document");
    return { success: false, error: result.error };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

export async function reorderDocs(items: { id: string; order: number }[]) {
  try {
    const { reorderDocs: reorder } = await import("@/app/lib/actions/docs");
    const result = await reorder(items);
    if (!result.success) {
      toast.error(result.error || "Failed to save order");
    }
    return result;
  } catch (error) {
    console.error(error);
    toast.error("Failed to reorder documents");
    return { success: false, error: String(error) };
  }
}
