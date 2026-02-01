export const dynamic = "force-dynamic";

import { getEditorSession, listDocuments } from "@/app/actions/editor.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, FilePlus, FileText } from "lucide-react";
import Link from "next/link";

const statusIcons = {
  draft: Clock,
  in_review: AlertCircle,
  published: CheckCircle,
  deprecated: AlertCircle,
};

const statusColors = {
  draft: "bg-amber-500/10 text-amber-500",
  in_review: "bg-blue-500/10 text-blue-500",
  published: "bg-emerald-500/10 text-emerald-500",
  deprecated: "bg-red-500/10 text-red-500",
};

export default async function DocsAdminPage() {
  const session = await getEditorSession();
  if (!session.success || !session.data) return null;

  const docs = await listDocuments(session.data);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentation Editor</h1>
          <p className="text-muted-foreground mt-1">Create and manage API documentation</p>
        </div>

        {session.data.permissions.canCreate && (
          <Button asChild>
            <Link href="/docs-admin/new">
              <FilePlus className="mr-2 h-4 w-4" />
              New Document
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {["draft", "in_review", "published", "deprecated"].map((status) => {
          const count = docs.data?.filter((d) => d.status === status).length || 0;
          const Icon = statusIcons[status as keyof typeof statusIcons];
          return (
            <div key={status} className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2 ${statusColors[status as keyof typeof statusColors]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm capitalize">
                    {status.replace("_", " ")}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document List */}
      <div className="rounded-lg border">
        <div className="bg-muted/50 border-b px-4 py-3">
          <h2 className="font-semibold">Recent Documents</h2>
        </div>

        {docs.data && docs.data.length > 0 ? (
          <div className="divide-y">
            {docs.data.map((doc) => {
              const StatusIcon = statusIcons[doc.status];
              return (
                <Link
                  key={doc.id}
                  href={`/docs-admin/edit/${doc.id}`}
                  className="hover:bg-muted/50 flex items-center gap-4 px-4 py-3 transition-colors"
                >
                  <FileText className="text-muted-foreground h-5 w-5" />
                  <div className="flex-1">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {doc.category} • Updated {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusColors[doc.status]}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {doc.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline">{doc.version}</Badge>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="text-muted-foreground/50 mb-4 h-12 w-12" />
            <h3 className="mb-2 font-semibold">No documents yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Create your first document to get started
            </p>
            {session.data.permissions.canCreate && (
              <Button asChild>
                <Link href="/docs-admin/new">
                  <FilePlus className="mr-2 h-4 w-4" />
                  Create Document
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
