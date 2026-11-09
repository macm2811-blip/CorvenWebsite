import type { Metadata } from "next";
import { PrivacyPage } from "@/components/privacy-page";

export const metadata: Metadata = {
  title: "Privacy notice | CORVEN",
  description: "Information about CORVEN Costa Rica's processing of personal data.",
};

export default function EnglishPrivacyPage() {
  return <PrivacyPage locale="en" />;
}
