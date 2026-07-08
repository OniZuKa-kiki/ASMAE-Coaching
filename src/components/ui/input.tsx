import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border bg-card px-4 py-3 text-heading placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-border bg-card px-4 py-3 text-heading placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 min-h-[120px] resize-y",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-heading mb-2", className)}
      {...props}
    >
      {children}
    </label>
  );
}
