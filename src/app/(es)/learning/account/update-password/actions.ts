"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type PasswordState = { error?: string };

export async function updatePassword(
  _state: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 10) {
    return { error: "Usa al menos 10 caracteres." };
  }
  if (password !== confirmation) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "No pudimos cambiar la contraseña." };

  redirect("/learning/platform");
}
