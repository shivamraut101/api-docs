"use client";

import { SearchCommand } from "@/components/docs";
import { useDocs } from "@/components/docs/DocsContext";
import { MobileNav } from "@/components/docs/MobileNav";
import { UserNav } from "@/components/shared/UserNav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { API_VERSIONS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Github, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [{ title: "Documentation", href: "/docs/getting-started/introduction" }];

interface SiteHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  } | null;
  landingTarget?: string;
  hideSearch?: boolean; // New prop for Landing Page mode
}

export function SiteHeader({ user, landingTarget, hideSearch = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const { version, setVersion } = useDocs();

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-4">
        {/* Left Side: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center space-x-2">
            <Image
              src="/logo.png"
              alt={SITE_CONFIG.name}
              width={150}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href={landingTarget || "/docs"}
              className={cn(
                "hover:text-foreground shrink-0 text-sm font-medium transition-colors",
                pathname?.startsWith("/docs") ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Documentation
            </Link>

            {/* Version Selector - Hide if landing mode */}
            {!hideSearch && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 shrink-0"
                    suppressHydrationWarning
                  >
                    {version}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {API_VERSIONS.map((v) => (
                    <DropdownMenuItem key={v} onClick={() => setVersion(v)}>
                      {v}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>

        {/* Right Side: Search + Actions */}
        <div className="flex flex-1 items-center justify-end gap-2 md:max-w-md">
          {/* Search - Hide if landing mode */}
          {!hideSearch && (
            <div className="w-full max-w-[280px]">
              <SearchCommand />
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* GitHub */}
          <Button variant="ghost" size="icon" className="hidden shrink-0 sm:flex" asChild>
            <a href={SITE_CONFIG.github} target="_blank" rel="noreferrer noopener">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>

          {/* Mobile Menu - Hide if landing mode */}
          {!hideSearch && <MobileNav />}

          <div className="ml-2 flex items-center">
            <UserNav user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}
