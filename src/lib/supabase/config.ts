const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(projectUrl && publishableKey);
}

export function getSupabasePublicConfig() {
  if (!projectUrl || !publishableKey) {
    throw new Error(
      "Supabase no está configurado. Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { projectUrl, publishableKey };
}

export function getSupabaseSecretKey() {
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    throw new Error(
      "Falta SUPABASE_SECRET_KEY. Esta clave solo puede existir en el servidor.",
    );
  }

  return secretKey;
}
