import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "input-field h-11 w-full rounded-lg border bg-bg px-3 text-sm text-fg shadow-inset transition-colors",
        "placeholder:text-muted/75 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50",
        error
          ? "border-danger focus-visible:ring-danger/50"
          : "border-border focus-visible:border-accent/50",
        className
      )}
      aria-invalid={error}
      {...props}
    />
  )
);

Input.displayName = "Input";
