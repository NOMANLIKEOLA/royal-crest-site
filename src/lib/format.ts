const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatMoney = (n: number) => money.format(n);
export const formatMiles = (n: number | null) => (n === null ? "On request" : `${n.toLocaleString("en-US")} mi`);
export const truckTitle = (t: { year: number; make: string; model: string }) => `${t.year} ${t.make} ${t.model}`;