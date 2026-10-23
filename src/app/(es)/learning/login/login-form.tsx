"use client";

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
        <span>{forgotten ? "RECOVER ACCOUNT" : "LEVELUP"}</span>
        <h1>{forgotten ? "Recover your account" : "Welcome back"}</h1>
        <p>
          {forgotten
            ? "We will email a secure link to your registered address."
            : "Continue learning. Sign in with your username or email."}
        </p>
      </div>

      {forgotten ? (
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required />
        </label>
      ) : (
        <label>
          Username or email
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
          Password
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
          ? "Processing…"
          : forgotten
            ? "Send link"
            : "Sign in"}
      </button>

      <button
        className={styles.textButton}
        onClick={() => setForgotten((current) => !current)}
        type="button"
      >
        {forgotten ? "Back to sign in" : "Forgot password"}
      </button>

    </form>
  );
}
