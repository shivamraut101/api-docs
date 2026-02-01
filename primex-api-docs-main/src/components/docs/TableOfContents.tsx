"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { Heading } from "@/lib/types";
import { cn } from "@/lib/utils";
import * as React from "react";

interface TableOfContentsProps {
  headings: Heading[];
  className?: string;
}

export function TableOfContents({ headings, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%", threshold: 1.0 }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn("sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 xl:block", className)}
    >
      <ScrollArea className="h-full py-6 pl-6">
        <div className="space-y-2">
          <p className="text-foreground text-sm font-semibold">On this page</p>
          <nav className="space-y-1">
            {headings.map((heading, index) => (
              <a
                key={`${heading.slug}-${index}`}
                href={`#${heading.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.slug);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                    window.history.pushState(null, "", `#${heading.slug}`);
                  }
                }}
                className={cn(
                  "hover:text-foreground block text-sm transition-colors",
                  heading.level === 3 && "pl-3",
                  heading.level === 4 && "pl-6",
                  activeId === heading.slug ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
}
