import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const displayFont = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "CORVEN Consulting | Claridad para mejorar su operación",
    template: "%s | CORVEN Consulting",
  },
  description:
    "Ayudamos a pequeñas empresas de Costa Rica a identificar qué mejorar primero y convertirlo en acciones claras mediante el Diagnóstico Operativo Express.",
  applicationName: "CORVEN Consulting",
  keywords: [
    "consultoría para pequeñas empresas Costa Rica",
    "diagnóstico operativo",
    "mejora de procesos",
    "organización de negocios",
    "CORVEN Consulting",
  ],
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "CORVEN Consulting",
    title: "CORVEN Consulting | Claridad para mejorar su operación",
    description:
      "Identifique qué está frenando su negocio, decida qué mejorar primero y comience con un plan práctico.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CR" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
