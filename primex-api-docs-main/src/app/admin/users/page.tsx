import { getUsers } from "@/app/lib/actions";
import { auth } from "@/auth";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirect } from "next/navigation";

import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { UpdateUserPasswordDialog } from "@/components/admin/UpdateUserPasswordDialog";

export default async function AdminUsersPage() {
  const session = await auth();

  // Secondary check (Middleware should catch this, but safe to keep)
  if (session?.user?.role !== "admin") {
    redirect("/docs");
  }

  const result = await getUsers();
  const users = result.success ? result.data : [];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <CreateUserForm />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User / Agency</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No B2B users found.
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              users.map((user: any) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium">{user.name || "N/A"}</span>
                      <span className="text-muted-foreground text-xs">
                        {user.companyName || "No Agency"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{user.email}</span>
                      <span className="text-muted-foreground">
                        {user.phoneNumber || "No Phone"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{user.country || "N/A"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isTemporaryPassword ? (
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        Temp Password
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <UpdateUserPasswordDialog email={user.email} />
                      <DeleteUserButton email={user.email} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
