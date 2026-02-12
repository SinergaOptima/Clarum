"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
  value,
  duration = 1.8,
  delay = 0,
  className,
}: {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }
    if (!isInView) return;

    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / (duration * 1000), 1);
        const eased = 1 - (1 - progress) ** 3;
        setDisplayValue(Math.round(eased * value));
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setCompleted(true);
        }
      };
      requestAnimationFrame(tick);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, value, duration, delay, prefersReduced]);

  if (prefersReduced) {
    return <span className={className}>{value}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: "inline-block" }}
      animate={completed ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {displayValue}
    </motion.span>
  );
}
