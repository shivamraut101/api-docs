"use server";

import { auth, signIn } from "@/auth";
import { WelcomeEmail } from "@/components/emails/WelcomeEmail";
import { sendEmail } from "@/lib/email-service";
import dbConnect from "@/lib/mongodb";
import { absoluteUrl } from "@/lib/utils";
import User from "@/models/User";
import { compare, hash } from "bcryptjs";
import crypto from "crypto";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import React from "react";

export async function authenticate(prevState: string | null | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      redirect: false,
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // After successful sign-in, check the user's status
    await dbConnect();
    const email = formData.get("email") as string;
    const user = await User.findOne({ email });

    if (user?.isTemporaryPassword) {
      revalidatePath("/change-password");
      redirect("/change-password");
    } else {
      revalidatePath("/docs", "layout");
      revalidatePath("/", "layout");
      redirect("/docs");
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function signOutAction() {
  await import("@/auth").then((m) => m.signOut({ redirectTo: "/login" }));
}

export async function changePassword(prevState: string | null | undefined, formData: FormData) {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const email = formData.get("email") as string;

  if (newPassword !== confirmPassword) {
    return "New passwords do not match.";
  }

  // Validate password length
  if (newPassword.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return "User not found.";
    }

    // Only verify current password if it's NOT a temporary password
    if (!user.isTemporaryPassword) {
      const passwordsMatch = await compare(currentPassword, user.password);
      if (!passwordsMatch) {
        return "Incorrect current password.";
      }
    }

    const hashedPassword = await hash(newPassword, 12);

    user.password = hashedPassword;
    user.isTemporaryPassword = false;
    await user.save();

    // Force session refresh by signing in again with new credentials
    await signIn("credentials", {
      redirect: false,
      email,
      password: newPassword,
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    return "Failed to update password.";
  }

  revalidatePath("/docs", "layout");
  revalidatePath("/", "layout");
  redirect("/docs");
}

import { ForgotPasswordEmail } from "@/components/emails/ForgotPasswordEmail";

export async function requestPasswordReset(
  prevState: string | null | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;

  try {
    await dbConnect();
    const user = await User.findOne({ email });

    if (user) {
      // Generate temp password
      const tempPassword = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await hash(tempPassword, 12);

      user.password = hashedPassword;
      user.isTemporaryPassword = true;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      const loginUrl = absoluteUrl("/login");

      await sendEmail({
        to: email,
        subject: "Password Reset Request",
        text: `Your password has been reset.\n\nTemporary Password: ${tempPassword}\n\nPlease log in at ${loginUrl}`,
        react: React.createElement(ForgotPasswordEmail, {
          name: user.name,
          email,
          tempPassword,
          loginUrl,
        }),
      });
    }

    // Always return success to prevent email enumeration
    return "If an account exists with that email, we have sent a temporary password.";
  } catch (error) {
    console.error(error);
    return "Something went wrong.";
  }
}

export async function resetPassword(prevState: string | null | undefined, formData: FormData) {
  const token = formData.get("token") as string;
  const email = formData.get("email") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    return "Passwords do not match.";
  }

  try {
    await dbConnect();
    const user = await User.findOne({
      email,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return "Invalid or expired reset token.";
    }

    const hashedPassword = await hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).message === "NEXT_REDIRECT") throw error;
    return "Failed to reset password.";
  }

  redirect("/login");
}

export async function createUser(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const companyName = formData.get("companyName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const country = formData.get("country") as string;
  const website = formData.get("website") as string;
  const affiliateId = formData.get("affiliateId") as string;

  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return { error: "Unauthorized." };
    }

    await dbConnect();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User with this email already exists." };
    }

    // Generate temp password
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await hash(tempPassword, 12);

    const newUser = new User({
      email,
      name,
      companyName,
      phoneNumber,
      country,
      website,
      affiliateId,
      password: hashedPassword,
      role: role || "viewer",
      isTemporaryPassword: true,
    });

    await newUser.save();

    const loginUrl = absoluteUrl("/login");

    // Send email with temp password
    await sendEmail({
      to: email,
      subject: "Welcome to Primexmeta API Docs",
      text: `Your account has been created.\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password at ${loginUrl}`,
      react: React.createElement(WelcomeEmail, {
        name,
        email,
        tempPassword,
        loginUrl,
        companyName,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error("Create User Error:", error);
    return { error: "Failed to create user." };
  }
}

export async function adminUpdatePassword(
  prevState: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const newPassword = formData.get("newPassword") as string;

  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return { error: "Unauthorized." };
    }

    if (!newPassword || newPassword.length < 8) {
      return { error: "Password must be at least 8 characters long." };
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return { error: "User not found." };
    }

    const hashedPassword = await hash(newPassword, 12);
    user.password = hashedPassword;
    user.isTemporaryPassword = true; // Set to true so they are forced to change it again if that's the logic
    await user.save();

    return { success: true };
  } catch (error) {
    console.error("Admin Update Password Error:", error);
    return { error: "Failed to update password." };
  }
}

export async function getUsers() {
  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });
    // Serialize manually if needed or return plain objects
    return { success: true, data: JSON.parse(JSON.stringify(users)) };
  } catch {
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function getUserProfile() {
  try {
    const session = await auth();
    if (!session?.user?.email) return null;

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return null;

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    return null;
  }
}

export async function deleteUser(email: string) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return { error: "Unauthorized." };
    }

    await dbConnect();
    const result = await User.deleteOne({ email });

    if (result.deletedCount === 0) {
      return { error: "User not found." };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete User Error:", error);
    return { error: "Failed to delete user." };
  }
}
