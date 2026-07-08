import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center section-padding bg-background">
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}
