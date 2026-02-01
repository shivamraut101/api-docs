"use client";

import { changePassword } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

interface ChangePasswordFormProps {
  email: string;
  isTemporaryPassword?: boolean;
}

export function ChangePasswordForm({ email, isTemporaryPassword }: ChangePasswordFormProps) {
  const [errorMessage, formAction, isPending] = useActionState(changePassword, undefined);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
    }
  }, [errorMessage]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="bg-card w-full max-w-md space-y-8 rounded-2xl border p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Change Password</h1>
          <p className="text-muted-foreground text-sm">
            Please update your temporary password to continue.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          <input type="hidden" name="email" value={email} />

          <div className="space-y-4">
            {!isTemporaryPassword && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>
            )}
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
                Updating...
              </>
            ) : (
              "Update Password"
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
