import type { Metadata } from "next";
import { DM_Sans, Montserrat } from "next/font/google";

import { LevelUpLms } from "./level-up-lms";

const displayFont = Montserrat({
  variable: "--font-demo-display",
  subsets: ["latin"],
});

const bodyFont = DM_Sans({
  variable: "--font-demo-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Level Up Academy | Powered by CORVEN",
  description:
    "Portal híbrido de aprendizaje de Level Up English Academy, impulsado por CORVEN.",
  robots: { index: false, follow: false },
};

export default function LearningDemoPage() {
  return (
    <div className={`${displayFont.variable} ${bodyFont.variable}`}>
      <LevelUpLms />
    </div>
  );
}
