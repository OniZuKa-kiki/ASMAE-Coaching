"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Settings, Shield } from "lucide-react";
import { adminUrl } from "@/lib/admin-path";

export function UserAccountButton() {
  const { user } = useUser();
  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    (user?.unsafeMetadata as { role?: string } | undefined)?.role === "admin";

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="مساحتي"
          labelIcon={<Settings className="size-4" />}
          href="/dashboard"
        />
        {isAdmin && (
          <UserButton.Link
            label="الإدارة"
            labelIcon={<Shield className="size-4" />}
            href={adminUrl()}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  );
}
