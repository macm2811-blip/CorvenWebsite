import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";

export const metadata: Metadata = {
  title: { absolute: "CORVEN | Operations, data, and strategy" },
  description: "CORVEN connects operations management, data visualization, and strategic forecasting to help companies make better decisions.",
  keywords: ["operations management", "data visualization", "strategic forecasting", "business operations", "operational diagnostic", "process improvement", "business intelligence", "CORVEN"],
  alternates: { canonical: "/en", languages: { es: "/", en: "/en" } },
  openGraph: {
    type: "website", locale: "en_US", siteName: "CORVEN",
    title: "CORVEN | Operations, data, and strategy",
    description: "Understand your operations, visualize your data, and anticipate what is ahead to make better decisions today.",
  },
};

export default function EnglishHome() {
  return <HomePage locale="en" />;
}
