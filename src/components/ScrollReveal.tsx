"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 14 },
  down: { x: 0, y: -14 },
  left: { x: 14, y: 0 },
  right: { x: -14, y: 0 },
  none: { x: 0, y: 0 },
};

const EASE = "cubic-bezier(0.12, 0.8, 0.25, 1)";
const DURATION = "1.3s";

type Phase = "ssr" | "idle" | "hidden" | "visible";

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
  const [phase, setPhase] = useState<Phase>("ssr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("idle");
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setPhase("idle");
      return;
    }

    setPhase("hidden");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("visible");
          if (once) observer.disconnect();
        }
      },
      { threshold: amount },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, once, amount]);

  const offset = offsets[direction];

  const style: React.CSSProperties | undefined =
    !mounted
      ? undefined
      : phase === "hidden"
        ? {
            opacity: 0,
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
            ...(blur ? { filter: "blur(6px)", willChange: "transform, filter, opacity" } : { willChange: "transform, opacity" }),
          }
        : phase === "visible"
          ? {
              opacity: 1,
              transform: "translate3d(0, 0, 0)",
              ...(blur ? { filter: "blur(0px)", willChange: "transform, filter, opacity" } : { willChange: "transform, opacity" }),
              transition: [
                `opacity ${DURATION} ${EASE} ${delay}s`,
                `transform ${DURATION} ${EASE} ${delay}s`,
                ...(blur ? [`filter ${DURATION} ${EASE} ${delay}s`] : []),
              ].join(", "),
            }
          : undefined;

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
