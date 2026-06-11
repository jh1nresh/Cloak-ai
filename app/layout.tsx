import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloak AI - Your AI Dressing Room",
  description: "Create a style profile, keep yourself in the center, swipe outfits around you, and buy the looks that work.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Cloak AI" },
  openGraph: {
    title: "Cloak AI - Your AI Dressing Room",
    description: "Cloak keeps you as the model while products from commerce catalogs turn into outfits around you.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
