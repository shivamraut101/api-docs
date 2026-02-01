import { create, insertMultiple, search, type Results } from "@orama/orama";

interface SearchDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  section: string;
}

async function createSearchIndex() {
  return create({
    schema: {
      id: "string",
      title: "string",
      description: "string",
      content: "string",
      url: "string",
      section: "string",
    },
  });
}

type SearchIndex = Awaited<ReturnType<typeof createSearchIndex>>;

let searchIndex: SearchIndex | null = null;
let isInitializing = false;

export function isSearchInitialized() {
  return !!searchIndex;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function initializeSearch(docs: any[]) {
  if (searchIndex || isInitializing) return searchIndex;

  isInitializing = true;
  try {
    const db = await createSearchIndex();

    const documents: SearchDocument[] = docs.map((doc) => ({
      id: doc.id || doc._id,
      title: doc.title,
      description: doc.description || "",
      content: doc.content || doc.body?.raw || "",
      url: doc.url || doc.slug,
      section: doc.section || doc.category || "General",
    }));

    await insertMultiple(db, documents);
    searchIndex = db;
    return db;
  } finally {
    isInitializing = false;
  }
}

export async function searchDocs(query: string): Promise<Results<SearchDocument>> {
  if (!searchIndex) {
    return {
      hits: [],
      count: 0,
      query,
      processingTime: 0,
    } as unknown as Results<SearchDocument>;
  }

  return search(searchIndex, {
    term: query,
    properties: ["title", "description", "content", "section"],
    boost: {
      title: 5,
      description: 2,
      section: 1.5,
      content: 1,
    },
    tolerance: 1,
    limit: 10,
  });
}
