"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export function AnimatedProgress({
  value,
  color = "bg-accent/85",
  dotColor = "rgb(var(--accent))",
  delay = 0,
  height = "h-1.5",
  showDot = false,
  label,
}: {
  value: number;
  color?: string;
  dotColor?: string;
  delay?: number;
  height?: string;
  showDot?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReduced = useReducedMotion();

  const pct = Math.max(0, Math.min(100, value));

  const a11yProps = {
    role: "progressbar" as const,
    "aria-valuenow": pct,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    ...(label ? { "aria-label": label } : {}),
  };

  if (prefersReduced) {
    return (
      <div ref={ref} className={`${height} rounded-full bg-border/65 shadow-inset`} {...a11yProps}>
        <div className={`${height} rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${height} rounded-full bg-border/65 shadow-inset`} {...a11yProps}>
      <motion.div
        className={`${height} rounded-full ${color}`}
        initial={{ width: "0%" }}
        animate={isInView ? { width: `${pct}%` } : { width: "0%" }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      />
      {showDot && (
        <motion.div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-card bg-current shadow-sm"
          style={{ color: dotColor }}
          initial={{ scale: 0, left: "0%" }}
          animate={isInView ? { scale: 1, left: `${pct}%`, x: "-50%" } : { scale: 0, left: "0%" }}
          transition={{
            duration: 0.4,
            delay: delay + 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      )}
    </div>
  );
}
