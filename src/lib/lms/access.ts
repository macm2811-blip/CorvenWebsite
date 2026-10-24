import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function learningContext(organizationId: string, staff = false) {
  const db = await createClient();
  const { data, error } = await db.auth.getUser();
  if (error || !data.user) throw new Error("Please sign in again.");
  const [member, org] = await Promise.all([
    db
      .from("memberships")
      .select("role,access_status,billing_due_date,group_name,plan_name")
      .eq("organization_id", organizationId)
      .eq("profile_id", data.user.id)
      .single(),
    db
      .from("organizations")
      .select("status,name,currency")
      .eq("id", organizationId)
      .single(),
  ]);
  if (
    member.error ||
    org.error ||
    member.data.access_status !== "active" ||
    org.data.status !== "active"
  )
    throw new Error("Academy access unavailable.");
  const isStaff = ["academy_admin", "instructor"].includes(member.data.role);
  if (staff && !isStaff) throw new Error("Staff access required.");
  return {
    db,
    user: data.user,
    membership: member.data,
    organization: org.data,
    isStaff,
  };
}
