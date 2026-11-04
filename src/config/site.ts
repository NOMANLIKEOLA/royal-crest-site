/** PLACEHOLDER contact details. Replace with the client's real info. */
export const site = {
  name: "Royal Crest Autos",
  depositUsd: 5000, // display only; the charged amount is set in src/app/api/checkout/route.ts
  phoneDisplay: "[YOUR PHONE]",
  phoneHref: "tel:+15550100199",
  whatsappNumber: "15550100199", // digits only, with country code
  email: "[YOUR EMAIL]",
  addressLines: ["[YOUR ADDRESS]", "[CITY, ST ZIP]"],
  hours: "[HOURS]",
} as const;

export const messageLink = (text: string) =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;