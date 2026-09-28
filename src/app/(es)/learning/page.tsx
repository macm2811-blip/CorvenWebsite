import type { Metadata } from "next";
import { DM_Sans, Montserrat } from "next/font/google";

import { LearningLanding } from "./learning-landing";

const displayFont = Montserrat({
  variable: "--font-learning-display",
  subsets: ["latin"],
});

const bodyFont = DM_Sans({
  variable: "--font-learning-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { absolute: "Corven Learning | Capacitación administrada para empresas" },
  description:
    "Diseño instruccional, currículas, evaluaciones, seguimiento y administración de la plataforma de aprendizaje de su empresa.",
  alternates: { canonical: "/learning" },
  openGraph: {
    title: "Corven Learning | Capacitación administrada para empresas",
    description:
      "Transforme procesos y conocimiento experto en aprendizaje medible, consistente y actualizado.",
    url: "/learning",
  },
};

export default function LearningPage() {
  return (
    <div className={`${displayFont.variable} ${bodyFont.variable}`}>
      <LearningLanding />
    </div>
  );
}
