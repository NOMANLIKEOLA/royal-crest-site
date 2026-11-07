import type { Truck } from "@/types";

/** Shown until real trucks exist in Supabase. */
export const DEMO_TRUCKS: Truck[] = [2025, 2024, 2023, 2022, 2021].map((year) => ({
  id: `demo-${year}`,
  slug: `demo-${year}`,
  year,
  make: "Freightliner",
  model: "Cascadia Sleeper",
  images: [],
  price: null,
  miles: null,
  vin: null,
  color: null,
  engine: "Detroit DD15",
  transmission: null,
  status: "available" as const,
}));