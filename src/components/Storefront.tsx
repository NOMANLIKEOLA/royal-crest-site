"use client";

import { useState } from "react";
import { MotionConfig } from "framer-motion";
import type { Truck } from "@/types";
import { Header } from "./Header";
import { PaidBanner } from "./PaidBanner";
import { Hero } from "./Hero";
import { Inventory } from "./Inventory";
import { Steps } from "./Steps";
import { Footer } from "./Footer";
import { CheckoutDialog } from "./CheckoutDialog";
import { ChatWidget } from "./ChatWidget";

export function Storefront({ trucks }: { trucks: Truck[] }) {
  const [reserving, setReserving] = useState<Truck | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#inventory">Skip to the trucks</a>
      <Header />
      <PaidBanner />
      <main>
        <Hero trucks={trucks} />
        <Inventory trucks={trucks} onReserve={setReserving} />
        <Steps />
      </main>
      <Footer />
      <CheckoutDialog truck={reserving} onClose={() => setReserving(null)} />
      <ChatWidget />
    </MotionConfig>
  );
}