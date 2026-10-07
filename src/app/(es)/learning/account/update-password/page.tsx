import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

import styles from "../../login/login.module.css";
import { PasswordForm } from "./password-form";

export default async function UpdatePasswordPage() {
  if (!isSupabaseConfigured()) redirect("/learning/login");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/learning/login");

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandTop}>
          <span className={styles.academyMark}>LU</span>
        </div>
        <div className={styles.brandMessage}>
          <span>LEVEL UP ENGLISH ACADEMY</span>
          <h2>Tu acceso comienza aquí.</h2>
          <p>Configura una contraseña segura para entrar a tus cursos.</p>
        </div>
      </section>
      <section className={styles.formPanel}>
        <PasswordForm />
      </section>
    </main>
  );
}
