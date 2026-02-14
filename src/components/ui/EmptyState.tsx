import { type ReactNode } from "react";
import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  icon,
  action,
  actionLabel,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
      {icon && (
        <div className="mb-4 rounded-full bg-accent/10 p-4 text-accent">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-fg">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      )}
      {action && actionLabel && (
        <div className="mt-6">
          <Button onClick={action} variant="outline">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function SearchEmptyIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export function FileEmptyIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}
