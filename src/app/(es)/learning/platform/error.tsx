"use client";

import Link from "next/link";
import { useEffect } from "react";

import styles from "./platform.module.css";

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.statePage}>
      <section className={styles.card}>
        <div className={styles.mark}>LU</div>
        <span>CONFIGURACIÓN DEL PORTAL</span>
        <h1>No pudimos cargar la academia</h1>
        <p>
          Verifica que las migraciones de Supabase estén aplicadas y que esta
          cuenta tenga una membresía activa.
        </p>
        <button onClick={reset}>Intentar otra vez</button>
        <Link href="/learning/login">Volver al acceso</Link>
      </section>
    </main>
  );
}
