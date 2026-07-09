import { Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminFormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
};

export function AdminFormField({
  label,
  htmlFor,
  hint,
  className,
  children,
}: AdminFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-text/60">{hint}</p> : null}
    </div>
  );
}
