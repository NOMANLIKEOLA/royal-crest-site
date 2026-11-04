export interface Truck {
  id: string;
  year: number;
  make: string;
  model: string;
  images: string[];
  miles: number | null;
  vin: string | null;
  color: string | null;
  engine: string | null;
  transmission: string | null;
  status: "available" | "reserved" | "sold";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}