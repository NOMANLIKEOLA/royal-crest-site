import { getAdminClient } from "@/lib/supabase/admin";

const DEPOSIT_CENTS = 500_000; // $5,000, set on the server. Confirm this amount with the client.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function admin() {
  try {
    return getAdminClient();
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return Response.json({ error: "Payments are not configured yet." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { truckId?: string } | null;
  const truckId = String(body?.truckId ?? "");
  if (!UUID.test(truckId)) return Response.json({ error: "This truck can’t be reserved online yet." }, { status: 400 });

  const db = admin();
  if (!db) return Response.json({ error: "Database is not configured yet." }, { status: 503 });

  // Truck details come from the database, never from the browser
  const { data: truck } = await db.from("trucks").select("id, year, make, model, status").eq("id", truckId).maybeSingle();
  if (!truck) return Response.json({ error: "Truck not found." }, { status: 404 });
  if (truck.status !== "available") return Response.json({ error: "Sorry, this truck is no longer available." }, { status: 409 });

  const title = `${truck.year} ${truck.make} ${truck.model}`;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const form = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/?paid=1`,
    cancel_url: `${origin}/#inventory`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(DEPOSIT_CENTS),
    "line_items[0][price_data][product_data][name]": `Deposit: ${title}`,
    "metadata[truck_id]": truck.id,
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const session = (await res.json()) as { id?: string; url?: string };
  if (!res.ok || !session.id || !session.url) return Response.json({ error: "Could not start checkout." }, { status: 502 });

  await db.from("reservations").insert({ truck_id: truck.id, stripe_session_id: session.id, amount_cents: DEPOSIT_CENTS });
  return Response.json({ url: session.url });
}