import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "EAST WELFARE TURF | Premium 6-a-Side Football",
  description: "Book your premium 6-a-side artificial grass football turf at EAST WELFARE TURF. Experience high-end facilities, dynamic pricing, and easy booking.",
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
