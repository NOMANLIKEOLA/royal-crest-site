/** AI support chat. Keeps the API key on the server. */
const SYSTEM = `You are the support assistant for Royal Crest Autos, a used truck dealership that sells Freightliner Cascadia sleepers (model years 2021 to 2025).
Facts you may state: every truck has a fixed $5,000 deposit that can be paid online by card through the site's secure checkout; trucks have Detroit DD15 engines.
Do not invent prices, financing terms, mileage, availability, delivery or warranty details. If you do not know, say the team will confirm and suggest continuing on WhatsApp.
Be brief, friendly and clear. Encourage reserving online with the deposit. Mention visiting only if the customer asks for it or has a special circumstance.`;

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "Chat is not configured yet." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { messages?: Msg[] } | null;
  const messages = (body?.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Send a message first." }, { status: 400 });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.CHAT_MODEL ?? "claude-sonnet-5-5", max_tokens: 400, system: SYSTEM, messages }),
  });
  if (!res.ok) return Response.json({ error: "Assistant unavailable." }, { status: 502 });

  const data = (await res.json()) as { content: { type: string; text?: string }[] };
  const reply = data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return Response.json({ reply });
}