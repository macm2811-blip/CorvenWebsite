"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validUsername(value: string) {
  return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(value);
}

async function resolveEmail(identifier: string) {
  if (validEmail(identifier)) return identifier;
  if (!validUsername(identifier)) return null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("email")
      .eq("username", identifier)
      .maybeSingle();

    if (error || !data?.email || !validEmail(data.email)) return null;
    return data.email.toLowerCase();
  } catch {
    return null;
  }
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

  const identifier = String(formData.get("identifier") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if ((!validEmail(identifier) && !validUsername(identifier)) || password.length < 8) {
    return { error: "Revisa tus datos e inténtalo otra vez." };
  }

  const email = await resolveEmail(identifier);
  if (!email) {
    return { error: "No pudimos iniciar sesión. Revisa tus datos e inténtalo otra vez." };
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
    redirectTo: siteUrl + "/learning/auth/callback?next=/learning/account/update-password",
  });

  if (error) {
    return { error: "No pudimos enviar el enlace. Inténtalo nuevamente." };
  }

  return {
    success:
      "Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.",
  };
}
