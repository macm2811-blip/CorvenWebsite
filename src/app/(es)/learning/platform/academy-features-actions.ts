"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { learningContext } from "@/lib/lms/access";
import { studentCourseAction } from "./student-actions";

const isoDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const refresh = () => revalidatePath("/learning/platform");

export async function academyFeaturesAction(org: string) {
  const ctx = await learningContext(org);
  const admin = createAdminClient();
  const reports = admin
    .from("payment_reports")
    .select(
      "id,student_id,amount,requested_due_date,status,created_at,review_note",
    )
    .eq("organization_id", org)
    .order("created_at", { ascending: false });
  const referrals = admin
    .from("referrals")
    .select("id,referrer_id,name,phone,email,matched_student_id,created_at")
    .eq("organization_id", org)
    .order("created_at", { ascending: false });
  const submissions = admin
    .from("assignment_submissions")
    .select(
      "id,student_id,lesson_id,body,attachment_path,status,grade,feedback,submitted_at",
    )
    .eq("organization_id", org)
    .order("submitted_at", { ascending: false });
  if (ctx.membership.role !== "academy_admin") reports.eq("student_id", ctx.user.id);
  if (!ctx.isStaff) {
    referrals.eq("referrer_id", ctx.user.id);
    submissions.eq("student_id", ctx.user.id);
  }
  const [r, f, s, certs] = await Promise.all([
    reports,
    referrals,
    submissions,
    admin
      .from("learning_certificates")
      .select(
        "id,student_id,course_id,student_name,course_title,score,issued_at",
      )
      .eq("organization_id", org)
      .eq("student_id", ctx.user.id),
  ]);
  for (const result of [r, f, s, certs])
    if (result.error) throw new Error(result.error.message);
  let reviews: {
    id: string;
    student_id: string;
    quiz_id: string;
    answers: Record<string, string | string[]>;
    question_snapshot: { id: string; prompt: string; type: string }[];
    automatic_points: number;
  }[] = [];
  if (ctx.isStaff) {
    const courses = await admin
      .from("courses")
      .select("id")
      .eq("organization_id", org);
    if (courses.error) throw courses.error;
    const quizzes = courses.data.length ? await admin
      .from("quizzes")
      .select("id")
      .in(
        "course_id",
        courses.data.map((c) => c.id),
      ) : { data: [], error: null };
    if (quizzes.error) throw quizzes.error;
    if (quizzes.data.length) {
      const a = await admin
        .from("quiz_attempts")
        .select(
          "id,student_id,quiz_id,answers,question_snapshot,automatic_points",
        )
        .in(
          "quiz_id",
          quizzes.data.map((q) => q.id),
        )
        .eq("review_state", "pending_review");
      if (a.error) throw a.error;
      reviews = a.data ?? [];
    }
  }
  return {
    reports: r.data ?? [],
    referrals: f.data ?? [],
    submissions: s.data ?? [],
    certificates: certs.data ?? [],
    reviews,
    membership: ctx.membership,
    currency: ctx.organization.currency,
    emailReady: Boolean(
      process.env.RESEND_API_KEY && process.env.REFERRAL_FROM_EMAIL,
    ),
  };
}

async function uploadPrivate(
  org: string,
  user: string,
  file: File,
  kind: string,
) {
  if (file.size > 3 * 1024 * 1024 || !file.size)
    throw new Error("Choose a file up to 3 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
      ? "image/png"
      : bytes[0] === 255 && bytes[1] === 216
        ? "image/jpeg"
        : new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-"
          ? "application/pdf"
          : new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
              new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
            ? "image/webp"
            : "";
  if (!mime) throw new Error("Use a PNG, JPG, WEBP or PDF file.");
  const path = `${org}/${user}/${kind}/${crypto.randomUUID()}.${mime.split("/")[1]}`;
  const result = await createAdminClient()
    .storage.from("learning-private")
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (result.error) throw new Error(result.error.message);
  return path;
}

export async function reportPaymentAction(org: string, form: FormData) {
  const ctx = await learningContext(org);
  if (ctx.membership.role !== "student")
    throw new Error("Student account required.");
  const amount = Number(form.get("amount")),
    due = String(form.get("dueDate")),
    file = form.get("receipt");
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 100000000 ||
    !isoDate(due) ||
    !(file instanceof File)
  )
    throw new Error("Check the amount, due date and receipt.");
  const path = await uploadPrivate(org, ctx.user.id, file, "payments");
  const admin = createAdminClient();
  const result = await admin
    .from("payment_reports")
    .insert({
      organization_id: org,
      student_id: ctx.user.id,
      amount,
      requested_due_date: due,
      receipt_path: path,
    });
  if (result.error) {
    await admin.storage.from("learning-private").remove([path]);
    throw new Error(result.error.message);
  }
  const staff = await admin
    .from("memberships")
    .select("profile_id")
    .eq("organization_id", org)
    .eq("role", "academy_admin")
    .eq("access_status", "active");
  if (staff.data?.length)
    await admin
      .from("notifications")
      .insert(
        staff.data.map((m) => ({
          organization_id: org,
          profile_id: m.profile_id,
          type: "payment",
          title: "Payment awaiting review",
          body: "A student uploaded a payment receipt. Review it under Income.",
        })),
      );
  refresh();
}

export async function privateAttachmentAction(
  org: string,
  id: string,
  kind: "payment" | "assignment",
) {
  const ctx = await learningContext(org);
  const admin = createAdminClient();
  const result =
    kind === "payment"
      ? await admin
          .from("payment_reports")
          .select("student_id,receipt_path")
          .eq("organization_id", org)
          .eq("id", id)
          .single()
      : await admin
          .from("assignment_submissions")
          .select("student_id,attachment_path")
          .eq("organization_id", org)
          .eq("id", id)
          .single();
  if (result.error || (!(kind === "payment" ? ctx.membership.role === "academy_admin" : ctx.isStaff) && result.data.student_id !== ctx.user.id))
    throw new Error("Attachment unavailable.");
  const path =
    "receipt_path" in result.data
      ? result.data.receipt_path
      : result.data.attachment_path;
  if (!path) throw new Error("No attachment.");
  const signed = await admin.storage
    .from("learning-private")
    .createSignedUrl(path, 120);
  if (signed.error) throw signed.error;
  return signed.data.signedUrl;
}

export async function reviewPaymentAction(
  org: string,
  id: string,
  approve: boolean,
  start: string,
  end: string,
  note: string,
) {
  const ctx = await learningContext(org, true);
  if (ctx.membership.role !== "academy_admin")
    throw new Error("Administrator access required.");
  if (approve && (!isoDate(start) || !isoDate(end) || end < start))
    throw new Error("Choose valid coverage dates.");
  const report = await ctx.db
    .from("payment_reports")
    .select("id")
    .eq("organization_id", org)
    .eq("id", id)
    .single();
  if (report.error) throw new Error("Report unavailable.");
  const result = await createAdminClient().rpc("review_payment_report", {
    p_actor: ctx.user.id,
    p_report: id,
    p_approve: approve,
    p_start: approve ? start : null,
    p_end: approve ? end : null,
    p_note: note.slice(0, 2000),
  });
  if (result.error) throw result.error;
  refresh();
}

export async function updateStudentDetailsAction(
  org: string,
  id: string,
  groupName: string,
  planName: string,
) {
  await learningContext(org, true);
  const result = await createAdminClient()
    .from("memberships")
    .update({
      group_name: groupName.trim().slice(0, 80),
      plan_name: planName.trim().slice(0, 120),
    })
    .eq("organization_id", org)
    .eq("profile_id", id)
    .eq("role", "student")
    .select("profile_id")
    .single();
  if (result.error) throw result.error;
  refresh();
}

export async function submitAssignmentAction(
  org: string,
  courseId: string,
  lessonId: string,
  form: FormData,
) {
  const ctx = await learningContext(org);
  const course = await studentCourseAction(org, courseId);
  const lesson = course.lessons.find((l) => l.id === lessonId);
  if (!lesson || lesson.content_config?.activityType !== "assignment")
    throw new Error("Assignment unavailable.");
  const body = String(form.get("body") ?? "").trim();
  if (!body || body.length > 12000)
    throw new Error(
      "Enter your assignment response (up to 12,000 characters).",
    );
  const file = form.get("attachment");
  const path =
    file instanceof File && file.size
      ? await uploadPrivate(org, ctx.user.id, file, "assignments")
      : null;
  const result = await createAdminClient()
    .from("assignment_submissions")
    .upsert(
      {
        organization_id: org,
        lesson_id: lessonId,
        student_id: ctx.user.id,
        body,
        attachment_path: path,
        status: "submitted",
        grade: null,
        feedback: "",
        reviewed_by: null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "lesson_id,student_id" },
    );
  if (result.error) throw result.error;
  refresh();
}

export async function reviewAssignmentAction(
  org: string,
  id: string,
  grade: number,
  feedback: string,
) {
  await learningContext(org, true);
  if (!Number.isFinite(grade) || grade < 0 || grade > 100)
    throw new Error("Grade must be between 0 and 100.");
  const ctx = await learningContext(org, true);
  const result = await createAdminClient()
    .from("assignment_submissions")
    .update({
      status: "reviewed",
      grade,
      feedback: feedback.slice(0, 5000),
      reviewed_by: ctx.user.id,
    })
    .eq("organization_id", org)
    .eq("id", id)
    .select("id")
    .single();
  if (result.error) throw result.error;
  refresh();
}

export async function reviewAttemptAction(
  org: string,
  id: string,
  marks: Record<string, number>,
  feedback: string,
) {
  const ctx = await learningContext(org, true);
  const admin = createAdminClient();
  const a = await admin
    .from("quiz_attempts")
    .select("quizzes!inner(courses!inner(organization_id))")
    .eq("id", id)
    .single();
  const nested = a.data?.quizzes as unknown as {
    courses: { organization_id: string };
  };
  if (a.error || nested?.courses?.organization_id !== org)
    throw new Error("Attempt unavailable.");
  const result = await admin.rpc("review_learning_attempt", {
    p_actor: ctx.user.id,
    p_attempt: id,
    p_marks: marks,
    p_feedback: feedback.slice(0, 5000),
  });
  if (result.error) throw result.error;
  refresh();
}

export async function referFriendAction(org: string, form: FormData) {
  const ctx = await learningContext(org);
  const name = String(form.get("name") ?? "").trim(),
    email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase(),
    phone = String(form.get("phone") ?? "").trim();
  if (
    name.length < 2 ||
    name.length > 150 ||
    phone.length > 40 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    email === ctx.user.email?.toLowerCase()
  )
    throw new Error("Check your friend's contact details.");
  const admin = createAdminClient();
  const result = await admin
    .from("referrals")
    .insert({
      organization_id: org,
      referrer_id: ctx.user.id,
      name,
      email,
      phone,
    })
    .select("id")
    .single();
  if (result.error)
    throw new Error(
      result.error.code === "23505"
        ? "This contact has already been referred."
        : result.error.message,
    );
  const settings = await admin
    .from("academy_settings")
    .select("referral_email_subject,referral_email_body")
    .eq("organization_id", org)
    .maybeSingle();
  const queued = await admin
    .from("platform_email_outbox")
    .insert({
      organization_id: org,
      referral_id: result.data.id,
      recipient: email,
      subject:
        settings.data?.referral_email_subject ??
        `Welcome to ${ctx.organization.name}`,
      body:
        settings.data?.referral_email_body ??
        `A friend recommended ${ctx.organization.name}. Contact the academy to learn about our English classes.`,
    });
  if (queued.error) throw queued.error;
  refresh();
  return { emailQueued: true };
}

export async function certificateAction(org: string, courseId: string) {
  const ctx = await learningContext(org);
  const course = await studentCourseAction(org, courseId);
  const admin = createAdminClient();
  const selected = await admin
    .from("courses")
    .select("level")
    .eq("id", course.course.id)
    .eq("organization_id", org)
    .single();
  if (selected.error) throw selected.error;
  const units = await admin
    .from("courses")
    .select("id")
    .eq("organization_id", org)
    .eq("level", selected.data.level)
    .eq("status", "published")
    .order("id");
  if (units.error) throw units.error;
  const details = await Promise.all(
    units.data.map((u) => studentCourseAction(org, u.id)),
  );
  if (
    !details.length ||
    details.some(
      (d) =>
        !d.lessons.length ||
        d.percentage !== 100 ||
        d.quizzes.some(
          (q) =>
            !d.attempts.some(
              (a) =>
                a.quiz_id === q.id && a.passed && a.review_state === "graded",
            ),
        ),
    )
  )
    throw new Error(
      "Complete every published unit and pass every assessment in this level first.",
    );
  const profile = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", ctx.user.id)
    .single();
  if (profile.error) throw profile.error;
  const scores = details.flatMap((d) =>
    d.quizzes.map((q) =>
      Math.max(
        ...d.attempts
          .filter(
            (a) =>
              a.quiz_id === q.id && a.passed && a.review_state === "graded",
          )
          .map((a) => Number(a.score)),
      ),
    ),
  );
  const anchor = units.data[0].id;
  const result = await admin
    .from("learning_certificates")
    .upsert(
      {
        organization_id: org,
        student_id: ctx.user.id,
        course_id: anchor,
        student_name: profile.data.full_name,
        course_title: `${selected.data.level} · ${ctx.organization.name}`,
        score: scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : null,
      },
      { onConflict: "student_id,course_id", ignoreDuplicates: true },
    );
  if (result.error) throw result.error;
  const saved = await admin
    .from("learning_certificates")
    .select("id,student_name,course_title,score,issued_at")
    .eq("student_id", ctx.user.id)
    .eq("course_id", anchor)
    .single();
  if (saved.error) throw saved.error;
  return saved.data;
}

export async function learningCatalogAction(org: string) {
  await learningContext(org);
  const result = await createAdminClient()
    .from("courses")
    .select("id,title,level")
    .eq("organization_id", org)
    .eq("status", "published")
    .order("created_at");
  if (result.error) throw result.error;
  return result.data;
}
