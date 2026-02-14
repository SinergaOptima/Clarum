"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const luxuryEase = [0.22, 1, 0.36, 1] as const;
const standardEase = [0.25, 0.46, 0.45, 0.94] as const;

const noiseBg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";

export function Hero({
  title,
  subtitle,
  primaryHref,
  secondaryHref,
  primaryLabel = "Explore dossiers",
  secondaryLabel = "Open methodology",
  eyebrow = "Clarum",
  className,
}: {
  title: string;
  subtitle: string;
  primaryHref: string;
  secondaryHref: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  eyebrow?: string;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── parallax spring values ── */
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springCfg = { stiffness: 40, damping: 25, mass: 1.2 };
  const smoothX = useSpring(mouseX, springCfg);
  const smoothY = useSpring(mouseY, springCfg);
  const orbX1 = useTransform(smoothX, [0, 1], [-14, 14]);
  const orbY1 = useTransform(smoothY, [0, 1], [-10, 10]);
  const orbX2 = useTransform(smoothX, [0, 1], [12, -12]);
  const orbY2 = useTransform(smoothY, [0, 1], [8, -8]);

  /* Track mouse via useEffect to avoid blocking pointer events on children */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReduced) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, [prefersReduced, mouseX, mouseY]);

  /* ── word-by-word timing ── */
  const words = title.split(" ");
  const wordBaseDelay = 0.15;
  const wordStagger = 0.065;
  const afterWordsDelay = wordBaseDelay + words.length * wordStagger + 0.08;

  /* ── reduced-motion fallback ── */
  if (prefersReduced) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border p-8 lg:p-12",
          className
        )}
      >
        <HeroBackground />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-muted">
            <span className="h-5 w-0.5 bg-accent/70" aria-hidden="true" />
            {eyebrow}
          </div>
          <h1 className="mt-4 font-display text-4xl font-normal leading-[1.02] tracking-tight text-fg md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-fg/80 md:text-lg">{subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border p-4 xs:p-6 md:p-8 lg:p-12",
        className
      )}
    >
      {/* Layered background with parallax orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-accent/10" />
        <motion.div
          className="absolute -inset-4 bg-[radial-gradient(circle_at_20%_80%,rgba(24,64,118,0.12),transparent_60%)]"
          style={{ x: orbX1, y: orbY1 }}
        />
        <motion.div
          className="absolute -inset-4 bg-[radial-gradient(circle_at_80%_20%,rgba(184,120,56,0.1),transparent_50%)]"
          style={{ x: orbX2, y: orbY2 }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
          style={{ backgroundImage: noiseBg }}
        />
      </div>

      <div className="relative z-10">
        {/* Eyebrow with accent bar draw-in */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: standardEase }}
        >
          <div className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-muted">
            <motion.span
              className="w-0.5 origin-top bg-accent/70"
              aria-hidden="true"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 20, opacity: 1 }}
              transition={{
                height: { duration: 0.7, delay: 0.25, ease: luxuryEase },
                opacity: { duration: 0.3, delay: 0.2 },
              }}
            />
            {eyebrow}
          </div>
        </motion.div>

        {/* Word-by-word luxury title reveal */}
        <h1 className="mt-4 font-display text-4xl font-normal leading-[1.02] tracking-tight text-fg md:text-5xl lg:text-6xl">
          {words.map((word, i) => (
            <motion.span
              key={word}
              className="inline-block"
              style={{ marginRight: i < words.length - 1 ? "0.28em" : 0 }}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.5,
                delay: wordBaseDelay + i * wordStagger,
                ease: luxuryEase,
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          className="mt-4 max-w-2xl text-base text-fg/80 md:text-lg"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: afterWordsDelay, ease: standardEase }}
        >
          {subtitle}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="mt-6 flex flex-wrap gap-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: afterWordsDelay + 0.1, ease: standardEase }}
        >
          <Button asChild>
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

/* Static background layers (shared between reduced-motion & full) */
function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-accent/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(24,64,118,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(184,120,56,0.1),transparent_50%)]" />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{ backgroundImage: noiseBg }}
      />
    </div>
  );
}
