import Link from "next/link";

type Segment = {
  label: string;
  href?: string;
};

export function Breadcrumb({ segments }: { segments: Segment[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={segment.label} className="inline-flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-border" aria-hidden="true">
                /
              </span>
            )}
            {isLast || !segment.href ? (
              <span className="text-fg/70">{segment.label}</span>
            ) : (
              <Link href={segment.href} className="hover:text-fg transition-colors">
                {segment.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
