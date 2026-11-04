"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { EASE } from "@/lib/motion";
import s from "./Steps.module.css";

const STEPS = [
  { title: "Choose your truck", body: "Browse the photos and specs for every model year, then pick the one that fits your business." },
  { title: "Reserve with a deposit", body: "Pay the fixed deposit by card through secure checkout. It takes a couple of minutes, from any device." },
  { title: "We take it from here", body: "After your deposit, our team contacts you to confirm the details and complete the next steps." },
];

export function Steps() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section id="how" className={s.section} aria-labelledby="how-title">
      <div className="wrap">
        <p className="eyebrow">How it works</p>
        <h2 id="how-title" className="section-title">Three steps.<br />All of them online.</h2>

        <div ref={ref} className={s.timeline}>
          <span className={s.track} aria-hidden />
          <motion.span className={s.line} style={{ scaleY: reduce ? 1 : scaleY }} aria-hidden />
          <ol className={s.items}>
            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                className={s.step}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <span className={s.num} aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}