"use client";

import { resetPassword } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useEffect } from "react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [errorMessage, formAction, isPending] = useActionState(resetPassword, undefined);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  if (!token || !email) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="bg-destructive/10 mb-4 rounded-full p-4">
          <AlertCircle className="text-destructive h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Invalid Link</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The password reset link is invalid or has expired. Please request a new one.
        </p>
        <Button variant="outline" className="mt-8" asChild>
          <a href="/forgot-password">Request Reset Link</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="bg-card w-full max-w-md space-y-8 rounded-2xl border p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground text-sm">Enter your new password below.</p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
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
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          {errorMessage && (
            <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
              <p className="text-destructive text-center text-xs font-medium">{errorMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
