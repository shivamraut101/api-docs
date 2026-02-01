"use client";

import { SearchCommand } from "@/components/docs";
import { UserNav } from "@/components/shared/UserNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EditorSession } from "@/lib/editor-types";
import { ArrowLeft, Eye, Moon, Save, Send, Sun, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface EditorHeaderProps {
  session: EditorSession;
  documentTitle?: string;
  isSaving?: boolean;
  hasChanges?: boolean;
  isPublished?: boolean;
  onSave?: () => void;
  onSubmitReview?: () => void;
  onPublish?: () => void;
}

export function EditorHeader({
  session,
  documentTitle,
  isSaving,
  hasChanges,
  isPublished,
  onSave,
  onSubmitReview,
  onPublish,
}: EditorHeaderProps) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  // Extract docId from /docs-admin/edit/[id]
  const docIdMatch = pathname.match(/\/docs-admin\/edit\/([^/]+)/);
  const docId = docIdMatch ? docIdMatch[1] : null;

  return (
    <header className="bg-card flex h-14 items-center justify-between border-b px-4">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/docs-admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-semibold">Docs Editor</span>
          {documentTitle && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{documentTitle}</span>
            </>
          )}
        </div>

        {hasChanges && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
            Unsaved changes
          </Badge>
        )}

        {isPublished && hasChanges && (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
            New Draft
          </Badge>
        )}
      </div>

      {/* Center - Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden w-64 md:block">
          <SearchCommand />
        </div>

        <div className="flex items-center gap-2">
          {onSave && (
            <Button variant="outline" size="sm" onClick={onSave} disabled={isSaving || !hasChanges}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
          )}

          <Button variant="outline" size="sm" asChild>
            <Link
              href={docId ? `/docs-admin/preview?id=${docId}` : "/docs-admin/preview"}
              target="_blank"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>

          {session.permissions.canEdit && onSubmitReview && (
            <Button variant="outline" size="sm" onClick={onSubmitReview}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
          )}

          {session.permissions.canPublish && onPublish && (
            <Button size="sm" onClick={onPublish}>
              <Upload className="mr-2 h-4 w-4" />
              {isPublished ? "Republish" : "Publish"}
            </Button>
          )}
        </div>
      </div>

      {/* Right - User \u0026 Theme */}
      <div className="flex items-center gap-3">
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

        <Badge
          variant="outline"
          className={
            session.role === "admin"
              ? "bg-purple-500/10 text-purple-500"
              : "bg-blue-500/10 text-blue-500"
          }
        >
          {session.role}
        </Badge>
        <UserNav user={{ name: session.name, email: session.email, role: session.role }} />
      </div>
    </header>
  );
}
