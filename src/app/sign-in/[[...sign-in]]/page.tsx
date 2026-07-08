import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center section-padding bg-background">
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}
