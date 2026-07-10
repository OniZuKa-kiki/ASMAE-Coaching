import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { ClerkSessionRepair } from "@/components/auth/clerk-session-repair";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { getSafeRedirectUrl } from "@/lib/safe-redirect";

export const dynamic = "force-dynamic";

type SignInPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
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
        <SignIn appearance={clerkAppearance} />
      </div>
    </div>
  );
}
