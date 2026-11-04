import type { ReactNode } from "react";
import s from "./ui.module.css";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brown" }) {
  return <span className={`${s.badge} ${tone === "brown" ? s.brown : ""}`}>{children}</span>;
}