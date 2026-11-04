"use client";

import { useTheme } from "@/hooks/useTheme";
import { site } from "@/config/site";
import { Button } from "./ui/Button";
import s from "./Header.module.css";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header className={s.header}>
      <div className={s.bar}>
        <a className={s.logo} href="#top" aria-label={`${site.name}, home`}>
          <svg className={s.crest} viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5z" fill="currentColor" opacity=".2" />
            <path d="M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5z" {...stroke} />
            <path d="M8.5 12.5 12 9l3.5 3.5" {...stroke} />
          </svg>
          Royal Crest
        </a>
        <nav className={s.nav} aria-label="Primary">
          <a href="#inventory">Trucks</a>
          <a href="#how">How it works</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className={s.actions}>
          <button className={s.toggle} onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...stroke}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden {...stroke}>
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
          <Button href="#inventory" variant="pay">Reserve a truck</Button>
        </div>
      </div>
    </header>
  );
}