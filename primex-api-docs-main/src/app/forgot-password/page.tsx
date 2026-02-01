"use client";

import { requestPasswordReset } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [message, formAction, isPending] = useActionState(requestPasswordReset, undefined);

  useEffect(() => {
    if (message) {
      if (message.toLowerCase().includes("sent")) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    }
  }, [message]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="bg-card w-full max-w-md space-y-8 rounded-2xl border p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Primexmeta"
              width={180}
              height={40}
              className="mb-4 h-10 w-auto"
              priority
            />
          </Link>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email to receive a temporary password.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full text-base font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Temporary Password"
            )}
          </Button>

          {message && (
            <div
              className={cn(
                "rounded-md border p-3 text-center text-xs font-medium",
                message.toLowerCase().includes("sent")
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              )}
            >
              {message}
            </div>
          )}

          <div className="text-center">
            <Button variant="link" asChild className="gap-2">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign in
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
