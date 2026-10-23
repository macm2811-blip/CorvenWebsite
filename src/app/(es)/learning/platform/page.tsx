import type { Metadata } from "next";
import { DM_Sans, Montserrat } from "next/font/google";
import { redirect } from "next/navigation";

import { LevelUpLms } from "@/app/(es)/demo/learning/level-up-lms";
import { loadPlatformData } from "@/lib/lms/platform-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import styles from "./platform.module.css";
import { signOutAction } from "./actions";

const displayFont = Montserrat({
  variable: "--font-demo-display",
  subsets: ["latin"],
});

const bodyFont = DM_Sans({
  variable: "--font-demo-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Level Up Academy | Portal",
  description: "Private portal for Level Up English Academy.",
  robots: { index: false, follow: false },
};

export default async function PlatformPage() {
  if (!isSupabaseConfigured()) redirect("/learning/login");

  const data = await loadPlatformData();
  if (!data) redirect("/learning/login");

  if (data.accessStatus === "suspended" || data.accessStatus === "archived") {
    return (
      <main className={`${displayFont.variable} ${bodyFont.variable} ${styles.statePage}`}>
        <section className={styles.card}>
          <div className={styles.mark}>LU</div>
          <span>ACCESS PAUSED</span>
          <h1>Your account is temporarily suspended</h1>
          <p>
            Your progress is saved. Contact Level Up to review your
            payment status and restore access.
          </p>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className={`${displayFont.variable} ${bodyFont.variable}`}>
      <LevelUpLms initialData={data} />
    </div>
  );
}
