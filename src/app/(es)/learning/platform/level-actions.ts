"use server";
import {learningContext} from "@/lib/lms/access";
import {createAdminClient} from "@/lib/supabase/admin";
import {CEFR_LEVELS} from "@/lib/lms/learning-path";
import {revalidatePath} from "next/cache";
export async function levelFoldersAction(org:string) {
  const ctx=await learningContext(org);
  const result=await ctx.db.from("course_levels").select("code").eq("organization_id",org).order("code");
  if(result.error)throw new Error(result.error.message);
  return result.data.map(l=>l.code as string);
}
export async function createLevelFolderAction(org:string,code:string) {
  const ctx=await learningContext(org,true);
  if(ctx.membership.role!=="academy_admin")throw new Error("Only administrators can create level folders.");
  if(!CEFR_LEVELS.includes(code as typeof CEFR_LEVELS[number]))throw new Error("Choose a level from A1 to C1.");
  const result=await createAdminClient().from("course_levels").upsert({organization_id:org,code},{onConflict:"organization_id,code",ignoreDuplicates:true});
  if(result.error)throw new Error(result.error.message);
  revalidatePath("/learning/platform");
  return levelFoldersAction(org);
}
