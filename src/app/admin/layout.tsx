import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import "../globals.css";

// Root layout for the whole /admin tree - it's a sibling of [locale], not a
// child, so (like [locale]/layout.tsx) it owns <html>/<body> itself. No
// auth check here: this wraps /admin/login too. The actual ADMIN gate is
// src/app/admin/(protected)/layout.tsx.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "後台管理 | Nick Cai",
  description: "Nick Cai 個人品牌網站後台管理系統",
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
