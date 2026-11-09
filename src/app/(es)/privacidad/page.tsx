import type { Metadata } from "next";
import { PrivacyPage } from "@/components/privacy-page";

export const metadata: Metadata = {
  title: "Aviso de privacidad | CORVEN",
  description: "Información sobre el tratamiento de datos personales en CORVEN Costa Rica.",
};

export default function SpanishPrivacyPage() {
  return <PrivacyPage locale="es" />;
}
