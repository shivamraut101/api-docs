"use server";

import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ order: 1 });
    return {
      success: true,
      data: categories.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        slug: c.slug,
        order: c.order,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: "Failed to fetch categories." };
  }
}

export async function createCategory(title: string, label?: string, slugInput?: string) {
  try {
    await dbConnect();

    // Fallbacks to match original API logic
    const finalTitle = title || label;
    if (!finalTitle) {
      return { success: false, error: "Missing title" };
    }

    const slug = (slugInput || finalTitle).toLowerCase().replace(/\s+/g, "-");
    const existing = await Category.findOne({ slug });

    if (existing) {
      return { success: false, error: "Category exists" };
    }

    // Get max order to append to end
    const lastCategory = await Category.findOne().sort({ order: -1 });
    const order = lastCategory && lastCategory.order ? lastCategory.order + 1 : 0;

    const created = await Category.create({
      title: finalTitle,
      slug,
      order,
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/docs-admin");
    revalidatePath("/docs-admin/new");
    revalidatePath("/docs", "layout");

    return {
      success: true,
      data: { id: created._id.toString(), title: created.title, slug: created.slug },
    };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category." };
  }
}

export async function deleteCategory(id: string) {
  try {
    console.log("Server Action: deleteCategory", id);
    await dbConnect();

    const cat = await Category.findByIdAndDelete(id);

    if (!cat) {
      return { success: false, error: "Category not found." };
    }

    const Document = (await import("@/models/Document")).default;
    const deleteResult = await Document.deleteMany({
      "metadata.category": cat.slug,
    });
    console.log(`Deleted ${deleteResult.deletedCount} documents for category: ${cat.slug}`);

    revalidatePath("/docs-admin");
    revalidatePath("/docs-admin/new");
    revalidatePath("/docs", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category." };
  }
}

export async function updateCategory(id: string, newTitle: string) {
  try {
    await dbConnect();
    const slug = newTitle.toLowerCase().replace(/\s+/g, "-");

    // Check if new title/slug already exists (excluding current category)
    const existing = await Category.findOne({
      slug,
      _id: { $ne: id },
    });

    if (existing) {
      return { success: false, error: "Category with this name already exists" };
    }

    // Find original category to update document references
    const originalCategory = await Category.findById(id);
    if (!originalCategory) {
      return { success: false, error: "Category not found" };
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        title: newTitle,
        slug,
      },
      { new: true }
    );

    // Update all documents in this category
    const Document = (await import("@/models/Document")).default;
    await Document.updateMany(
      { "metadata.category": originalCategory.slug },
      { "metadata.category": slug }
    );

    revalidatePath("/docs-admin");
    revalidatePath("/docs-admin/new");
    revalidatePath("/docs", "layout");

    return {
      success: true,
      data: { id: updated._id.toString(), title: updated.title, slug: updated.slug },
    };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function updateCategoryOrder(id: string, direction: "up" | "down") {
  try {
    await dbConnect();
    const category = await Category.findById(id);
    if (!category) return { success: false, error: "Category not found" };

    const currentOrder = category.order || 0;

    // Find swap target
    let swapTarget;
    if (direction === "up") {
      swapTarget = await Category.findOne({ order: { $lt: currentOrder } }).sort({ order: -1 });
    } else {
      swapTarget = await Category.findOne({ order: { $gt: currentOrder } }).sort({ order: 1 });
    }

    if (!swapTarget) {
      return { success: false, error: "Cannot move further" };
    }

    // Swap orders
    const targetOrder = swapTarget.order || 0;

    // If orders are somehow duplicate or messed up, we might need a full re-index,
    // but simple swap works for now usually.

    await Category.findByIdAndUpdate(id, { order: targetOrder });
    await Category.findByIdAndUpdate(swapTarget._id, { order: currentOrder });

    revalidatePath("/docs-admin");
    revalidatePath("/docs", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder category:", error);
    return { success: false, error: "Failed to reorder" };
  }
}

export async function reorderCategories(items: { id: string; order: number }[]) {
  try {
    await dbConnect();

    // Use Promise.all for robust parallel updates
    // This avoids "atomic operators" errors sometimes seen with bulkWrite on certain drivers/schema configs
    await Promise.all(
      items.map((item) => Category.findByIdAndUpdate(item.id, { $set: { order: item.order } }))
    );

    revalidatePath("/docs-admin");
    revalidatePath("/docs", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder categories:", error);
    return { success: false, error: "Failed to reorder categories" };
  }
}
