import { getLandingDoc } from "@/app/lib/actions/docs";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DocsPage() {
  const result = await getLandingDoc();

  if (result.success && result.data) {
    redirect(result.data.target);
  }

  // Fallback if no docs are published or if database is empty
  // Fallback if no docs are published or if database is empty
  // redirect("/");
  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <h3 className="text-muted-foreground text-lg font-medium">No documentation found.</h3>
      <p className="text-muted-foreground mt-2 text-sm">
        Please publish some documents to see them here.
      </p>
    </div>
  );
}
