"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useRef } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 14 },
  down: { x: 0, y: -14 },
  left: { x: 14, y: 0 },
  right: { x: -14, y: 0 },
  none: { x: 0, y: 0 },
};

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  once = true,
  amount = 0.15,
  blur = false,
  className,
}: {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  once?: boolean;
  amount?: number;
  blur?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const offset = offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
        ...(blur ? { filter: "blur(6px)" } : {}),
      }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) }
          : { opacity: 0, x: offset.x, y: offset.y, ...(blur ? { filter: "blur(6px)" } : {}) }
      }
      transition={{
        duration: 1.3,
        delay,
        ease: [0.12, 0.8, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
