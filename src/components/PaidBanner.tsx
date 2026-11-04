"use client";

import { useEffect, useState } from "react";
import s from "./PaidBanner.module.css";

/** Shown after Stripe returns the customer to /?paid=1 */
export function PaidBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(new URLSearchParams(location.search).get("paid") === "1");
  }, []);

  if (!open) return null;

  const dismiss = () => {
    history.replaceState(null, "", location.pathname);
    setOpen(false);
  };

  return (
    <div className={s.banner} role="status">
      <span>Thank you! If your payment went through, Stripe will email you a receipt and our team will be in touch to confirm your truck.</span>
      <button className={s.close} onClick={dismiss}>Dismiss</button>
    </div>
  );
}