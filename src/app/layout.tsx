import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "EAST WELFARE TURF | Premium 6-a-Side Football",
  description: "Book your premium 6-a-side artificial grass football turf at EAST WELFARE TURF. Experience high-end facilities, dynamic pricing, and easy booking.",
};

import AlertBanner from "@/components/AlertBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AlertBanner />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
