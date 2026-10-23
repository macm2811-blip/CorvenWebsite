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
    return { error: "The platform connection is not configured yet." };
  }

  const identifier = String(formData.get("identifier") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if ((!validEmail(identifier) && !validUsername(identifier)) || password.length < 8) {
    return { error: "Check your details and try again." };
  }

  const email = await resolveEmail(identifier);
  if (!email) {
    return { error: "Unable to sign in. Check your details and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Unable to sign in. Check your details and try again." };
  }

  redirect(safeNext(formData.get("next")));
}

export async function requestPasswordReset(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: "The platform connection is not configured yet." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!validEmail(email)) return { error: "Enter a valid email address." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!siteUrl) return { error: "The platform public URL is not configured." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl + "/learning/auth/callback?next=/learning/account/update-password",
  });

  if (error) {
    return { error: "Unable to send the link. Please try again." };
  }

  return {
    success:
      "If an account exists with this email, you will receive a password reset link.",
  };
}
