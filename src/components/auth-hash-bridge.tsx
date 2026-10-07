"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

const PASSWORD_TYPES = new Set(["invite", "recovery"]);

export function AuthHashBridge() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const type = params.get("type");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!type || !PASSWORD_TYPES.has(type) || !accessToken || !refreshToken) {
      return;
    }

    let cancelled = false;
    const session = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    async function continueInvitation() {
      const supabase = createClient();
      const { error } = await supabase.auth.setSession(session);

      if (!error && !cancelled) {
        window.location.replace("/learning/account/update-password");
      }
    }

    void continueInvitation();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
