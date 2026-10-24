"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function member(organizationId: string) {
  const db = await createClient();
  const { data: auth, error } = await db.auth.getUser();
  if (error || !auth.user) throw new Error("Please sign in again.");
  const membership = await db
    .from("memberships")
    .select("role,access_status")
    .eq("profile_id", auth.user.id)
    .eq("organization_id", organizationId)
    .single();
  const org = await db
    .from("organizations")
    .select("status")
    .eq("id", organizationId)
    .single();
  if (
    membership.error ||
    membership.data?.access_status !== "active" ||
    org.data?.status !== "active"
  )
    throw new Error("Your academy access is not active.");
  return { db, userId: auth.user.id, role: membership.data.role };
}

export async function studentDashboardAction(organizationId: string) {
  const { db, userId } = await member(organizationId);
  const results = await Promise.all([
    db
      .from("enrollments")
      .select("course_id,progress,status")
      .eq("student_id", userId)
      .eq("organization_id", organizationId)
      .neq("status", "cancelled"),
    db
      .from("payments")
      .select("id,amount,currency,due_date,paid_at,status,reference,coverage_start,coverage_end")
      .eq("student_id", userId)
      .eq("organization_id", organizationId)
      .order("due_date", { ascending: false }),
    db
      .from("notifications")
      .select("id,title,body,read_at,created_at")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    db
      .from("support_tickets")
      .select(
        "id,title,description,status,created_at,ticket_messages(id,body,created_at)",
      )
      .eq("created_by", userId)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
  ]);
  const problem = results.find((result) => result.error)?.error;
  if (problem) throw new Error(problem.message);
  const enrollments = results[0].data ?? [];
  const sessions = await db
    .from("live_sessions")
    .select(
      "id,title,starts_at,duration_minutes,meeting_url,recording_youtube_url,status,course_id,lesson_id",
    )
    .eq("organization_id", organizationId)
    .neq("status", "cancelled")
    .order("starts_at");
  if (sessions.error) throw new Error(sessions.error.message);
  return {
    enrollments,
    payments: results[1].data ?? [],
    notifications: results[2].data ?? [],
    tickets: results[3].data ?? [],
    sessions: (sessions.data ?? []).filter(
      (s) =>
        !s.course_id || enrollments.some((e) => e.course_id === s.course_id),
    ),
  };
}

async function courseAccess(organizationId: string, courseId: string) {
  const context = await member(organizationId);
  const course = await context.db
    .from("courses")
    .select("id,title,description,status")
    .eq("id", courseId)
    .eq("organization_id", organizationId)
    .eq("status", "published")
    .single();
  const enrollment = await context.db
    .from("enrollments")
    .select("id,progress")
    .eq("course_id", courseId)
    .eq("student_id", context.userId)
    .neq("status", "cancelled")
    .single();
  if (course.error || enrollment.error)
    throw new Error("You do not have an active enrollment in this published course.");
  return { ...context, course: course.data, enrollment: enrollment.data };
}

export async function studentCourseAction(
  organizationId: string,
  courseId: string,
) {
  const { db, userId, course, enrollment } = await courseAccess(
    organizationId,
    courseId,
  );
  const modules = await db
    .from("modules")
    .select("id,title,position")
    .eq("course_id", courseId)
    .order("position");
  if (modules.error) throw new Error(modules.error.message);
  const ids = (modules.data ?? []).map((m) => m.id);
  const [lessons, quizzes, progress] = await Promise.all([
    ids.length
      ? db
          .from("lessons")
          .select(
            "id,module_id,title,body,description,content_type,youtube_url,resource_url,position,content_config",
          )
          .in("module_id", ids)
          .order("position")
      : Promise.resolve({ data: [], error: null }),
    db
      .from("quizzes")
      .select(
        "id,title,description,passing_score,max_attempts,assessment_type,position,module_id",
      )
      .eq("course_id", courseId)
      .order("position"),
    db
      .from("lesson_progress")
      .select("lesson_id,completed")
      .eq("enrollment_id", enrollment.id),
  ]);
  const problem = [lessons, quizzes, progress].find((r) => r.error)?.error;
  if (problem) throw new Error(problem.message);
  const quizIds = (quizzes.data ?? []).map((q) => q.id);
  // Answers never cross the server boundary. Admin reads only after enrollment checks.
  const questions = quizIds.length
    ? await createAdminClient()
        .from("quiz_questions")
        .select("id,quiz_id,prompt,options,question_type,position")
        .in("quiz_id", quizIds)
        .order("position")
    : { data: [], error: null };
  const attempts = quizIds.length
    ? await db
        .from("quiz_attempts")
        .select("id,quiz_id,score,passed,submitted_at,review_state,feedback")
        .eq("student_id", userId)
        .in("quiz_id", quizIds)
        .order("submitted_at", { ascending: false })
    : { data: [], error: null };
  if (questions.error || attempts.error)
    throw new Error("Unable to load assessments.");
  return {
    course,
    modules: modules.data ?? [],
    lessons: lessons.data ?? [],
    quizzes: quizzes.data ?? [],
    questions: questions.data ?? [],
    attempts: attempts.data ?? [],
    progress: progress.data ?? [],
    percentage: enrollment.progress,
  };
}

export async function recordLearningAction(input: {
  organizationId: string;
  courseId: string;
  lessonId?: string;
  quizId?: string;
  answers?: Record<string, string | string[]>;
}) {
  const { userId } = await courseAccess(input.organizationId, input.courseId);
  const result = await createAdminClient().rpc("record_learning", {
    p_student: userId,
    p_course: input.courseId,
    p_lesson: input.lessonId ?? null,
    p_quiz: input.quizId ?? null,
    p_answers: input.answers ?? {},
  });
  if (result.error) throw new Error(result.error.message);
  revalidatePath("/learning/platform");
  return result.data as {
    progress: number;
    score: number | null;
    passed: boolean;
    pendingReview?:boolean;
  };
}

export async function readNotificationsAction(organizationId: string) {
  const { db, userId } = await member(organizationId);
  const result = await db
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", userId)
    .is("read_at", null);
  if (result.error) throw new Error(result.error.message);
}

export async function academySessionsAction(organizationId: string) {
  const { db, role } = await member(organizationId);
  if (!["academy_admin", "instructor"].includes(role))
    throw new Error("Access restricted to academy staff.");
  const result = await db
    .from("live_sessions")
    .select("id,title,starts_at,duration_minutes,meeting_url,status,course_id")
    .eq("organization_id", organizationId)
    .order("starts_at");
  if (result.error) throw new Error(result.error.message);
  return result.data ?? [];
}

export async function saveSessionAction(input: {
  organizationId: string;
  title: string;
  startsAt: string;
  duration: number;
  meetingUrl: string;
  courseId: string;
  id?: string;
  lessonId?:string;
  status?: string;
}) {
  const { db, userId, role } = await member(input.organizationId);
  if (!["academy_admin", "instructor"].includes(role))
    throw new Error("Access restricted to academy staff.");
  const starts = new Date(input.startsAt);
  const link = new URL(input.meetingUrl);
  if (
    link.protocol !== "https:" ||
    !Number.isFinite(starts.getTime()) ||
    input.title.trim().length < 2
  )
    throw new Error("Check the title, date and HTTPS link.");
  if (input.courseId) {
    const course = await db
      .from("courses")
      .select("id")
      .eq("id", input.courseId)
      .eq("organization_id", input.organizationId)
      .single();
    if (course.error) throw new Error("Invalid course.");
  }
  if(input.lessonId){if(!input.courseId)throw new Error("Choose a unit first.");const modules=await db.from("modules").select("id").eq("course_id",input.courseId);if(modules.error)throw modules.error;const page=await db.from("lessons").select("id").eq("id",input.lessonId).in("module_id",modules.data.map(m=>m.id)).single();if(page.error)throw new Error("Invalid start page.");}
  const values = {
    lesson_id:input.lessonId||null,
    title: input.title.trim().slice(0, 180),
    starts_at: starts.toISOString(),
    duration_minutes: Math.min(480, Math.max(5, input.duration)),
    meeting_url: link.href,
    course_id: input.courseId || null,
    status: input.status === "cancelled" ? "cancelled" : "scheduled",
  };
  const result = input.id
    ? await db
        .from("live_sessions")
        .update(values)
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
    : await db
        .from("live_sessions")
        .insert({
          ...values,
          organization_id: input.organizationId,
          instructor_id: userId,
        });
  if (result.error) throw new Error(result.error.message);
  revalidatePath("/learning/platform");
}

export async function academyOperationsAction(organizationId: string) {
  const { db, role } = await member(organizationId);
  if (!["academy_admin", "instructor"].includes(role))
    throw new Error("Access restricted to academy staff.");
  const payments = await db
    .from("payments")
    .select("id,student_id,amount,currency,due_date,paid_at,status,reference")
    .eq("organization_id", organizationId)
    .order("due_date", { ascending: false });
  const sessions = await academySessionsAction(organizationId);
  if (payments.error) throw new Error(payments.error.message);
  return { payments: payments.data ?? [], sessions };
}

export async function academyTicketsAction(organizationId: string) {
  const { db, role } = await member(organizationId);
  if (!["academy_admin", "instructor"].includes(role))
    throw new Error("Access restricted to academy staff.");
  const result = await db
    .from("support_tickets")
    .select(
      "id,title,description,status,created_at,ticket_messages(id,body,created_at)",
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  if (result.error) throw new Error(result.error.message);
  return result.data ?? [];
}

export async function enrollExistingStudentAction(input: {
  organizationId: string;
  courseId: string;
  studentId: string;
}) {
  const { db, role } = await member(input.organizationId);
  if (!["academy_admin", "instructor"].includes(role))
    throw new Error("Access restricted to academy staff.");
  const student = await db
    .from("memberships")
    .select("profile_id")
    .eq("profile_id", input.studentId)
    .eq("organization_id", input.organizationId)
    .eq("role", "student")
    .single();
  const course = await db
    .from("courses")
    .select("id")
    .eq("id", input.courseId)
    .eq("organization_id", input.organizationId)
    .single();
  if (student.error || course.error)
    throw new Error("Invalid student or course.");
  const existing = await db
    .from("enrollments")
    .select("id,status")
    .eq("course_id", input.courseId)
    .eq("student_id", input.studentId)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data && existing.data.status !== "cancelled") return;
  const result = existing.data
    ? await db
        .from("enrollments")
        .update({ status: "enrolled" })
        .eq("id", existing.data.id)
    : await db
        .from("enrollments")
        .insert({
          organization_id: input.organizationId,
          student_id: input.studentId,
          course_id: input.courseId,
        });
  if (result.error) throw new Error(result.error.message);
  revalidatePath("/learning/platform");
}

export async function recordPaymentAction(input: {
  organizationId: string;
  studentId: string;
  amount: number;
  dueDate: string;
  reference: string;
  status: string;
}) {
  const { db, role } = await member(input.organizationId);
  if (role !== "academy_admin")
    throw new Error("Only an administrator can record payments.");
  if (
    !Number.isFinite(input.amount) ||
    input.amount < 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate) ||
    !["paid", "pending", "overdue", "waived"].includes(input.status)
  )
    throw new Error("Check the amount, date and status.");
  const student = await db
    .from("memberships")
    .select("profile_id")
    .eq("organization_id", input.organizationId)
    .eq("profile_id", input.studentId)
    .eq("role", "student")
    .single();
  if (student.error) throw new Error("Invalid student.");
  const org = await db
    .from("organizations")
    .select("currency")
    .eq("id", input.organizationId)
    .single();
  if (org.error) throw new Error(org.error.message);
  const result = await db
    .from("payments")
    .insert({
      organization_id: input.organizationId,
      student_id: input.studentId,
      amount: input.amount,
      currency: org.data.currency,
      due_date: input.dueDate,
      status: input.status,
      reference: input.reference.trim().slice(0, 200),
      paid_at: input.status === "paid" ? new Date().toISOString() : null,
    });
  if (result.error) throw new Error(result.error.message);
  revalidatePath("/learning/platform");
}
