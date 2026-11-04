import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface StripeEvent {
  type: string;
  data: {
    object: {
      id: string;
      payment_status?: string;
      customer_details?: { email?: string | null };
      metadata?: { truck_id?: string };
    };
  };
}

/** Verifies Stripe's signature header without needing the Stripe SDK. */
function validSignature(payload: string, header: string, secret: string): boolean {
  const items = header.split(",");
  const timestamp = items.find((i) => i.startsWith("t="))?.slice(2);
  const signatures = items.filter((i) => i.startsWith("v1=")).map((i) => i.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex"));
  return signatures.some((sig) => {
    const got = Buffer.from(sig);
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook is not configured." }, { status: 503 });

  const payload = await request.text();
  if (!validSignature(payload, request.headers.get("stripe-signature") ?? "", secret)) {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  const session = event.data.object;

  if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
    const db = getAdminClient();

    const paid = await db
      .from("reservations")
      .update({ status: "paid", customer_email: session.customer_details?.email ?? null })
      .eq("stripe_session_id", session.id);
    if (paid.error) return Response.json({ error: "Could not save reservation." }, { status: 500 }); // Stripe retries

    if (session.metadata?.truck_id) {
      const truck = await db
        .from("trucks")
        .update({ status: "reserved" })
        .eq("id", session.metadata.truck_id)
        .eq("status", "available");
      if (truck.error) return Response.json({ error: "Could not update truck." }, { status: 500 });
    }
    revalidatePath("/");
  }

  return Response.json({ received: true });
}