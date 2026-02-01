import { toast } from "sonner";

import {
  createCategory,
  deleteCategory as deleteCategoryServer,
  updateCategory as updateCategoryServer,
} from "@/app/lib/actions/categories";

export async function deleteCategory(id: string) {
  try {
    const result = await deleteCategoryServer(id);

    if (result.success) {
      toast.success("Category deleted");
      return { success: true };
    }
    toast.error(result.error || "Failed to delete category");
    return { success: false, error: result.error };
  } catch (error) {
    console.error("deleteCategory() - unexpected error", error);
    toast.error("Failed to delete category");
    return { success: false, error: String(error) };
  }
}

export async function addCategory(categoryLabel: string) {
  try {
    const result = await createCategory(categoryLabel);

    if (result.success) {
      toast.success("Category added");
      return { success: true, data: result.data };
    }
    toast.error(result.error || "Failed to add category");
    return { success: false, error: result.error };
  } catch (error) {
    console.error(error);
    toast.error("Failed to add category");
    return { success: false, error: String(error) };
  }
}

export async function updateCategory(id: string, newTitle: string) {
  try {
    const result = await updateCategoryServer(id, newTitle);

    if (result.success) {
      toast.success("Category updated");
      return { success: true, data: result.data };
    }
    toast.error(result.error || "Failed to update category");
    return { success: false, error: result.error };
  } catch (error) {
    console.error(error);
    toast.error("Failed to update category");
    return { success: false, error: String(error) };
  }
}

export async function moveCategory(id: string, direction: "up" | "down") {
  try {
    const { updateCategoryOrder } = await import("@/app/lib/actions/categories");
    const result = await updateCategoryOrder(id, direction);

    if (result.success) {
      return { success: true };
    }
    toast.error(result.error || "Failed to move category");
    return { success: false, error: result.error };
  } catch (error) {
    console.error(error);
    toast.error("Failed to move category");
    return { success: false, error: String(error) };
  }
}

export async function reorderCategories(items: { id: string; order: number }[]) {
  try {
    const { reorderCategories: reorder } = await import("@/app/lib/actions/categories");
    const result = await reorder(items);
    if (!result.success) {
      toast.error(result.error || "Failed to save order");
    }
    return result;
  } catch (error) {
    console.error(error);
    toast.error("Failed to reorder categories");
    return { success: false, error: String(error) };
  }
}
