import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Archivo, Inter } from "next/font/google";
import "../styles/globals.css";

const display = Archivo({ subsets: ["latin"], weight: ["500", "800"], variable: "--font-archivo", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Royal Crest Autos | Reserve your truck online",
  description: "Used Freightliner Cascadia sleepers from 2021 to 2025. $5,000 fixed down payment.",
  openGraph: {
    title: "Royal Crest Autos",
    description: "Used Freightliner Cascadia sleepers from 2021 to 2025. $5,000 fixed down payment.",
    siteName: "Royal Crest Autos",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Sets the saved theme before the page paints, so there is no flash
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}