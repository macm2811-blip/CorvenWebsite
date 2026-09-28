import type { Metadata } from "next";
import { DM_Sans, Montserrat } from "next/font/google";

import { LearningDemo } from "./learning-demo";

const displayFont = Montserrat({
  variable: "--font-demo-display",
  subsets: ["latin"],
});

const bodyFont = DM_Sans({
  variable: "--font-demo-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Corven Learning | Demo comercial",
  description:
    "Entorno demostrativo de la experiencia de aprendizaje administrada por Corven.",
  robots: { index: false, follow: false },
};

export default function LearningDemoPage() {
  return (
    <div className={`${displayFont.variable} ${bodyFont.variable}`}>
      <LearningDemo />
    </div>
  );
}
