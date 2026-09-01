import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";

export const metadata: Metadata = {
  title: { absolute: "CORVEN | Operaciones, datos y estrategia" },
  description: "CORVEN conecta gestión operativa, visualización de datos y proyección estratégica para ayudar a las empresas a tomar mejores decisiones.",
  alternates: { canonical: "/", languages: { es: "/", en: "/en" } },
};

export default function Home() {
  return <HomePage locale="es" />;
}
