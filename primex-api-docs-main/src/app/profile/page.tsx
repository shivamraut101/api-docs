import { getUserProfile } from "@/app/lib/actions";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/docs/SiteHeader";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, Globe, Hash, Mail, MapPin, Phone, Shield, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userProfile = await getUserProfile();
  const user = userProfile || session.user;

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={session?.user} />
      <main className="bg-muted/30 flex-1 overflow-y-auto">
        <div className="container max-w-5xl py-10">
          <div className="grid gap-8 md:grid-cols-[300px_1fr]">
            {/* Sidebar/Avatar Section */}
            <aside className="space-y-6">
              <Card className="bg-background overflow-hidden border-none shadow-xl">
                <div className="from-primary to-primary/60 h-32 bg-linear-to-r" />
                <div className="relative mt-[-48px] flex flex-col items-center px-6 pb-6">
                  <div className="border-background bg-primary text-primary-foreground flex h-24 w-24 items-center justify-center rounded-full border-4 text-3xl font-bold shadow-lg">
                    {user.name?.[0].toUpperCase()}
                  </div>
                  <h1 className="mt-4 text-xl font-bold">{user.name}</h1>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {user.role}
                  </Badge>
                  <p className="text-muted-foreground mt-2 text-center text-sm">{user.email}</p>
                </div>
              </Card>

              <Card className="bg-background border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button variant="ghost" className="hover:bg-primary/5 justify-start px-2" asChild>
                    <Link href="/docs">
                      <Shield className="text-primary mr-2 h-4 w-4" />
                      Documentation
                    </Link>
                  </Button>
                  {user.role === "admin" && (
                    <Button
                      variant="ghost"
                      className="hover:bg-primary/5 justify-start px-2"
                      asChild
                    >
                      <Link href="/docs-admin">
                        <Building2 className="text-primary mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </Button>
                  )}
                  <LogoutButton />
                </CardContent>
              </Card>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-col gap-6">
              <Card className="bg-background border-none shadow-xl">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your personal details and profile information.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Full Name</p>
                        <p className="text-sm font-medium">{user.name || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Email Address</p>
                        <p className="text-sm font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Account Role</p>
                        <p className="text-sm font-medium capitalize">{user.role}</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Joined At</p>
                        <p className="text-sm font-medium">{joinedDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Agency Details - only show if fields exist */}
                  {(user.companyName ||
                    user.phoneNumber ||
                    user.country ||
                    user.website ||
                    user.affiliateId) && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Agency Details</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {user.companyName && (
                          <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Company</p>
                              <p className="text-sm font-medium">{user.companyName}</p>
                            </div>
                          </div>
                        )}
                        {user.phoneNumber && (
                          <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                              <Phone className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Phone</p>
                              <p className="text-sm font-medium">{user.phoneNumber}</p>
                            </div>
                          </div>
                        )}
                        {user.country && (
                          <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Country</p>
                              <p className="text-sm font-medium">{user.country}</p>
                            </div>
                          </div>
                        )}
                        {user.website && (
                          <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                              <Globe className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Website</p>
                              <p className="text-sm font-medium">{user.website}</p>
                            </div>
                          </div>
                        )}
                        {user.affiliateId && (
                          <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-4">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                              <Hash className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Affiliate ID</p>
                              <p className="text-sm font-medium">{user.affiliateId}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
