import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SignUp } from "@clerk/nextjs";
import { ClerkSessionRepair } from "@/components/auth/clerk-session-repair";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getSafeRedirectUrl } from "@/lib/safe-redirect";
import { localeAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return {
    title: t("signUpMetaTitle"),
    description: t("signUpMetaDescription"),
    alternates: localeAlternates("/sign-up"),
  };
}

type SignUpPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const redirectUrl = getSafeRedirectUrl(params.redirect_url);

  const { userId } = await auth();
  if (userId) {
    redirect(redirectUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <ClerkSessionRepair />
      <div className="clerk-sign-in-shell w-full max-w-md">
        <SignUp appearance={clerkAppearance} />
      </div>
    </div>
  );
}
