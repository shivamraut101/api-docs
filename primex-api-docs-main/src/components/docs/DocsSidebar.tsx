"use client";

import { getCategories } from "@/app/lib/actions/categories";
import { getPublishedDocs } from "@/app/lib/actions/docs";
import { useDocs } from "@/components/docs/DocsContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const sectionIcons: Record<string, React.ElementType> = {
  "Getting Started": BookOpen,
};

interface NavItem {
  title: string;
  href: string;
  label?: string;
  order: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function DocsSidebar() {
  const pathname = usePathname();
  const { version } = useDocs();
  const [publishedFromDb, setPublishedFromDb] = React.useState<
    {
      id: string;
      title: string;
      category: string;
      slug: string;
      apiStatus?: string;
      version?: string;
      order?: number;
    }[]
  >([]);
  const [categories, setCategories] = React.useState<{ title: string; slug: string }[]>([]);

  // Fetch published docs and categories from DB
  React.useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const [docsResult, categoriesResult] = await Promise.all([
          getPublishedDocs(),
          getCategories(),
        ]);

        if (!mounted) return;

        if (docsResult.success && Array.isArray(docsResult.data)) {
          setPublishedFromDb(docsResult.data);
        }

        if (categoriesResult.success && Array.isArray(categoriesResult.data)) {
          setCategories(categoriesResult.data.map((c: any) => ({ title: c.title, slug: c.slug })));
        }
      } catch (err) {
        console.error("Failed to fetch sidebar data:", err);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  // Compute dynamic navigation structure
  const navStructure = React.useMemo(() => {
    const grouped: Record<string, NavItem[]> = {};

    // Category display name mapping from DB categories
    const categoryMap: Record<string, string> = {};
    categories.forEach((c) => {
      categoryMap[c.slug] = c.title;
    });

    // DB published docs (client-fetched)
    publishedFromDb.forEach((d) => {
      // Filter by version (if doc version is not set, assume v1)
      const docVersion = d.version || "v1";
      if (docVersion !== version) return;

      const rawCategory = (d.category || "uncategorized").toLowerCase();
      const categoryLabel =
        categoryMap[rawCategory] ||
        (d.category ? d.category.charAt(0).toUpperCase() + d.category.slice(1) : "Misc");

      if (!grouped[categoryLabel]) grouped[categoryLabel] = [];

      const href = `/docs/${d.id}`;

      const exists = grouped[categoryLabel].some((it) => it.href === href || it.href === d.id);
      if (!exists) {
        grouped[categoryLabel].push({
          title: d.title,
          href,
          label: d.apiStatus === "beta" ? "beta" : undefined,
          order: d.order || 999,
        });
      }
    });

    // Create sections array
    const sections: NavSection[] = Object.entries(grouped).map(([title, items]) => ({
      title,
      items: items.sort((a, b) => a.order - b.order),
    }));

    // Sort sections based on DB category order if possible, otherwise alphabetical
    const catSlugsInOrder = categories.map((c) => c.title);

    return sections.sort((a, b) => {
      const indexA = catSlugsInOrder.indexOf(a.title);
      const indexB = catSlugsInOrder.indexOf(b.title);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [publishedFromDb, categories, version]);

  return (
    <aside className="bg-background/95 supports-backdrop-filter:bg-background/60 fixed top-14 left-0 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 border-r backdrop-blur md:sticky md:block">
      <ScrollArea className="h-full py-6 pr-6 lg:py-8">
        <nav className="space-y-6 pl-4">
          {navStructure.map((section) => {
            const SectionIcon = sectionIcons[section.title] || FileText;
            return (
              <div key={section.title}>
                {/* Section Header */}
                <div className="mb-2 flex items-center gap-2 px-2">
                  <SectionIcon className="text-muted-foreground h-4 w-4" />
                  <h4 className="text-foreground text-sm font-semibold">{section.title}</h4>
                </div>

                {/* Section Items */}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all",
                            isActive
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <ChevronRight
                            className={cn(
                              "h-3 w-3 transition-transform",
                              isActive && "text-primary"
                            )}
                          />
                          {item.title}
                          {item.label && (
                            <span className="bg-primary/10 text-primary ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium">
                              {item.label}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
