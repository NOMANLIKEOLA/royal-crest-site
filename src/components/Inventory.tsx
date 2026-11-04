"use client";

import { useMemo, useState } from "react";
import type { Truck } from "@/types";
import { TruckRow } from "./TruckRow";
import s from "./Inventory.module.css";

export function Inventory({ trucks, onReserve }: { trucks: Truck[]; onReserve: (t: Truck) => void }) {
  const [year, setYear] = useState<number | "all">("all");

  const years = useMemo(() => [...new Set(trucks.map((t) => t.year))].sort((a, b) => b - a), [trucks]);
  const shown = useMemo(() => trucks.filter((t) => year === "all" || t.year === year), [trucks, year]);

  return (
    <section id="inventory" className={s.section} aria-labelledby="inventory-title">
      <div className="wrap">
        <div className={s.head}>
          <p className="eyebrow">The inventory</p>
          <h2 id="inventory-title" className="section-title">Find your truck.<br />Reserve it in minutes.</h2>
          <p className={s.sub}>Browse every truck, check the photos and specs, then secure it with a deposit online.</p>
        </div>

        {years.length > 1 && (
          <div className={s.chips} role="group" aria-label="Filter by model year">
            {(["all", ...years] as const).map((y) => (
              <button key={y} className={s.chip} aria-pressed={year === y} onClick={() => setYear(y)}>
                {y === "all" ? "All years" : y}
              </button>
            ))}
          </div>
        )}

        <p className={s.count} aria-live="polite">{shown.length} {shown.length === 1 ? "truck" : "trucks"}</p>
        <div className={s.list}>
          {shown.map((t) => <TruckRow key={t.id} truck={t} onReserve={onReserve} />)}
        </div>
      </div>
    </section>
  );
}