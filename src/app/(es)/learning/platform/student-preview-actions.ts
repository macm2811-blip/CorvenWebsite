"use server";
import {learningContext} from "@/lib/lms/access";
import {createAdminClient} from "@/lib/supabase/admin";
import {revalidatePath} from "next/cache";

async function administrator(org:string) {
 const ctx=await learningContext(org,true);
 if(ctx.membership.role!=="academy_admin")throw new Error("Administrator access required.");
 return createAdminClient();
}
export async function studentPreviewAction(org:string,studentId:string) {
 const db=await administrator(org);
 const membership=await db.from("memberships").select("level,group_name,plan_name,payment_status,billing_due_date,is_sample,access_status").eq("organization_id",org).eq("profile_id",studentId).eq("role","student").single();
 if(membership.error)throw new Error("Student unavailable in this academy.");
 const courses=await db.from("enrollments").select("course_id,progress,courses!inner(title,level,status)").eq("organization_id",org).eq("student_id",studentId).neq("status","cancelled");
 if(courses.error)throw new Error(courses.error.message);
 return {membership:membership.data,courses:courses.data.map(c=>({...c,courses:Array.isArray(c.courses)?c.courses[0]:c.courses})).filter(c=>c.courses?.status==="published")};
}
export async function createSampleStudentsAction(org:string) {
 const db=await administrator(org);
 const courses=await db.from("courses").select("id").eq("organization_id",org).eq("status","published").order("created_at").limit(2);
 if(courses.error)throw new Error(courses.error.message);
 if(!courses.data.length)throw new Error("Publish a course before adding sample students.");
 const scenarios=[{key:"alex",name:"Alex Morgan · Sample",payment:"paid",ratio:.2,group:"Sample · Morning",plan:"1 class / week",days:20},{key:"jamie",name:"Jamie Rivera · Sample",payment:"pending",ratio:.6,group:"Sample · Evening",plan:"2 classes / week",days:3},{key:"taylor",name:"Taylor Chen · Sample",payment:"overdue",ratio:1,group:"Sample · Morning",plan:"2 classes / week",days:-10}];
 for(const sample of scenarios) {
   const email=`${sample.key}.${org}@students.example.invalid`;
   const profile=await db.from("profiles").select("id").eq("email",email).maybeSingle();
   if(profile.error)throw new Error(profile.error.message);
   let id=profile.data?.id as string|undefined;
   if(!id){
     const created=await db.auth.admin.createUser({email,email_confirm:true,user_metadata:{full_name:sample.name}});
     if(created.error||!created.data.user)throw new Error(created.error?.message??"Unable to create sample.");
     id=created.data.user.id;
     const saved=await db.from("profiles").update({full_name:sample.name,email}).eq("id",id);
     if(saved.error)throw new Error(saved.error.message);
   }
   const existing=await db.from("memberships").select("is_sample").eq("organization_id",org).eq("profile_id",id).maybeSingle();
   if(existing.error)throw new Error(existing.error.message);
   if(existing.data&&!existing.data.is_sample)throw new Error("This account is not a sample student.");
   const due=new Date();due.setUTCDate(due.getUTCDate()+sample.days);
   const membership=await db.from("memberships").upsert({organization_id:org,profile_id:id,role:"student",is_sample:true,access_status:"active",payment_status:sample.payment,billing_due_date:due.toISOString().slice(0,10),level:"A1",group_name:sample.group,plan_name:sample.plan,monthly_fee:0},{onConflict:"organization_id,profile_id",ignoreDuplicates:true});
   if(membership.error)throw new Error(membership.error.message);
   for(const course of courses.data){
     const enrolled=await db.from("enrollments").upsert({organization_id:org,course_id:course.id,student_id:id},{onConflict:"course_id,student_id",ignoreDuplicates:true});
     if(enrolled.error)throw new Error(enrolled.error.message);
     const [enrollment,modules,quizzes]=await Promise.all([db.from("enrollments").select("id").eq("course_id",course.id).eq("student_id",id).single(),db.from("modules").select("id").eq("course_id",course.id),db.from("quizzes").select("id").eq("course_id",course.id)]);
     if(enrollment.error||modules.error||quizzes.error)throw new Error("Unable to prepare sample courses.");
     const lessons=modules.data.length?await db.from("lessons").select("id").in("module_id",modules.data.map(m=>m.id)).order("position"):{data:[],error:null};
     if(lessons.error)throw new Error(lessons.error.message);
     const target=Math.floor((lessons.data.length+quizzes.data.length)*sample.ratio);
     if(target&&lessons.data.length){
       const progress=await db.from("lesson_progress").upsert(lessons.data.slice(0,target).map(l=>({enrollment_id:enrollment.data.id,lesson_id:l.id,completed:true,completed_at:new Date().toISOString()})),{onConflict:"enrollment_id,lesson_id",ignoreDuplicates:true});
       if(progress.error)throw new Error(progress.error.message);
     }
     for(const quiz of quizzes.data.slice(0,Math.max(0,target-lessons.data.length))){
       const previous=await db.from("quiz_attempts").select("id").eq("student_id",id).eq("quiz_id",quiz.id).limit(1);
       if(previous.error)throw new Error(previous.error.message);
       if(!previous.data.length){const attempt=await db.from("quiz_attempts").insert({quiz_id:quiz.id,student_id:id,score:95,passed:true,answers:{},review_state:"graded",feedback:"Sample data for administrator walkthrough.",submitted_at:new Date().toISOString()});if(attempt.error)throw new Error(attempt.error.message);}
     }
     const recomputed=await db.rpc("recompute_learning_progress",{p_student:id,p_course:course.id});
     if(recomputed.error)throw new Error(recomputed.error.message);
   }
 }
 revalidatePath("/learning/platform");
 return {count:scenarios.length};
}
