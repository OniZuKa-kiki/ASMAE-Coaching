import { cn } from "@/lib/utils";

type AdminFormActionsProps = {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end" | "between";
};

const alignClass = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
} as const;

export function AdminFormActions({
  children,
  className,
  align = "start",
}: AdminFormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 pt-1",
        alignClass[align],
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminPrimaryButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function AdminOutlineButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function AdminDangerButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors",
        className
      )}
      {...props}
    />
  );
}
