"use client";

import { createUser } from "@/app/lib/actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

export function CreateUserForm() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createUser, { success: false });

  useEffect(() => {
    if (state?.success && open) {
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 0);
    }
  }, [state?.success, open, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New B2B User</DialogTitle>
          <DialogDescription>Create a new agency account for flight API access.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-6 py-4">
            {/* Primary Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@agency.com"
                  required
                />
              </div>
            </div>

            {/* Business Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Agency / Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Travel Masters Ltd"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Contact Number</Label>
                <Input id="phoneNumber" name="phoneNumber" placeholder="+1234567890" required />
              </div>
            </div>

            {/* Geographical & Technical */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" placeholder="United Kingdom" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input id="website" name="website" placeholder="https://agency.com" />
              </div>
            </div>

            {/* Account Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select name="role" defaultValue="viewer">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer (Default)</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="affiliateId">Affiliate ID (Optional)</Label>
                <Input id="affiliateId" name="affiliateId" placeholder="AFF-12345" />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4 flex-col items-start gap-4 sm:flex-col">
            {state?.error && (
              <p className="bg-destructive/10 text-destructive w-full rounded-md p-3 text-center text-sm font-medium">
                {state.error}
              </p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Configuring Account..." : "Create B2B Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
