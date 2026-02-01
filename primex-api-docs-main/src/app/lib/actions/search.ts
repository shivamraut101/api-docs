"use server";

import dbConnect from "@/lib/mongodb";
import Document from "@/models/Document";

export async function searchDocs(query: string) {
  try {
    if (!query) return { success: true, data: [] };

    await dbConnect();
    const docs = await Document.find({
      $or: [
        { "metadata.title": { $regex: query, $options: "i" } },
        { "metadata.description": { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
      "metadata.status": "published",
    })
      .select("metadata.title metadata.slug metadata.category metadata.description")
      .limit(10);

    return {
      success: true,
      data: docs.map((doc) => ({
        title: doc.metadata.title,
        slug: doc.metadata.slug,
        category: doc.metadata.category,
        description: doc.metadata.description,
      })),
    };
  } catch (error) {
    console.error("Search error:", error);
    return { success: false, error: "Failed to search documents." };
  }
}

export async function getDocsForSearchIndex() {
  try {
    await dbConnect();

    // Fetch all published documents
    const docs = await Document.find({
      "metadata.status": "published",
    });

    interface DocBlock {
      type: string;
      content?: string;
      data?: { text?: string };
    }

    interface DocType {
      _id: unknown;
      metadata: {
        id?: string;
        title: string;
        description?: string;
        slug: string;
        category?: string;
      };
      blocks?: DocBlock[];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchData = docs.map((doc: any) => ({
      id: doc.metadata.id || doc._id.toString(),
      title: doc.metadata.title,
      description: doc.metadata.description || "",
      content:
        doc.blocks
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ?.map((b: any) => {
            if (b.type === "text") return b.content || "";
            if (b.type === "heading") return b.data?.text || "";
            return "";
          })
          .join(" ") || "",
      url: `/docs/${doc.metadata.id || doc._id.toString()}`,
      section: doc.metadata.category || "General",
    }));

    return { success: true, data: searchData };
  } catch (err) {
    console.error("Error fetching search data:", err);
    return { success: false, error: "Failed to fetch search data" };
  }
}
