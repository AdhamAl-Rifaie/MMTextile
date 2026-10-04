import type { Metadata } from "next";
import { Barlow_Condensed, Inter_Tight } from "next/font/google";
import "./globals.css";

const displayFont = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-display"
});

const brandFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-brand"
});

export const metadata: Metadata = {
  title: "MMTextile",
  description: "MMTextile customer textile request form"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${brandFont.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/uploads/products/basic-floral-towel-stack.webp" />
        <link rel="preload" as="image" href="/uploads/products/basic-floral-towel-rolls.webp" />
        <link rel="preload" as="image" href="/uploads/products/basic-floral-towel-burgundy-detail.webp" />
        <link rel="preload" as="image" href="/uploads/products/basic-floral-towel-stack1.jpeg" />
        <link rel="preload" as="image" href="/uploads/products/basicTowels.jpeg" />
        <link rel="preload" as="image" href="/uploads/products/Towels.jpeg" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
