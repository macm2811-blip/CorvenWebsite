"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import {
  requestPasswordReset,
  signIn,
  type AuthActionState,
} from "./actions";
import styles from "./login.module.css";

const initialState: AuthActionState = {};

export function LoginForm({ next }: { next: string }) {
  const [forgotten, setForgotten] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(
    signIn,
    initialState,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  const state = forgotten ? resetState : loginState;
  const pending = forgotten ? resetPending : loginPending;

  return (
    <form className={styles.form} action={forgotten ? resetAction : loginAction}>
      <input type="hidden" name="next" value={next} />
      <div className={styles.formHeading}>
        <span>{forgotten ? "RECUPERAR ACCESO" : "BIENVENIDO"}</span>
        <h1>{forgotten ? "Cambia tu contraseña" : "Portal de producción"}</h1>
        <p>
          {forgotten
            ? "Te enviaremos un enlace seguro al correo registrado."
            : "Ingresa como estudiante o administrador de Level Up."}
        </p>
      </div>

      {forgotten ? (
        <label>
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required />
        </label>
      ) : (
        <label>
          Usuario o correo
          <input
            name="identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
        </label>
      )}

      {!forgotten && (
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
          />
        </label>
      )}

      {state.error && <p className={styles.error}>{state.error}</p>}
      {state.success && <p className={styles.success}>{state.success}</p>}

      <button className={styles.submit} disabled={pending} type="submit">
        {pending
          ? "Procesando…"
          : forgotten
            ? "Enviar enlace"
            : "Iniciar sesión"}
      </button>

      <button
        className={styles.textButton}
        onClick={() => setForgotten((current) => !current)}
        type="button"
      >
        {forgotten ? "Volver al inicio de sesión" : "Olvidé mi contraseña"}
      </button>

      <Link className={styles.demoLink} href="/demo/learning">
        Explorar la demostración
      </Link>
    </form>
  );
}
