import { getLandingDoc } from "@/app/lib/actions/docs";
import { auth } from "@/auth";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { SiteHeader } from "@/components/docs/SiteHeader";

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const landingResult = await getLandingDoc();
  const landingTarget = landingResult.success && landingResult.data ? landingResult.data.target : "/docs";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={session?.user} landingTarget={landingTarget} />
      <div className="container flex-1">
        <div className="flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <DocsSidebar />
          <main className="relative py-6 lg:gap-10 lg:py-8">
            <div className="mx-auto w-full min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
