import Image from "next/image";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export const metadata = {
  title: "Sign in | Level Up Academy",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const configured = isSupabaseConfigured();
  const { next = "/learning/platform" } = await searchParams;

  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) redirect("/learning/platform");
  }

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.levelUpBrand}>
          <div className={styles.logoPlate}><Image className={styles.levelUpLogo} src="/brand/level-up/logo-horizontal-transparent.png" alt="Level Up English Academy" width={2109} height={745} sizes="(max-width: 850px) 250px, 380px" preload /></div>
          <Image className={styles.mascot} src="/brand/level-up/mascot-wave-transparent.png" alt="The Level Up mascot welcomes you" width={1254} height={1254} sizes="(max-width: 850px) 140px, 270px" />
        </div>
        <div className={styles.powered}>
          <span>Powered by</span>
          <Image
            src="/brand/corven-imagotype-purple.png"
            alt="CORVEN"
            width={360}
            height={120}
          />
        </div>
      </section>
      <section className={styles.formPanel}>
        {configured ? (
          <LoginForm next={next} />
        ) : (
          <div className={styles.setup}>
            <span>CONFIGURACIÓN PENDIENTE</span>
            <h1>Conectemos Supabase</h1>
            <p>
              La ruta segura está lista. Para activar usuarios y datos reales,
              agrega estas variables en el proyecto de Vercel.
            </p>
            <code>
              NEXT_PUBLIC_SUPABASE_URL{"\n"}
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY{"\n"}
              SUPABASE_SECRET_KEY
            </code>
          </div>
        )}
      </section>
    </main>
  );
}
