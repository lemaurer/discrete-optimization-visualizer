import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
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
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "OR / VIS visual textbook" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "OR / VIS — Make Optimization Visible",
      description: "An interactive visual textbook for discrete optimization.",
      images: [`${origin}/og.png`],
    },
  };
}

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
