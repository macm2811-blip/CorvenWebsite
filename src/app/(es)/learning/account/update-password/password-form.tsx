"use client";

import { useActionState } from "react";

import { updatePassword, type PasswordState } from "./actions";
import styles from "../../login/login.module.css";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(
    updatePassword,
    {},
  );

  return (
    <form action={action} className={styles.form}>
      <div className={styles.formHeading}>
        <span>CUENTA SEGURA</span>
        <h1>Define tu contraseña</h1>
        <p>Usa al menos 10 caracteres y evita reutilizar contraseñas.</p>
      </div>
      <label>
        Nueva contraseña
        <input name="password" type="password" minLength={10} required />
      </label>
      <label>
        Confirmar contraseña
        <input name="confirmation" type="password" minLength={10} required />
      </label>
      {state.error && <p className={styles.error}>{state.error}</p>}
      <button className={styles.submit} disabled={pending} type="submit">
        {pending ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
