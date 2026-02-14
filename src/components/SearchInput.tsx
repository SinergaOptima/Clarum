import { Input } from "@/components/ui/Input";

export function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  resultCount,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  resultCount?: number;
}) {
  const handleClear = () => onChange("");

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "Search"}
        aria-label={ariaLabel ?? placeholder ?? "Search"}
        className="pr-20"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted hover:text-fg hover:bg-border/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label="Clear search"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      {resultCount !== undefined && value && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-muted">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </div>
      )}
    </div>
  );
}
