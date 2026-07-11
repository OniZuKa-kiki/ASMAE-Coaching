import { cn } from "@/lib/utils";

type ContentSectionProps = {
  children: React.ReactNode;
  variant?: "default" | "band";
  tightTop?: boolean;
  narrow?: boolean;
  className?: string;
  innerClassName?: string;
};

export function ContentSection({
  children,
  variant = "default",
  tightTop = false,
  narrow = false,
  className,
  innerClassName,
}: ContentSectionProps) {
  return (
    <section
      className={cn(
        "section-padding",
        variant === "band" && "bg-card/50",
        tightTop && "!pt-0",
        className
      )}
    >
      <div
        className={cn(
          "container-narrow",
          narrow && "max-w-3xl",
          innerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
