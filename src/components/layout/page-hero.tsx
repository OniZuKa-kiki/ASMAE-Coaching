import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  centered?: boolean;
  className?: string;
};

export function PageHero({
  title,
  subtitle,
  eyebrow,
  centered = true,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "section-padding bg-gradient-to-b from-primary/5 to-transparent",
        className
      )}
    >
      <div className={cn("container-narrow", centered && "text-center")}>
        {eyebrow ? (
          <p className="page-eyebrow mb-4">{eyebrow}</p>
        ) : null}
        <h1 className="page-title mb-6">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
    </section>
  );
}
