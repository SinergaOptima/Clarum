import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-card/50">
      <div className="page-shell py-10 lg:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-display text-lg tracking-[0.18em] uppercase text-fg">Clarum</div>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Evidence-linked risk dossiers for market-entry decisions.
            </p>
          </div>

          <nav className="grid gap-2 text-sm">
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Navigation</div>
            <Link href="/dossiers" className="text-fg/70 hover:text-fg">
              Dossiers
            </Link>
            <Link href="/evidence" className="text-fg/70 hover:text-fg">
              Evidence
            </Link>
            <Link href="/methodology" className="text-fg/70 hover:text-fg">
              Methodology
            </Link>
            <Link href="/costs" className="text-fg/70 hover:text-fg">
              Costs
            </Link>
            <Link href="/about" className="text-fg/70 hover:text-fg">
              About
            </Link>
          </nav>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted">Lattice Labs</div>
            <p className="mt-2 text-sm text-fg/70">
              Built by Lattice Labs. Structured risk intelligence for complex markets.
            </p>
            <p className="mt-4 text-xs text-muted">
              &copy; {new Date().getFullYear()} Lattice Labs. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
