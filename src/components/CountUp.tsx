"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { EASE } from "@/lib/motion";

export function CountUp({ to, prefix = "" }: { to: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const text = useTransform(value, (n) => `${prefix}${Math.round(n).toLocaleString("en-US")}`);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration: 1.4, ease: EASE });
    return () => controls.stop();
  }, [inView, to, reduce, value]);

  return <motion.span ref={ref}>{text}</motion.span>;
}