import type { Metadata } from "next";

import { LearningDemo } from "./learning-demo";

export const metadata: Metadata = {
  title: "CORVEN Learning | Demo comercial",
  description:
    "Entorno demostrativo de la experiencia de aprendizaje administrada por CORVEN.",
  robots: { index: false, follow: false },
};

export default function LearningDemoPage() {
  return <LearningDemo />;
}
