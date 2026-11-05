import { getTrucks } from "@/lib/trucks";
import { Storefront } from "@/components/Storefront";

export const revalidate = 60;

export default async function Page() {
  const trucks = await getTrucks();
  return <Storefront trucks={trucks} />;
}