"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Truck } from "@/types";
import { site } from "@/config/site";
import { EASE } from "@/lib/motion";
import { formatMoney } from "@/lib/format";
import { CountUp } from "./CountUp";
import { TruckArt } from "./TruckArt";
import { Button } from "./ui/Button";
import s from "./Hero.module.css";

const WORDS = ["Reserve", "your", "Cascadia", "online."];

export function Hero({ trucks }: { trucks: Truck[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const showcase = trucks.find((t) => t.images.length > 0);

  const stats = [
    { label: "Trucks available", value: trucks.filter((t) => t.status === "available").length, prefix: "" },
    { label: "Model years", value: new Set(trucks.map((t) => t.year)).size, prefix: "" },
    { label: "Fixed deposit", value: site.depositUsd, prefix: "$" },
  ];

  return (
    <section id="top" ref={ref} className={s.hero} aria-labelledby="hero-title">
      <div className={`wrap ${s.inner}`}>
        <motion.p className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          Used Freightliner Cascadia sleepers
        </motion.p>

        <h1 id="hero-title" className={s.title} aria-label="Reserve your Cascadia online.">
          {WORDS.map((w, i) => (
            <span key={w} className={s.word} aria-hidden>
              <motion.span
                style={{ display: "inline-block" }}
                initial={{ y: "115%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.09 }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p className={s.deposit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7, ease: EASE }}>
          <span className={s.pill}>{formatMoney(site.depositUsd)} deposit</span> secures yours today.
        </motion.p>

        <motion.p className={s.lede} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.68, duration: 0.7, ease: EASE }}>
          Choose your truck, pay the deposit securely by card, and our team takes it from there.
        </motion.p>

        <motion.div className={s.cta} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.76, duration: 0.7, ease: EASE }}>
          <Button href="#inventory" variant="pay">Browse trucks</Button>
          <Button href="#how" variant="ghost">How it works</Button>
        </motion.div>

        <motion.div className={s.stage} style={{ y }} initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 1, ease: EASE }}>
          {showcase ? (
            <img className={`${s.truck} ${s.photo}`} src={showcase.images[0]} alt={`${showcase.year} ${showcase.make} ${showcase.model}`} />
          ) : (
            <TruckArt className={s.truck} paint="blue" label="Illustration of a sleeper semi truck" />
          )}
        </motion.div>

        <dl className={s.stats}>
          {stats.map((st) => (
            <div key={st.label} className={s.stat}>
              <dt>{st.label}</dt>
              <dd><CountUp to={st.value} prefix={st.prefix} /></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}