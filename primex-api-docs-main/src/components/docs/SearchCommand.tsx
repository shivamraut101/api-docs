"use client";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { initializeSearch, isSearchInitialized, searchDocs } from "@/lib/search";
import { FileText, Hash, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

interface SearchResult {
  title: string;
  href: string;
  section: string;
  type: "page" | "heading";
  snippet?: string;
}

export function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isIndexing, setIsIndexing] = React.useState(false);
  const router = useRouter();
  const initRef = React.useRef(false);

  // Initialize search index
  const initialize = React.useCallback(async () => {
    if (isSearchInitialized() || initRef.current) return;

    initRef.current = true;
    setIsIndexing(true);
    try {
      const { getDocsForSearchIndex } = await import("@/app/lib/actions/search");
      const result = await getDocsForSearchIndex();
      if (result.success && result.data) {
        await initializeSearch(result.data);
      }
    } catch (error) {
      console.error("Search initialization failed:", error);
      initRef.current = false; // Allow retry on failure
    } finally {
      setIsIndexing(false);
    }
  }, []);

  // Keyboard shortcut to open search
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Initialize when dialog opens
  React.useEffect(() => {
    if (open) {
      initialize();
    }
  }, [open, initialize]);

  // Search logic
  React.useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchHits = await searchDocs(query);

        const mappedResults: SearchResult[] = searchHits.hits.map((hit) => ({
          title: hit.document.title as string,
          href: hit.document.url as string,
          section: hit.document.section as string,
          type: "page",
          snippet: hit.document.description as string,
        }));

        setResults(mappedResults);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const navigateTo = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        className="text-muted-foreground flex w-full items-center gap-2 transition-all sm:w-auto md:w-64"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">Search docs...</span>
        <kbd className="bg-muted pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Type to search documentation..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {(loading || isIndexing) && (
            <div className="flex flex-col items-center justify-center gap-2 py-6">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              {isIndexing && (
                <span className="text-muted-foreground animate-pulse text-xs">
                  Initializing search index...
                </span>
              )}
            </div>
          )}

          {!isIndexing && query && results.length === 0 && !loading && (
            <CommandEmpty>No results found for &quot;{query}&quot;.</CommandEmpty>
          )}

          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem
                  key={result.href}
                  value={result.title}
                  onSelect={() => navigateTo(result.href)}
                  className="flex items-center gap-3 py-3"
                >
                  {result.type === "page" ? (
                    <FileText className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Hash className="text-muted-foreground h-4 w-4" />
                  )}
                  <div className="flex flex-1 flex-col truncate">
                    <span className="font-medium">{result.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs font-semibold uppercase">
                        {result.section}
                      </span>
                      {result.snippet && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground truncate text-xs">
                            {result.snippet}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
