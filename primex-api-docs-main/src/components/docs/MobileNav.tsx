"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronRight, FileText, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const sectionIcons: Record<string, React.ElementType> = {
  "Getting Started": BookOpen,
};

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const [publishedFromDb, setPublishedFromDb] = React.useState<
    {
      id: string;
      title: string;
      category: string;
      slug: string;
      apiStatus?: string;
      order?: number;
    }[]
  >([]);
  const [categories, setCategories] = React.useState<{ title: string; slug: string }[]>([]);

  // Fetch published docs and categories from DB
  React.useEffect(() => {
    if (!open) return; // Only fetch when opened
    let mounted = true;

    const fetchData = async () => {
      try {
        const { getPublishedDocs } = await import("@/app/lib/actions/docs");
        const { getCategories } = await import("@/app/lib/actions/categories");

        const [docsRes, catsRes] = await Promise.all([getPublishedDocs(), getCategories()]);

        if (!mounted) return;

        if (docsRes?.success && Array.isArray(docsRes.data)) {
          setPublishedFromDb(docsRes.data as {
            id: string;
            title: string;
            category: string;
            slug: string;
            apiStatus?: string;
            order?: number;
          }[]); 
        }
        if (catsRes?.success && Array.isArray(catsRes.data)) {
          setCategories(catsRes.data.map((c) => ({ title: c.title, slug: c.slug })));
        }
        if (catsRes?.success && Array.isArray(catsRes.data)) {
          setCategories(catsRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch mobile nav data:", err);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [open]);

  // Compute dynamic navigation structure
  const navStructure = React.useMemo(() => {
    const grouped: Record<
      string,
      { title: string; href: string; label?: string; order: number }[]
    > = {};

    // Category display name mapping
    const categoryMap: Record<string, string> = {};
    categories.forEach((c) => {
      categoryMap[c.slug] = c.title;
    });

    // DB published docs
    publishedFromDb.forEach((d) => {
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
    const sections = Object.entries(grouped).map(([title, items]) => ({
      title,
      items: items.sort((a, b) => a.order - b.order),
    }));

    // Sort sections
    const catSlugsInOrder = categories.map((c) => c.title);
    return sections.sort((a, b) => {
      const indexA = catSlugsInOrder.indexOf(a.title);
      const indexB = catSlugsInOrder.indexOf(b.title);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [publishedFromDb, categories]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" suppressHydrationWarning>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader className="px-1 text-left">
          <SheetTitle asChild>
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md text-sm font-bold">
                P
              </div>
              <span className="font-bold">{SITE_CONFIG.name}</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-1">
          <nav className="space-y-6 pt-4">
            {navStructure.map((section) => {
              const SectionIcon = sectionIcons[section.title] || FileText;
              return (
                <div key={section.title}>
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <SectionIcon className="text-muted-foreground h-4 w-4" />
                    <h4 className="text-foreground text-sm font-semibold">{section.title}</h4>
                  </div>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}
