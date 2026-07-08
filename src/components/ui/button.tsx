import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold text-base transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-hover shadow-soft px-[30px] py-[14px]",
        secondary:
          "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white px-[30px] py-[14px]",
        ghost: "text-primary hover:bg-primary/10 px-4 py-2",
        accent:
          "bg-accent text-white hover:bg-accent/90 shadow-soft px-[30px] py-[14px]",
      },
      size: {
        default: "",
        sm: "text-sm px-5 py-2.5",
        lg: "text-lg px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
}: {
  href: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(buttonVariants({ variant, size, className }))}
    >
      {children}
    </a>
  );
}
