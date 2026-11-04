"use client";

import type { PointerEvent } from "react";
import { motion } from "framer-motion";
import type { Truck } from "@/types";
import { messageLink, site } from "@/config/site";
import { formatMiles, formatMoney, truckTitle } from "@/lib/format";
import { EASE } from "@/lib/motion";
import { PAINT_NAMES } from "@/tokens/tokens";
import { PhotoGrid } from "./PhotoGrid";
import { TruckArt } from "./TruckArt";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import s from "./TruckRow.module.css";

const onRequest = (v: string | null) => v ?? "On request";

export function TruckRow({ truck, onReserve }: { truck: Truck; onReserve: (t: Truck) => void }) {
  const title = truckTitle(truck);
  const available = truck.status === "available";

  const trackPointer = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <motion.article
      className={s.row}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
      onPointerMove={trackPointer}
      aria-label={title}
    >
      <PhotoGrid
        images={truck.images}
        alt={title}
        fallback={<TruckArt paint={PAINT_NAMES[truck.year % PAINT_NAMES.length]} label={`Illustration of a ${title}`} />}
      />

      <div className={s.info}>
        <div className={s.badges}>
          <Badge>{truck.year}</Badge>
          <Badge tone="brown">{available ? "Reserve online" : "Reserved"}</Badge>
        </div>

        <h3 className={s.title}>
          {truck.make}
          <span className={s.model}>{truck.model}</span>
        </h3>

        <dl className={s.specs}>
          <div className={s.spec}><dt>Mileage</dt><dd>{formatMiles(truck.miles)}</dd></div>
          <div className={s.spec}><dt>Engine</dt><dd>{onRequest(truck.engine)}</dd></div>
          <div className={s.spec}><dt>Color</dt><dd>{onRequest(truck.color)}</dd></div>
          <div className={s.spec}><dt>Transmission</dt><dd>{onRequest(truck.transmission)}</dd></div>
          <div className={s.spec}><dt>VIN</dt><dd>{onRequest(truck.vin)}</dd></div>
        </dl>

        <div className={s.price}>
          <span className={s.amount}>{formatMoney(site.depositUsd)}</span>
          <span className={s.note}>deposit, paid securely online</span>
        </div>

        <div className={s.actions}>
          <Button variant="pay" disabled={!available} onClick={() => onReserve(truck)}>
            {available ? `Reserve with ${formatMoney(site.depositUsd)}` : "Reserved"}
          </Button>
          <Button variant="ghost" href={messageLink(`Hi! I have a question about the ${title}.`)}>Ask a question</Button>
        </div>

        {available && (
          <a className={s.quiet} href={messageLink(`Hi! I would like to arrange a viewing of the ${title}.`)} target="_blank" rel="noreferrer">
            Special circumstances? Request a viewing
          </a>
        )}
      </div>
    </motion.article>
  );
}