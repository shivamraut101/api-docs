"use client";

import { adminUpdatePassword } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

interface UpdateUserPasswordDialogProps {
  email: string;
}

export function UpdateUserPasswordDialog({ email }: UpdateUserPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(adminUpdatePassword, { success: false });

  useEffect(() => {
    if (state?.success && open) {
      toast.success(`Password updated for ${email}`);
      setTimeout(() => {
        setOpen(false);
      }, 0);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, email, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
        >
          <KeyRound className="h-4 w-4" />
          <span className="sr-only">Update Password</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Password</DialogTitle>
          <DialogDescription>
            Update password for <strong>{email}</strong>. The user will be required to change it
            upon their next login.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="email" value={email} />
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
