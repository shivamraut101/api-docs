import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { redirect } from "next/navigation";

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <ChangePasswordForm
      email={session.user.email}
      isTemporaryPassword={session.user.isTemporaryPassword}
    />
  );
}
