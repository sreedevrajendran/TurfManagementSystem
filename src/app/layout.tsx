import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import HeaderNav from "@/components/HeaderNav";
import MobileBottomNav from "@/components/MobileBottomNav";
import AlertBanner from "@/components/AlertBanner";
import TermsModal from "@/components/TermsModal";
import PrivacyModal from "@/components/PrivacyModal";
import FloatingContact from "@/components/FloatingContact";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#06080D",
};

export const metadata: Metadata = {
  title: "EAST WELFARE TURF | Premium Football & Cricket Pitch",
  description: "Book your FIFA-grade artificial grass turf for Football and Cricket at EAST WELFARE TURF. Fast real-time slot booking, dynamic pricing, and instant booking receipts.",
};

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
          <HeaderNav />
          {children}
          <FloatingContact />
          <MobileBottomNav />
          <TermsModal />
          <PrivacyModal />
        </Providers>
      </body>
    </html>
  );
}
