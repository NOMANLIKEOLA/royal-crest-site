export const site = {
  name: "Royal Crest Autos",
  depositUsd: 5000, // display only; the charged amount is set in src/app/api/checkout/route.ts
  phoneDisplay: "+1 (484) 509-1375",
  phoneHref: "tel:+14845091375",
  whatsappNumber: "12295825158", // WhatsApp +1 (229) 582-5158, digits only
  email: "[YOUR EMAIL]",
  addressLines: ["[YOUR ADDRESS]", "[CITY, ST ZIP]"],
  hours: "[HOURS]",
} as const;

/** Public web address, used inside WhatsApp messages. Set NEXT_PUBLIC_SITE_URL in .env.local and on Vercel. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

export const messageLink = (text: string) =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;