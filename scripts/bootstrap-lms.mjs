import { createClient } from "@supabase/supabase-js";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

const required = {
  NEXT_PUBLIC_SUPABASE_URL: projectUrl,
  SUPABASE_SECRET_KEY: secretKey,
  NEXT_PUBLIC_SITE_URL: siteUrl,
  LMS_OWNER_EMAIL: process.env.LMS_OWNER_EMAIL,
  LMS_OWNER_NAME: process.env.LMS_OWNER_NAME,
  LEVEL_UP_ADMIN_EMAIL: process.env.LEVEL_UP_ADMIN_EMAIL,
  LEVEL_UP_ADMIN_NAME: process.env.LEVEL_UP_ADMIN_NAME,
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  throw new Error(`Faltan variables: ${missing.join(", ")}`);
}

const admin = createClient(projectUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function findUser(email) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (match) return match;
    if (data.users.length < 100) return null;
  }
  return null;
}

async function findOrInvite(email, fullName) {
  const existing = await findUser(email);
  if (existing) return existing;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${siteUrl}/learning/auth/callback?next=/learning/account/update-password`,
  });
  if (error || !data.user) throw error ?? new Error(`No se pudo invitar a ${email}`);
  return data.user;
}

const { data: organization, error: organizationError } = await admin
  .from("organizations")
  .select("id")
  .eq("slug", "level-up")
  .single();

if (organizationError || !organization) {
  throw organizationError ?? new Error("No existe la organización Level Up.");
}

const owner = await findOrInvite(
  required.LMS_OWNER_EMAIL,
  required.LMS_OWNER_NAME,
);
const { error: ownerError } = await admin
  .from("profiles")
  .update({ platform_role: "owner" })
  .eq("id", owner.id);
if (ownerError) throw ownerError;

const academyAdmin = await findOrInvite(
  required.LEVEL_UP_ADMIN_EMAIL,
  required.LEVEL_UP_ADMIN_NAME,
);
const { error: membershipError } = await admin.from("memberships").upsert(
  {
    organization_id: organization.id,
    profile_id: academyAdmin.id,
    role: "academy_admin",
    access_status: "invited",
    payment_status: "waived",
    level: "A1",
  },
  { onConflict: "organization_id,profile_id" },
);
if (membershipError) throw membershipError;

console.log("CORVEN LMS onboarding completed.");
console.log(`Owner: ${required.LMS_OWNER_EMAIL}`);
console.log(`Level Up admin: ${required.LEVEL_UP_ADMIN_EMAIL}`);
