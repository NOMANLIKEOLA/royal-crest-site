"use client";

import { useEffect, useRef, useState } from "react";
import type { Truck } from "@/types";
import { formatMoney, truckTitle } from "@/lib/format";
import { site } from "@/config/site";
import { reserveLink } from "@/lib/messages";
import { Button } from "./ui/Button";
import s from "./CheckoutDialog.module.css";

/** Native <dialog>: focus trap and Esc to close come for free. */
export function CheckoutDialog({ truck, onClose }: { truck: Truck | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (truck && !dialog.open) {
      setError(null);
      setPending(false);
      dialog.showModal();
    }
    if (!truck && dialog.open) dialog.close();
  }, [truck]);

  const title = truck ? truckTitle(truck) : "";

  async function pay() {
    if (!truck) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truckId: truck.id }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setPending(false);
    }
  }

  return (
    <dialog ref={ref} className={s.dialog} aria-labelledby="checkout-title" onClose={onClose}>
      {truck && (
        <>
          <h2 id="checkout-title" className={s.title}>Reserve this truck</h2>
          <p className={s.truck}>{title}</p>
          <div className={s.total}>
            <span>Deposit due today</span>
            <strong>{formatMoney(site.depositUsd)}</strong>
          </div>
          <p className={s.fine}>
            You’ll be taken to Stripe’s secure page to pay by card. After payment, our team will contact you to confirm the next steps.
          </p>
          {error && (
            <p className={s.error} role="alert">
              {error} You can message the team instead:{" "}
              <a href={reserveLink(truck)} target="_blank" rel="noreferrer">WhatsApp</a>.
            </p>
          )}
          <div className={s.actions}>
            <Button variant="pay" disabled={pending} onClick={pay}>
              {pending ? "Opening secure checkout…" : `Pay ${formatMoney(site.depositUsd)} deposit`}
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </>
      )}
    </dialog>
  );
}