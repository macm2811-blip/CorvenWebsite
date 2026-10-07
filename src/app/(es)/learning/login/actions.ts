"use server";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeNext(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/learning/platform")
    ? path
    : "/learning/platform";
}

export async function signIn(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "La conexión con Supabase todavía no está activada." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!validEmail(email) || password.length < 8) {
    return { error: "Revisa el correo y escribe una contraseña válida." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "No pudimos iniciar sesión. Revisa tus datos e inténtalo otra vez." };
  }

  redirect(safeNext(formData.get("next")));
}

export async function requestPasswordReset(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "La conexión con Supabase todavía no está activada." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!validEmail(email)) return { error: "Escribe un correo válido." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!siteUrl) return { error: "Falta configurar la URL pública de la plataforma." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/learning/auth/callback?next=/learning/account/update-password`,
  });

  if (error) {
    return { error: "No pudimos enviar el enlace. Inténtalo nuevamente." };
  }

  return {
    success:
      "Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.",
  };
}
