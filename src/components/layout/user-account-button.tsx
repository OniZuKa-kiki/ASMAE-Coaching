"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Settings, Shield } from "lucide-react";
import { adminUrl } from "@/lib/admin-path";
import { clerkAppearance } from "@/lib/clerk-appearance";

export function UserAccountButton() {
  const { user } = useUser();
  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    (user?.unsafeMetadata as { role?: string } | undefined)?.role === "admin";

  return (
    <UserButton appearance={clerkAppearance}>
      <UserButton.MenuItems>
        <UserButton.Link
          label="مساحتي"
          labelIcon={<Settings className="size-4" />}
          href="/dashboard"
        />
        {isAdmin && (
          <UserButton.Link
            label="لوحة الإدارة"
            labelIcon={<Shield className="size-4" />}
            href={adminUrl()}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  );
}
