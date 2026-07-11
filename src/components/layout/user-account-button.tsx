"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Settings, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { adminUrl } from "@/lib/admin-path";
import { clerkAppearance } from "@/lib/clerk-appearance";

export function UserAccountButton() {
  const { user } = useUser();
  const tNav = useTranslations("nav");
  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    (user?.unsafeMetadata as { role?: string } | undefined)?.role === "admin";

  return (
    <UserButton appearance={clerkAppearance}>
      <UserButton.MenuItems>
        <UserButton.Link
          label={tNav("mySpace")}
          labelIcon={<Settings className="size-4" />}
          href="/dashboard"
        />
        {isAdmin && (
          <UserButton.Link
            label={tNav("adminPanel")}
            labelIcon={<Shield className="size-4" />}
            href={adminUrl()}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  );
}
