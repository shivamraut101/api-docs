import { getLandingDoc } from "@/app/lib/actions/docs";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/docs/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { ArrowRight, Building2, Globe, Plane, Shield, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const [session, landingResult] = await Promise.all([auth(), getLandingDoc()]);
  const landingTarget =
    landingResult.success && landingResult.data ? landingResult.data.target : "/docs";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={session?.user} landingTarget={landingTarget} hideSearch={true} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="from-primary/5 via-background to-background absolute inset-0 bg-gradient-to-br" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />

        <div className="relative container px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-amber-500" />v
              {SITE_CONFIG.version} — Sandbox Active
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Primexmeta
              <span className="from-primary to-primary/60 block bg-gradient-to-r bg-clip-text text-transparent">
                Travel API
              </span>
            </h1>

            <p className="text-muted-foreground mb-8 text-lg md:text-xl">
              A unified, enterprise-grade API for flights, hotels, and travel bookings. Single
              integration. Optimized results. Seamless experience.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href={landingTarget}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b py-16 md:py-24">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Platform Capabilities</h2>
            <p className="text-muted-foreground">
              Everything you need to build world-class travel applications
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Plane,
                title: "Flight Search & Booking",
                description:
                  "Real-time search with optimized results from multiple sources, normalized into a single contract",
              },
              {
                icon: Building2,
                title: "Hotel Inventory",
                description:
                  "Access millions of hotel rooms worldwide with best-price optimization",
              },
              {
                icon: ShoppingCart,
                title: "Unified Booking Flow",
                description:
                  "Consistent booking experience with deterministic behavior across all operations",
              },
              {
                icon: Zap,
                title: "Server Actions",
                description: "Modern React Server Actions for type-safe, secure API interactions",
              },
              {
                icon: Shield,
                title: "Sandbox Environment",
                description:
                  "Test and develop safely in our comprehensive sandbox environment with deterministic results",
              },
              {
                icon: Globe,
                title: "Multi-Source Optimized",
                description:
                  "Primexmeta automatically selects the best available source for each request",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-card hover:border-primary/50 rounded-xl border p-6 transition-all"
              >
                <feature.icon className="text-primary mb-4 h-10 w-10" />
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Jump into our comprehensive documentation and start building your travel application
              today.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/docs/getting-started/quick-start">
                  Quick Start Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/authentication/overview">Authentication</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Primexmeta. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href={landingTarget}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Documentation
            </Link>
            <Link
              href={SITE_CONFIG.github}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
