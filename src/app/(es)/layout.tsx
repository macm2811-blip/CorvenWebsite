import type { Metadata } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import "../globals.css";

const displayFont = Manrope({ variable: "--font-display", subsets: ["latin"] });
const bodyFont = Source_Sans_3({ variable: "--font-body", subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "CORVEN",
  keywords: ["gestión operativa", "visualización de datos", "proyección estratégica", "administración de operaciones", "diagnóstico operativo", "mejora de procesos", "inteligencia de negocios", "CORVEN"],
  openGraph: {
    type: "website", locale: "es_419", siteName: "CORVEN",
    title: "CORVEN | Operaciones, datos y estrategia",
    description: "Entienda su operación, visualice sus datos y proyecte el futuro para tomar mejores decisiones hoy.",
  },
  robots: { index: true, follow: true },
};

export default function SpanishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" className={`${displayFont.variable} ${bodyFont.variable}`}><body>{children}</body></html>;
}
