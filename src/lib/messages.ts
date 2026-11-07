import type { Truck } from "@/types";
import { messageLink, site, siteUrl } from "@/config/site";
import { formatMoney } from "@/lib/format";

/** "2024 Freightliner Cascadia (White), VIN ending 6012, listed at $90,000" */
function describe(t: Truck): string {
  let text = `${t.year} ${t.make} ${t.model.replace(/\s+sleeper$/i, "")}`;
  if (t.color) text += ` (${t.color})`;
  if (t.vin) text += `, VIN ending ${t.vin.slice(-4)}`;
  if (t.price) text += `, listed at ${formatMoney(t.price)}`;
  return text;
}

const truckUrl = (t: Truck) => (siteUrl ? ` ${siteUrl}/#truck=${t.slug}` : "");

export const inquiryLink = (t: Truck) =>
  messageLink(`Hi ${site.name}, I am interested in the ${describe(t)}. Is it still available?${truckUrl(t)}`);

export const reserveLink = (t: Truck) =>
  messageLink(`Hi ${site.name}, I would like to reserve the ${describe(t)}.${truckUrl(t)}`);

export const viewingLink = (t: Truck) =>
  messageLink(`Hi ${site.name}, I would like to arrange a viewing of the ${describe(t)}.${truckUrl(t)}`);