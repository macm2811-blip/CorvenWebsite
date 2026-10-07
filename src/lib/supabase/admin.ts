import "server-only";

import { createClient } from "@supabase/supabase-js";

import {
  getSupabasePublicConfig,
  getSupabaseSecretKey,
} from "./config";

export function createAdminClient() {
  const { projectUrl } = getSupabasePublicConfig();

  return createClient(projectUrl, getSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
