import { createClient } from "@supabase/supabase-js";
import type { Truck } from "@/types";
import { DEMO_TRUCKS } from "./demo";

interface Row {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  price: number | null;
  color: string | null;
  miles: number | null;
  vin: string | null;
  engine: string | null;
  transmission: string | null;
  images: string[] | null;
  status: Truck["status"];
}

/** Public read of the trucks table (allowed by row level security). Falls back to demo trucks. */
export async function getTrucks(): Promise<Truck[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return DEMO_TRUCKS;

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("trucks")
    .select("id, slug, year, make, model, price, color, miles, vin, engine, transmission, images, status")
    .neq("status", "sold")
    .order("year", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) console.error("Supabase error:", error.message);
  if (error || !data || data.length === 0) return DEMO_TRUCKS;
  return (data as unknown as Row[]).map((r) => ({ ...r, images: r.images ?? [] }));
}