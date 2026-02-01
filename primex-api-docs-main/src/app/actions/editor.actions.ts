"use server";

import {
  FORBIDDEN_TERMS,
  type DocMetadata,
  type EditorBlock,
  type EditorDocument,
  type EditorRole,
  type EditorSession,
} from "@/lib/editor-types";
import { generateMdxFromBlocks } from "@/lib/mdx-generator";
import dbConnect from "@/lib/mongodb";
import type { ApiResponse } from "@/lib/types";
import Document from "@/models/Document";
import { compileMDX } from "next-mdx-remote/rsc";
import { revalidatePath } from "next/cache";

// Helper functions
const generateId = () => `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
const now = () => new Date().toISOString();

/**
 * Sanitize Mongoose document for Next.js serialization
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeDoc(doc: any): EditorDocument {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    metadata: JSON.parse(JSON.stringify(obj.metadata)),
    blocks: JSON.parse(JSON.stringify(obj.blocks)),
  } as EditorDocument;
}

/**
 * Get current editor session (consumed from existing auth)
 */
import { auth } from "@/auth";

export async function getEditorSession(): Promise<ApiResponse<EditorSession>> {
  const session = await auth();

  if (!session?.user) {
    return {
      success: false,
      data: null,
      error: "Product session not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  const role = (session.user.role as "admin" | "viewer") || "viewer";

  return {
    success: true,
    data: {
      userId: session.user.id || session.user.email || "unknown",
      name: session.user.name || "User",
      email: session.user.email || "",
      role: role as EditorRole,
      permissions: {
        canCreate: role === "admin",
        canEdit: role === "admin",
        canReview: role === "admin",
        canPublish: role === "admin",
        canDelete: role === "admin",
      },
    },
    error: null,
    environment: "production",
    timestamp: now(),
    requestId: generateId(),
  };
}

/**
 * List all documents (filtered by status for writers)
 */
export async function listDocuments(session: EditorSession): Promise<ApiResponse<DocMetadata[]>> {
  await dbConnect();

  // Writers see their drafts, admins see everything
  const query =
    session.role === "admin"
      ? {}
      : {
          $or: [{ "metadata.status": "draft" }, { "metadata.createdBy": session.userId }],
        };

  const docs = await Document.find(query).sort({ "metadata.category": 1, "metadata.order": 1 });

  return {
    success: true,
    data: docs.map((d) => JSON.parse(JSON.stringify(d.metadata)) as DocMetadata),
    error: null,
    environment: "sandbox",
    timestamp: now(),
    requestId: generateId(),
  };
}

/**
 * Get a single document by ID
 */
export async function getDocument(docId: string): Promise<ApiResponse<EditorDocument>> {
  await dbConnect();
  const doc = await Document.findOne({ "metadata.id": docId });

  if (!doc) {
    return {
      success: false,
      data: null,
      error: "Document not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  // Convert Mongoose doc to plain object and sanitize for serialization
  return {
    success: true,
    data: sanitizeDoc(doc),
    error: null,
    environment: "sandbox",
    timestamp: now(),
    requestId: generateId(),
  };
}

/**
 * Create a new document
 */
export async function createDocument(
  session: EditorSession,
  metadata: Partial<DocMetadata>
): Promise<ApiResponse<EditorDocument>> {
  if (!session.permissions.canCreate) {
    return {
      success: false,
      data: null,
      error: "Permission denied: Cannot create documents",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  await dbConnect();
  const id = generateId();
  const docData = {
    metadata: {
      id,
      title: metadata.title || "Untitled Document",
      description: metadata.description || "",
      slug: metadata.slug || `untitled-${id}`,
      category: metadata.category || "getting-started",
      status: "draft",
      apiStatus: metadata.apiStatus || "stable",
      version: metadata.version || "v1",
      order: metadata.order || 999,
      createdAt: now(),
      updatedAt: now(),
      createdBy: session.userId,
      lastEditedBy: session.userId,
      isDefault: false,
    },
    blocks: [],
  };

  try {
    const doc = await Document.create(docData);

    revalidatePath("/docs-admin");
    revalidatePath("/docs-admin/new");

    return {
      success: true,
      data: sanitizeDoc(doc),
      error: null,
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  } catch (error: any) {
    console.error("Error creating document:", error);

    let errorMessage = "Failed to create document";
    if (error.code === 11000) {
      errorMessage = "A document with this title already exists in this category.";
    }

    return {
      success: false,
      data: null,
      error: errorMessage,
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }
}

/**
 * Update document blocks
 */
export async function updateDocument(
  session: EditorSession,
  docId: string,
  blocks: EditorBlock[]
): Promise<ApiResponse<EditorDocument>> {
  if (!session.permissions.canEdit) {
    return {
      success: false,
      data: null,
      error: "Permission denied: Cannot edit documents",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  await dbConnect();
  const doc = await Document.findOne({ "metadata.id": docId });
  if (!doc) {
    return {
      success: false,
      data: null,
      error: "Document not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  // Cannot edit published docs directly
  if (doc.metadata.status === "published" && session.role !== "admin") {
    return {
      success: false,
      data: null,
      error: "Cannot edit published documents. Create a new version instead.",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  // Validate MDX syntax before saving
  // PROD PROTECTION: If document is PUBLISHED, we must fail fast to prevent crashing the live site.
  // DRAFT FLEXIBILITY: If document is DRAFT/IN_REVIEW, we allow saving invalid MDX so users can save work-in-progress.
  try {
    const tempDoc = { ...sanitizeDoc(doc), blocks };
    const mdx = generateMdxFromBlocks(tempDoc);
    await compileMDX({
      source: mdx,
      options: { parseFrontmatter: true },
    });
  } catch (err: any) {
    // If published, BLOCK the save
    if (doc.metadata.status === "published") {
      return {
        success: false,
        data: null,
        error: `Cannot save broken MDX to a PUBLISHED document. This would crash the live site. Error: ${err.message}`,
        environment: "sandbox",
        timestamp: now(),
        requestId: generateId(),
      };
    }
    // If draft, ALLOW the save (but we rely on publish-time validation to catch it later)
    console.warn(`Saving invalid MDX for draft ${docId}:`, err.message);
  }

  doc.blocks = blocks;
  doc.metadata.updatedAt = now();
  doc.metadata.lastEditedBy = session.userId;
  await doc.save();

  revalidatePath("/docs-admin");
  revalidatePath(`/docs-admin/edit/${docId}`);
  if (doc.metadata.status === "published") {
    revalidatePath(`/docs/${doc.metadata.id}`);
    revalidatePath(`/docs`);
  }

  return {
    success: true,
    data: sanitizeDoc(doc),
    error: null,
    environment: "sandbox",
    timestamp: now(),
    requestId: generateId(),
  };
}

/**
 * Update document metadata
 */
export async function updateDocumentMetadata(
  session: EditorSession,
  docId: string,
  metadata: Partial<DocMetadata>
): Promise<ApiResponse<EditorDocument>> {
  await dbConnect();
  const doc = await Document.findOne({ "metadata.id": docId });
  if (!doc) {
    return {
      success: false,
      data: null,
      error: "Document not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  doc.metadata = {
    ...doc.toObject().metadata,
    ...metadata,
    id: doc.metadata.id, // Preserve ID
    updatedAt: now(),
    lastEditedBy: session.userId,
  };

  try {
    await doc.save();

    revalidatePath("/docs-admin");
    revalidatePath(`/docs-admin/edit/${docId}`);
    if (doc.metadata.status === "published") {
      revalidatePath(`/docs/${doc.metadata.id}`);
      revalidatePath(`/docs`); // For sidebar/list updates
    }

    return {
      success: true,
      data: sanitizeDoc(doc),
      error: null,
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  } catch (error: any) {
    console.error("Error updating document metadata:", error);

    let errorMessage = "Failed to update document metadata";
    if (error.code === 11000) {
      errorMessage = "A document with this title already exists in this category.";
    }

    return {
      success: false,
      data: null,
      error: errorMessage,
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }
}

/**
 * Submit document for review
 */
export async function submitForReview(
  session: EditorSession,
  docId: string
): Promise<ApiResponse<EditorDocument>> {
  await dbConnect();
  const doc = await Document.findOne({ "metadata.id": docId });
  if (!doc) {
    return {
      success: false,
      data: null,
      error: "Document not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  if (doc.metadata.status !== "draft") {
    return {
      success: false,
      data: null,
      error: "Only drafts can be submitted for review",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  // Validate before submission
  const validation = await validateDocument(docId);
  if (!validation.success || !validation.data?.passed) {
    return {
      success: false,
      data: null,
      error: `Validation failed: ${validation.data?.errors.join(", ")}`,
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  doc.metadata.status = "in_review";
  doc.metadata.updatedAt = now();
  await doc.save();

  revalidatePath("/docs-admin");
  revalidatePath(`/docs-admin/edit/${docId}`);

  return {
    success: true,
    data: sanitizeDoc(doc),
    error: null,
    environment: "sandbox",
    timestamp: now(),
    requestId: generateId(),
  };
}

/**
 * Publish document (admin only)
 */
export async function publishDocument(
  session: EditorSession,
  docId: string
): Promise<ApiResponse<{ mdxContent: string; filePath: string; status: string }>> {
  if (!session.permissions.canPublish) {
    return {
      success: false,
      data: null,
      error: "Permission denied: Only admins can publish",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  await dbConnect();
  const doc = await Document.findOne({ "metadata.id": docId });
  if (!doc) {
    return {
      success: false,
      data: null,
      error: "Document not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  // Final validation
  const validation = await validateDocument(docId);
  if (!validation.success || !validation.data?.passed) {
    return {
      success: false,
      data: null,
      error: `Cannot publish: ${validation.data?.errors.join(", ")}`,
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  // Generate MDX
  const mdxContent = generateMdxFromBlocks(sanitizeDoc(doc));

  try {
    // Update status and store generated MDX in DB
    doc.metadata.status = "published";
    doc.metadata.updatedAt = now();
    doc.generatedMdx = mdxContent; // Store it for faster rendering
    await doc.save();

    revalidatePath("/docs-admin");
    revalidatePath(`/docs-admin/edit/${docId}`);
    revalidatePath(`/docs/${doc.metadata.id}`);
    revalidatePath("/docs", "layout"); // Update public sidebar/listings

    return {
      success: true,
      data: { mdxContent, filePath: "database_stored", status: "published" },
      error: null,
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  } catch (err) {
    console.error("Failed to publish to database:", err);
    return {
      success: false,
      data: null,
      error: `Failed to save to database: ${err instanceof Error ? err.message : String(err)}`,
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }
}

/**
 * Set a document as the default landing page
 */
export async function setDefaultDocument(
  session: EditorSession,
  docId: string
): Promise<ApiResponse<EditorDocument>> {
  if (session.role !== "admin") {
    return {
      success: false,
      data: null,
      error: "Permission denied: Only admins can set default document",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  await dbConnect();

  // Reset all defaults first
  await Document.updateMany({}, { "metadata.isDefault": false });

  // Set the new default
  const doc = await Document.findOneAndUpdate(
    { "metadata.id": docId },
    { $set: { "metadata.isDefault": true } },
    { new: true }
  );

  if (!doc) {
    return {
      success: false,
      data: null,
      error: "Document not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/docs", "layout");

  return {
    success: true,
    data: sanitizeDoc(doc),
    error: null,
    environment: "production",
    timestamp: now(),
    requestId: generateId(),
  };
}

/**
 * Validate document
 */
export async function validateDocument(
  docId: string
): Promise<ApiResponse<{ passed: boolean; errors: string[]; warnings: string[] }>> {
  await dbConnect();
  const doc = await Document.findOne({ "metadata.id": docId });
  if (!doc) {
    return {
      success: false,
      data: null,
      error: "Document not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required metadata
  if (!doc.metadata.title) errors.push("Title is required");
  if (!doc.metadata.description) errors.push("Description is required");
  if (!doc.metadata.category) errors.push("Category is required");

  // Check forbidden terms
  const forbiddenTerms = [
    "tbo",
    "amadeus",
    "brightsun",
    "vendor",
    "third-party api",
    "external api",
    "partner api",
  ];

  const content = JSON.stringify(doc.blocks);
  const title = doc.metadata.title;
  const desc = doc.metadata.description;

  for (const term of forbiddenTerms) {
    // Create regex that treats any non-letter as a boundary.
    // This catches "tbo" in "tbo_id", "tbo1", "tbo.import"
    // But ignores "tbo" in "outbound" (surrounded by letters)
    // We use (?:^|[^a-zA-Z]) instead of lookbehind for maximum compatibility
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-zA-Z])${escapedTerm}(?:$|[^a-zA-Z])`, "i");

    if (regex.test(content) || regex.test(title) || regex.test(desc)) {
      errors.push(`Forbidden term found: "${term}"`);
    }
  }

  // Check for API docs sections (if category is flights, hotels, or bookings)
  const apiCategories = ["flights", "hotels", "bookings"];
  if (apiCategories.includes(doc.metadata.category)) {
    const blockTypes = (doc.blocks as EditorBlock[]).map((b) => b.type);

    if (!blockTypes.includes("api-request")) {
      warnings.push("API documentation should include an API Request block");
    }
    if (!blockTypes.includes("api-response")) {
      warnings.push("API documentation should include an API Response block");
    }
  }

  // Check minimum content
  if (doc.blocks.length === 0) {
    errors.push("Document has no content");
  }

  // Check MDX compilation validity
  try {
    const mdx = generateMdxFromBlocks(sanitizeDoc(doc));
    await compileMDX({
      source: mdx,
      options: { parseFrontmatter: true }, // Mimic rendering options
    });
  } catch (error: any) {
    errors.push(`MDX Compilation failed: ${error.message || "Unknown error"}`);
    // Also add warning to help debug
    warnings.push(
      "MDX syntax error detected. Check for unescaped characters or broken expressions."
    );
  }

  return {
    success: true,
    data: {
      passed: errors.length === 0,
      errors,
      warnings,
    },
    error: null,
    environment: "sandbox",
    timestamp: now(),
    requestId: generateId(),
  };
}

/**
 * Generate MDX preview
 */
export async function generatePreview(docId: string): Promise<ApiResponse<string>> {
  await dbConnect();
  const doc = await Document.findOne({ "metadata.id": docId });
  if (!doc) {
    return {
      success: false,
      data: null,
      error: "Document not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  const mdx = generateMdxFromBlocks(sanitizeDoc(doc));

  return {
    success: true,
    data: mdx,
    error: null,
    environment: "sandbox",
    timestamp: now(),
    requestId: generateId(),
  };
}

/**
 * Delete a document
 */
export async function deleteDocument(
  session: EditorSession,
  docId: string
): Promise<ApiResponse<null>> {
  if (!session.permissions.canDelete) {
    return {
      success: false,
      data: null,
      error: "Permission denied: Cannot delete documents",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  await dbConnect();

  // Find doc first to get category/slug for revalidation
  const doc = await Document.findOne({ "metadata.id": docId });
  if (!doc) {
    return {
      success: false,
      data: null,
      error: "Document not found",
      environment: "sandbox",
      timestamp: now(),
      requestId: generateId(),
    };
  }

  // Delete the document
  await Document.deleteOne({ "metadata.id": docId });

  // Revalidate relevant paths
  revalidatePath("/docs-admin");
  revalidatePath(`/docs-admin/edit/${docId}`); // Although page will 404, good to clear cache
  if (doc.metadata.id) {
    revalidatePath(`/docs/${doc.metadata.id}`);
    revalidatePath("/docs", "layout");
  }

  // If it was default, no default exists anymore (or we handle it elswhere)
  if (doc.metadata.isDefault) {
    revalidatePath("/", "layout");
  }

  return {
    success: true,
    data: null,
    error: null,
    environment: "production",
    timestamp: now(),
    requestId: generateId(),
  };
}
