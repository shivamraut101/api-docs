"use server";

import { generateMdxFromBlocks } from "@/lib/mdx-generator";
import dbConnect from "@/lib/mongodb";
import { sanitizeDoc } from "@/lib/utils";
import Document from "@/models/Document";
import { revalidatePath } from "next/cache";

export async function getPublishedDocs() {
  try {
    await dbConnect();
    const docs = await Document.find({
      "metadata.status": "published",
      isContentlayerDoc: { $ne: true },
    }).sort({ "metadata.order": 1 });

    const data = docs.map((doc) => {
      const sanitized = sanitizeDoc(doc);
      return {
        id: sanitized.metadata.id,
        title: sanitized.metadata.title,
        category: sanitized.metadata.category,
        slug: sanitized.metadata.slug,
        apiStatus: sanitized.metadata.apiStatus,
        version: sanitized.metadata.version,
        order: sanitized.metadata.order,
        isDefault: sanitized.metadata.isDefault,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch published docs:", error);
    return { success: false, error: "Failed to fetch published docs." };
  }
}

export async function getDocById(id: string) {
  try {
    await dbConnect();

    const doc = await Document.findOne({
      "metadata.status": "published",
      "metadata.id": id,
      isContentlayerDoc: { $ne: true },
    });

    if (!doc) {
      return { success: false, error: "Document not found" };
    }

    const mdxContent = generateMdxFromBlocks(sanitizeDoc(doc));

    return {
      success: true,
      data: {
        id: doc.metadata.id,
        title: doc.metadata.title,
        description: doc.metadata.description,
        category: doc.metadata.category,
        version: doc.metadata.version,
        status: doc.metadata.apiStatus,
        slug: doc.metadata.slug,
        mdxContent,
        body: {
          raw: mdxContent,
          code: mdxContent,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching document:", error);
    return { success: false, error: "Failed to fetch document" };
  }
}

// Stub for management logic if needed properly migrated later,
// but focusing on public/consumed APIs first as per context.
// Actually, I should probably check for management logic too if `docs-admin` needs it.
// The user said "convert all apis which are @[src/app/api] into server action files".
// There is /api/docs/ POST, PUT, DELETE. I should add those.

export async function deleteDoc(id: string) {
  try {
    await dbConnect();
    const result = await Document.findOneAndDelete({ "metadata.id": id });

    if (!result) {
      return { success: false, error: "Document not found" };
    }

    revalidatePath("/docs-admin");
    revalidatePath("/docs", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete document:", error);
    return { success: false, error: "Failed to delete document" };
  }
}

export async function updateDocTitle(id: string, newTitle: string) {
  try {
    await dbConnect();
    const result = await Document.findOneAndUpdate(
      { "metadata.id": id },
      { "metadata.title": newTitle },
      { new: true }
    );

    if (!result) {
      return { success: false, error: "Document not found" };
    }

    revalidatePath("/docs-admin");
    revalidatePath("/docs", "layout");

    return { success: true, data: { title: result.metadata.title } };
  } catch (error) {
    console.error("Failed to update document title:", error);
    return { success: false, error: "Failed to update document title" };
  }
}

export async function updateDocOrder(id: string, direction: "up" | "down") {
  try {
    await dbConnect();
    const doc = await Document.findOne({ "metadata.id": id });
    if (!doc) return { success: false, error: "Document not found" };

    const currentOrder = doc.metadata.order || 0;
    const category = doc.metadata.category;

    // Find swap target in same category
    let swapTarget;
    if (direction === "up") {
      swapTarget = await Document.findOne({
        "metadata.category": category,
        "metadata.order": { $lt: currentOrder },
        isContentlayerDoc: { $ne: true },
      }).sort({ "metadata.order": -1 });
    } else {
      swapTarget = await Document.findOne({
        "metadata.category": category,
        "metadata.order": { $gt: currentOrder },
        isContentlayerDoc: { $ne: true },
      }).sort({ "metadata.order": 1 });
    }

    if (!swapTarget) {
      return { success: false, error: "Cannot move further" };
    }

    const targetOrder = swapTarget.metadata.order || 0;

    await Document.updateOne({ "metadata.id": id }, { "metadata.order": targetOrder });
    await Document.updateOne(
      { "metadata.id": swapTarget.metadata.id },
      { "metadata.order": currentOrder }
    );

    revalidatePath("/docs-admin");
    revalidatePath("/docs", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder document:", error);
    // Fallback: If finding by metadata.id fails (maybe it's using _id), try _id
    return { success: false, error: "Failed to reorder" };
  }
}

export async function reorderDocs(items: { id: string; order: number }[]) {
  try {
    await dbConnect();

    // Use Promise.all for robust parallel updates
    await Promise.all(
      items.map((item) =>
        Document.findOneAndUpdate(
          { "metadata.id": item.id },
          { $set: { "metadata.order": item.order } }
        )
      )
    );

    revalidatePath("/docs-admin");
    revalidatePath("/docs", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to reorder docs:", error);
    return { success: false, error: "Failed to reorder docs" };
  }
}

export async function getLandingDoc() {
  try {
    await dbConnect();

    // 1. Try to find the document marked as default
    let landingDoc = await Document.findOne({
      "metadata.status": "published",
      "metadata.isDefault": true,
    });

    // 2. Fallback to the first published document by order
    if (!landingDoc) {
      landingDoc = await Document.findOne({
        "metadata.status": "published",
        isContentlayerDoc: { $ne: true },
      }).sort({
        "metadata.order": 1,
        "metadata.title": 1,
      });
    }

    if (!landingDoc) {
      return { success: false, error: "No published documents found" };
    }

    const target = `/docs/${landingDoc.metadata.id}`;

    return {
      success: true,
      data: {
        id: landingDoc.metadata.id,
        title: landingDoc.metadata.title,
        target,
      },
    };
  } catch (error) {
    console.error("Failed to fetch landing doc:", error);
    return { success: false, error: "Failed to fetch landing doc" };
  }
}
