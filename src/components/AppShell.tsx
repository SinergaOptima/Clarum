"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useId, useState } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { isExportBundleAvailable } from "@/data/loaders";

const navLinks = [
  { href: "/dossiers", label: "Dossiers" },
  { href: "/evidence", label: "Evidence" },
  { href: "/methodology", label: "Methodology" },
  { href: "/costs", label: "Costs" },
  { href: "/about", label: "About" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const mobileNavId = useId();
  const pathname = usePathname();

  useEffect(() => {
    let isActive = true;
    async function checkExport() {
      const available = await isExportBundleAvailable();
      if (isActive) setIsDemoMode(!available);
    }
    checkExport();
    return () => {
      isActive = false;
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to top and close menu on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen text-fg">
      <div className="theme-bg" />
      <ScrollProgress />
      <CommandPalette open={isPaletteOpen} onOpenChange={setIsPaletteOpen} />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/85 shadow-flush backdrop-blur-lg">
        <div className="page-shell flex items-center justify-between py-4 lg:py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="brand-mark" aria-label="Clarum home">
              <span className="brand-mark-text">Clarum</span>
              <span className="brand-mark-bar" aria-hidden="true" />
            </Link>
          </div>
          <nav className="relative hidden items-center gap-5 text-xs tracking-[0.25em] text-fg/80 uppercase md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link key={link.href} className="relative py-1 hover:text-fg" href={link.href}>
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted shadow-flush transition hover:border-accent/40 hover:text-fg"
              aria-label="Open search (Ctrl+K)"
              onClick={() => setIsPaletteOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <ThemeToggle />
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-xs tracking-[0.2em] uppercase shadow-flush md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileNavId}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              Menu
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id={mobileNavId}
            className="page-shell pt-0 pb-4 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden" }}
          >
            <nav className="card-pad grid gap-2 rounded-xl border border-border bg-card text-sm shadow-raised">
              <Link className="hover:text-fg" href="/" onClick={closeMobileMenu}>
                Home
              </Link>
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    className={`hover:text-fg ${isActive ? "text-accent font-medium" : ""}`}
                    href={link.href}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <button
                type="button"
                className="mt-1 text-left text-muted hover:text-fg"
                onClick={() => {
                  closeMobileMenu();
                  setIsPaletteOpen(true);
                }}
              >
                Search...
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <div>
        <main className="min-w-0">{children}</main>
        {isDemoMode ? (
          <div className="page-shell pt-0">
            <div className="mt-10 text-xs text-muted">DEMO MODE</div>
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
