import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./split-controls.css";
import "./player-overrides.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "OR / VIS — Make Optimization Visible",
  description:
    "An interactive visual textbook for polyhedra, integer optimization, and the geometry behind algorithms.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "OR / VIS — Make Optimization Visible",
    description: "See constraints become geometry. Explore the polyhedra behind discrete optimization.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "OR / VIS visual textbook" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OR / VIS — Make Optimization Visible",
    description: "An interactive visual textbook for discrete optimization.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
