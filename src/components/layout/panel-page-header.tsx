import { cn } from "@/lib/utils";

type PanelPageHeaderProps = {
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PanelPageHeader({
  title,
  subtitle,
  actions,
  className,
}: PanelPageHeaderProps) {
  if (actions) {
    return (
      <header className={cn("page-header panel-page-header", className)}>
        <div className="min-w-0">
          <h1 className="page-header-title">{title}</h1>
          {subtitle ? (
            <p className="panel-page-subtitle">{subtitle}</p>
          ) : null}
        </div>
        <div className="shrink-0">{actions}</div>
      </header>
    );
  }

  return (
    <header className={cn("panel-page-header", className)}>
      <h1 className="page-header-title">{title}</h1>
      {subtitle ? <p className="panel-page-subtitle">{subtitle}</p> : null}
    </header>
  );
}
