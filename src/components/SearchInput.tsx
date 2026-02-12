import { Input } from "@/components/ui/Input";

export function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? "Search"}
      aria-label={ariaLabel ?? placeholder ?? "Search"}
    />
  );
}
