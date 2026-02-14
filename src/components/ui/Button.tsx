import { type ButtonHTMLAttributes, cloneElement, isValidElement, type ReactElement } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "soft";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

const base =
  "btn inline-flex items-center justify-center gap-2 rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100";

const variants = {
  primary:
    "bg-gradient-to-b from-accent/85 to-accent text-bg border-accent/70 shadow-[0_2px_8px_rgba(24,64,118,0.18),0_1px_3px_rgba(18,22,30,0.08)] hover:shadow-[0_8px_24px_rgba(24,64,118,0.22),0_4px_10px_rgba(18,22,30,0.1),0_1px_3px_rgba(18,22,30,0.06)] active:shadow-[inset_0_2px_6px_rgba(18,22,30,0.2),0_1px_2px_rgba(18,22,30,0.06)]",
  ghost: "bg-transparent text-fg border-transparent hover:bg-border/40",
  outline:
    "bg-gradient-to-b from-card to-card/90 text-fg border-border shadow-[0_1px_3px_rgba(18,22,30,0.06),0_1px_2px_rgba(18,22,30,0.04)] hover:shadow-[0_6px_18px_rgba(18,22,30,0.1),0_2px_6px_rgba(18,22,30,0.06)] hover:border-accent/40 active:shadow-[inset_0_2px_6px_rgba(18,22,30,0.15),0_1px_2px_rgba(18,22,30,0.04)]",
  soft: "bg-gradient-to-b from-card to-card/90 text-fg border-border shadow-[0_2px_8px_rgba(18,22,30,0.06),0_1px_3px_rgba(18,22,30,0.04)] hover:shadow-[0_8px_20px_rgba(18,22,30,0.1),0_3px_8px_rgba(18,22,30,0.06)] hover:border-accent/40 active:shadow-[inset_0_2px_6px_rgba(18,22,30,0.15),0_1px_2px_rgba(18,22,30,0.04)]",
};

const sizes = {
  sm: "h-9 px-3 text-sm min-h-[44px] sm:h-9 sm:min-h-0",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return cloneElement(child, {
      className: cn(classes, child.props.className),
    });
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
