import { getEditorSession, listDocuments } from "@/app/actions/editor.actions";
import { SiteHeader } from "@/components/docs/SiteHeader";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Docs Editor | Primexmeta",
  description: "Internal documentation editor for Primexmeta API",
  robots: { index: false, follow: false }, // Non-indexable
};

export default async function DocsAdminLayout({ children }: { children: React.ReactNode }) {
  // Get session from existing auth system
  const session = await getEditorSession();

  // Redirect if not authenticated or not authorized
  if (!session.success || !session.data) {
    redirect("/login?redirect=/docs-admin");
  }

  // Check if user has at least viewer permissions
  if (session.data.role === "viewer" && !session.data.permissions.canEdit) {
    redirect("/unauthorized");
  }

  // Fetch documents for the sidebar
  const docsResult = await listDocuments(session.data);
  const documents = docsResult.success && docsResult.data ? docsResult.data : [];

  return (
    <div className="bg-background flex h-screen flex-col">
      <SiteHeader user={session.data} />
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <EditorSidebar session={session.data} documents={documents} />

        {/* Editor Area */}
        <main className="bg-muted/10 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
