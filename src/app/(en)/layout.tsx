import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import "../globals.css";

const displayFont = Manrope({ variable: "--font-display", subsets: ["latin"] });
const bodyFont = Source_Sans_3({ variable: "--font-body", subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "CORVEN",
  robots: { index: true, follow: true },
};

export default function EnglishRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
