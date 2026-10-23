"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { videoSource } from "@/lib/lms/video";
import type {
  LmsAcademy,
  LmsAcademyAdmin,
  LmsCourseBlock,
  LmsCourseBlockConfig,
  LmsCourseBlockKind,
} from "@/lib/lms/types";

type ActionResult<T = undefined> = {
  ok: boolean;
  message: string;
  data?: T;
};

type StudentChanges = {
  active?: boolean;
  payment?: "Pagado" | "Pendiente" | "Vencido";
  dueDate?: string;
};

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const courseBlockKinds: LmsCourseBlockKind[] = [
  "text",
  "image",
  "youtube",
  "document",
  "audio",
  "quiz",
  "exam",
];

const defaultBlockConfig: LmsCourseBlockConfig = {
  fontFamily: "inter",
  fontSize: "normal",
  textColor: "#111827",
  backgroundColor: "#FFFFFF",
  borderColor: "#D0D5DD",
  align: "left",
  width: "full",
  textStyle: "paragraph",
  lineHeight: "normal",
  letterSpacing: "normal",
  padding: "normal",
  radius: "medium",
  borderStyle: "none",
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  uppercase: false,
};

const fontFamilies: LmsCourseBlockConfig["fontFamily"][] = [
  "inter", "arial", "helvetica", "verdana", "tahoma", "trebuchet", "georgia",
  "times", "garamond", "palatino", "bookman", "courier", "monaco", "roboto",
  "open-sans", "lato", "montserrat", "poppins", "merriweather", "playfair",
];

function validHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function normalizeBlockConfig(value?: Partial<LmsCourseBlockConfig>): LmsCourseBlockConfig {
  return {
    fontFamily: fontFamilies.includes(value?.fontFamily ?? defaultBlockConfig.fontFamily)
      ? value!.fontFamily!
      : defaultBlockConfig.fontFamily,
    fontSize: ["xs", "small", "normal", "large", "xl", "title", "display"].includes(value?.fontSize ?? "")
      ? value!.fontSize!
      : defaultBlockConfig.fontSize,
    textColor: validHex(value?.textColor ?? "") ? value!.textColor! : defaultBlockConfig.textColor,
    backgroundColor: validHex(value?.backgroundColor ?? "")
      ? value!.backgroundColor!
      : defaultBlockConfig.backgroundColor,
    borderColor: validHex(value?.borderColor ?? "") ? value!.borderColor! : defaultBlockConfig.borderColor,
    align: ["left", "center", "right", "justify"].includes(value?.align ?? "")
      ? value!.align!
      : defaultBlockConfig.align,
    width: ["full", "half", "third"].includes(value?.width ?? "")
      ? value!.width!
      : defaultBlockConfig.width,
    textStyle: ["paragraph", "heading1", "heading2", "heading3", "quote", "callout"].includes(value?.textStyle ?? "") ? value!.textStyle! : defaultBlockConfig.textStyle,
    lineHeight: ["compact", "normal", "relaxed", "spacious"].includes(value?.lineHeight ?? "") ? value!.lineHeight! : defaultBlockConfig.lineHeight,
    letterSpacing: ["tight", "normal", "wide"].includes(value?.letterSpacing ?? "") ? value!.letterSpacing! : defaultBlockConfig.letterSpacing,
    padding: ["none", "compact", "normal", "roomy"].includes(value?.padding ?? "") ? value!.padding! : defaultBlockConfig.padding,
    radius: ["none", "small", "medium", "large"].includes(value?.radius ?? "") ? value!.radius! : defaultBlockConfig.radius,
    borderStyle: ["none", "solid", "dashed"].includes(value?.borderStyle ?? "") ? value!.borderStyle! : defaultBlockConfig.borderStyle,
    bold: Boolean(value?.bold),
    italic: Boolean(value?.italic),
    underline: Boolean(value?.underline),
    strikethrough: Boolean(value?.strikethrough),
    uppercase: Boolean(value?.uppercase),
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

async function actor() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : "";
  if (error || !userId) throw new Error("Your session expired. Please sign in again.");
  return { supabase, userId };
}

async function requireStaff(organizationId: string) {
  if (!validUuid(organizationId)) throw new Error("Invalid academy.");
  const context = await actor();
  const [{ data: profile }, { data: membership }] = await Promise.all([
    context.supabase
      .from("profiles")
      .select("platform_role")
      .eq("id", context.userId)
      .single(),
    context.supabase
      .from("memberships")
      .select("role, access_status")
      .eq("organization_id", organizationId)
      .eq("profile_id", context.userId)
      .maybeSingle(),
  ]);

  const platformRole = profile?.platform_role;
  const allowed =
    platformRole === "owner" ||
    platformRole === "support" ||
    ((membership?.role === "academy_admin" || membership?.role === "instructor") &&
      membership?.access_status === "active");

  if (!allowed) throw new Error("You do not have permission to perform this action.");
  return context;
}

async function requireOwner() {
  const context = await actor();
  const { data: profile, error } = await context.supabase
    .from("profiles")
    .select("platform_role")
    .eq("id", context.userId)
    .single();
  if (error || profile?.platform_role !== "owner") {
    throw new Error("Only the CORVEN owner can perform this action.");
  }
  return context;
}

async function audit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  organizationId: string,
  action: string,
  entityType: string,
  entityId?: string,
) {
  await supabase.from("audit_events").insert({
    organization_id: organizationId,
    actor_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
  });
}

export async function createAcademyAction(input: {
  name: string;
  learningModel: LmsAcademy["learningModel"];
  monthlyFee: number;
  primaryColor: string;
}): Promise<ActionResult<LmsAcademy>> {
  try {
    const { supabase, userId } = await requireOwner();
    const name = input.name.trim().replace(/\s+/g, " ").slice(0, 120);
    if (name.length < 3) throw new Error("Enter a valid academy name.");
    if (!(["self_paced", "instructor_led", "hybrid"] as const).includes(input.learningModel)) {
      throw new Error("Select a valid learning model.");
    }
    if (!/^#[0-9a-f]{6}$/i.test(input.primaryColor)) throw new Error("Select a valid color.");
    const monthlyFee = Math.max(0, Math.min(10000000, Math.round(Number(input.monthlyFee) || 0)));
    const baseSlug = slugify(name) || "academia";
    const admin = createAdminClient();
    const { data: slugRows, error: slugError } = await admin
      .from("organizations")
      .select("slug")
      .like("slug", `${baseSlug}%`);
    if (slugError) throw slugError;
    const usedSlugs = new Set((slugRows ?? []).map((row) => row.slug));
    let slug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;

    const { data: academy, error } = await admin
      .from("organizations")
      .insert({
        name,
        slug,
        status: "active",
        learning_model: input.learningModel,
        default_monthly_fee: monthlyFee,
        currency: "CRC",
      })
      .select("id, name, slug, status, learning_model, currency, created_at")
      .single();
    if (error || !academy) throw error ?? new Error("Unable to create the academy.");

    const { error: brandingError } = await admin.from("organization_branding").insert({
      organization_id: academy.id,
      primary_color: input.primaryColor,
      secondary_color: "#111827",
      accent_color: "#F97316",
    });
    if (brandingError) throw brandingError;

    await audit(supabase, userId, academy.id, "academy.created", "organization", academy.id);
    revalidatePath("/learning/platform");
    return {
      ok: true,
      message: `${name} was created successfully.`,
      data: {
        id: academy.id,
        name: academy.name,
        slug: academy.slug,
        status: "active",
        learningModel: academy.learning_model,
        studentCount: 0,
        courseCount: 0,
        adminCount: 0,
        monthlyRevenue: 0,
        defaultMonthlyFee: monthlyFee,
        currency: academy.currency,
        createdAt: new Intl.DateTimeFormat("es-CR", { dateStyle: "medium", timeZone: "America/Costa_Rica" }).format(new Date(academy.created_at)),
        admins: [],
        students: [],
        courses: [],
      },
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to create the academy." };
  }
}

export async function inviteAcademyAdminAction(input: {
  organizationId: string;
  fullName: string;
  email: string;
}): Promise<ActionResult<LmsAcademyAdmin>> {
  try {
    const { supabase, userId } = await requireOwner();
    if (!validUuid(input.organizationId)) throw new Error("Invalid academy.");
    const fullName = input.fullName.trim().replace(/\s+/g, " ").slice(0, 120);
    const email = input.email.trim().toLowerCase();
    if (fullName.length < 2 || !validEmail(email)) throw new Error("Check the name and email address.");

    const admin = createAdminClient();
    const { data: academy, error: academyError } = await admin
      .from("organizations")
      .select("id, name")
      .eq("id", input.organizationId)
      .single();
    if (academyError || !academy) throw new Error("Academy not found.");

    const { data: existingProfile, error: profileError } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .eq("email", email)
      .limit(1)
      .maybeSingle();
    if (profileError) throw profileError;

    let profileId = existingProfile?.id ?? "";
    let invitationSent = false;
    if (!profileId) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
      if (!siteUrl) throw new Error("Falta NEXT_PUBLIC_SITE_URL.");
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName },
        redirectTo: `${siteUrl}/learning/auth/callback?next=/learning/account/update-password`,
      });
      if (error || !data.user) throw new Error(error?.message ?? "Unable to create the invitation.");
      profileId = data.user.id;
      invitationSent = true;
    } else if (existingProfile?.full_name !== fullName) {
      const { error } = await admin.from("profiles").update({ full_name: fullName }).eq("id", profileId);
      if (error) throw error;
    }

    const { data: authData } = await admin.auth.admin.getUserById(profileId);
    const accessStatus = authData.user?.email_confirmed_at ? "active" as const : "invited" as const;
    const { error: membershipError } = await admin.from("memberships").upsert({
      organization_id: input.organizationId,
      profile_id: profileId,
      role: "academy_admin",
      access_status: accessStatus,
      payment_status: "waived",
      monthly_fee: 0,
      level: "A1",
    }, { onConflict: "organization_id,profile_id" });
    if (membershipError) throw membershipError;

    await audit(supabase, userId, input.organizationId, "academy.admin_invited", "profile", profileId);
    revalidatePath("/learning/platform");
    return {
      ok: true,
      message: invitationSent
        ? `Invitation sent to ${email} to administer ${academy.name}.`
        : `${fullName} fue asignado como administrador de ${academy.name}.`,
      data: {
        id: profileId,
        name: fullName,
        email,
        role: "academy_admin",
        accessStatus,
      },
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to assign the administrator." };
  }
}

export async function updateAcademyStatusAction(input: {
  organizationId: string;
  status: "active" | "suspended";
}): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireOwner();
    if (!validUuid(input.organizationId)) throw new Error("Invalid academy.");
    if (input.status !== "active" && input.status !== "suspended") throw new Error("Invalid status.");
    const admin = createAdminClient();
    const { error } = await admin
      .from("organizations")
      .update({ status: input.status })
      .eq("id", input.organizationId);
    if (error) throw error;
    await audit(supabase, userId, input.organizationId, "academy.status_updated", "organization", input.organizationId);
    revalidatePath("/learning/platform");
    return { ok: true, message: input.status === "active" ? "Academy reactivated." : "Academy suspended." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to update the academy." };
  }
}

export async function updateStudentAction(input: {
  organizationId: string;
  studentId: string;
  changes: StudentChanges;
}): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    if (!validUuid(input.studentId)) throw new Error("Invalid student.");

    const updates: Record<string, string> = {};
    if (typeof input.changes.active === "boolean") {
      updates.access_status = input.changes.active ? "active" : "suspended";
    }
    if (input.changes.payment) {
      updates.payment_status = {
        Pagado: "paid",
        Pendiente: "pending",
        Vencido: "overdue",
      }[input.changes.payment];
    }
    if (input.changes.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(input.changes.dueDate)) {
      updates.billing_due_date = input.changes.dueDate;
    }
    if (!Object.keys(updates).length) throw new Error("No valid changes.");

    const { error } = await supabase
      .from("memberships")
      .update(updates)
      .eq("organization_id", input.organizationId)
      .eq("profile_id", input.studentId)
      .eq("role", "student");
    if (error) throw error;

    await audit(supabase, userId, input.organizationId, "student.updated", "membership", input.studentId);
    revalidatePath("/learning/platform");
    return { ok: true, message: "Student updated." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to update the student." };
  }
}

export async function inviteStudentAction(input: {
  organizationId: string;
  fullName: string;
  email: string;
  level: string;
  dueDate: string;
  monthlyFee: number;
  courseId?: string;
}): Promise<ActionResult<{ id: string; accessStatus: "invited" | "active" }>> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    const fullName = input.fullName.trim().slice(0, 120);
    const email = input.email.trim().toLowerCase();
    const level = input.level.trim().toUpperCase();
    if (fullName.length < 2 || !validEmail(email)) throw new Error("Check the name and email address.");
    if (!/^(A1|A2|B1|B2|C1)$/.test(level)) throw new Error("Invalid level.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) throw new Error("Invalid payment due date.");

    const admin = createAdminClient();
    const { data: academy, error: academyError } = await admin
      .from("organizations")
      .select("id, name")
      .eq("id", input.organizationId)
      .single();
    if (academyError || !academy) throw new Error("Academy not found.");

    const { data: existingProfile, error: profileError } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("email", email)
      .limit(1)
      .maybeSingle();
    if (profileError) throw profileError;

    let profileId = existingProfile?.id ?? "";
    let invitationSent = false;
    if (!profileId) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
      if (!siteUrl) throw new Error("Falta NEXT_PUBLIC_SITE_URL.");
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName },
        redirectTo: `${siteUrl}/learning/auth/callback?next=/learning/account/update-password`,
      });
      if (error || !data.user) throw new Error(error?.message ?? "Unable to create the invitation.");
      profileId = data.user.id;
      invitationSent = true;
    } else if (existingProfile?.full_name !== fullName) {
      const { error } = await admin.from("profiles").update({ full_name: fullName }).eq("id", profileId);
      if (error) throw error;
    }

    const { data: authData } = await admin.auth.admin.getUserById(profileId);
    const accessStatus = authData.user?.email_confirmed_at ? "active" : "invited";

    const { error: membershipError } = await admin.from("memberships").upsert({
      organization_id: input.organizationId,
      profile_id: profileId,
      role: "student",
      access_status: accessStatus,
      payment_status: "pending",
      billing_due_date: input.dueDate,
      monthly_fee: Math.max(0, Number(input.monthlyFee) || 0),
      level,
    }, { onConflict: "organization_id,profile_id" });
    if (membershipError) throw membershipError;

    if (input.courseId && validUuid(input.courseId)) {
      const { data: course, error: courseError } = await admin
        .from("courses")
        .select("id")
        .eq("id", input.courseId)
        .eq("organization_id", input.organizationId)
        .maybeSingle();
      if (courseError) throw courseError;
      if (!course) throw new Error("El curso no pertenece a esta academia.");
      const { error: enrollmentError } = await admin.from("enrollments").upsert({
        organization_id: input.organizationId,
        course_id: input.courseId,
        student_id: profileId,
        status: "enrolled",
      }, { onConflict: "course_id,student_id" });
      if (enrollmentError) throw enrollmentError;
    }

    await audit(supabase, userId, input.organizationId, invitationSent ? "student.invited" : "student.assigned", "profile", profileId);
    revalidatePath("/learning/platform");
    return {
      ok: true,
      message: invitationSent
        ? `Invitation sent to ${email} to join ${academy.name}.`
        : `${fullName} fue asignado como estudiante de ${academy.name}.`,
      data: { id: profileId, accessStatus },
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to invite the student." };
  }
}

export async function sendPasswordResetAction(email: string): Promise<ActionResult> {
  try {
    if (!validEmail(email)) throw new Error("Invalid email address.");
    const { supabase } = await actor();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    if (!siteUrl) throw new Error("Falta NEXT_PUBLIC_SITE_URL.");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/learning/auth/callback?next=/learning/account/update-password`,
    });
    if (error) throw error;
    return { ok: true, message: `Password reset link sent to ${email}.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to send the link." };
  }
}

export async function createCourseAction(input: {
  organizationId: string;
  title: string;
  level: string;
  description: string;
  youtubeUrl: string;
  color?: string;
  template?: "blank" | "guided" | "single";
  passingScore?: number;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    const title = input.title.trim().slice(0, 160);
    if (title.length < 3) throw new Error("Escribe un nombre para el curso.");
    if (input.youtubeUrl && !videoSource(input.youtubeUrl)) {
      throw new Error("Use a valid YouTube link.");
    }

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        organization_id: input.organizationId,
        created_by: userId,
        title,
        slug: `${slugify(title)}-${Date.now().toString(36)}`,
        description: input.description.trim().slice(0, 2000),
        level: input.level,
        cover_url: validHex(input.color ?? "") ? `color:${input.color!.toUpperCase()}` : null,
        status: "draft",
        passing_score: Math.max(0, Math.min(100, Math.round(input.passingScore ?? 80))),
      })
      .select("id")
      .single();
    if (error || !course) throw error ?? new Error("The course could not be created.");

    const { data: module, error: moduleError } = await supabase
      .from("modules")
      .insert({ course_id: course.id, title: "Module 1", position: 1 })
      .select("id")
      .single();
    if (moduleError || !module) throw moduleError ?? new Error("The initial module could not be created.");

    const template = input.template ?? "guided";
    const lessons: Array<{
      module_id: string;
      title: string;
      description: string;
      content_type: string;
      body: string | null;
      youtube_url: string | null;
      resource_url: string | null;
      position: number;
      content_config: LmsCourseBlockConfig;
    }> = input.youtubeUrl
      ? [{ module_id: module.id, title: "Welcome video", description: "Course introduction.", content_type: "youtube", body: null, youtube_url: input.youtubeUrl, resource_url: null, position: 1, content_config: defaultBlockConfig }]
      : template === "guided"
        ? [
            { module_id: module.id, title: "Welcome", description: "Introduce the course purpose and learning experience.", content_type: "text", body: "Welcome! Edit this block to introduce the course.", youtube_url: null, resource_url: null, position: 1, content_config: defaultBlockConfig },
            { module_id: module.id, title: "Learning objectives", description: "Define clear, measurable outcomes.", content_type: "text", body: "By the end of this course, the student will be able to:\n• Objective 1\n• Objective 2\n• Objective 3", youtube_url: null, resource_url: null, position: 2, content_config: { ...defaultBlockConfig, textStyle: "callout" as const } },
            { module_id: module.id, title: "Main content", description: "Develop the first unit here.", content_type: "text", body: "Start developing the first unit content.", youtube_url: null, resource_url: null, position: 3, content_config: defaultBlockConfig },
          ]
        : template === "single"
          ? [{ module_id: module.id, title: "First lesson", description: "Initial course content.", content_type: "text", body: "Write the first lesson content here.", youtube_url: null, resource_url: null, position: 1, content_config: defaultBlockConfig }]
          : [];
    if (lessons.length) {
      const { error: lessonError } = await supabase.from("lessons").insert(lessons);
      if (lessonError) throw lessonError;
    }

    await audit(supabase, userId, input.organizationId, "course.created", "course", course.id);
    revalidatePath("/learning/platform");
    return { ok: true, message: "Course created as a draft.", data: { id: course.id } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to create the course." };
  }
}

export async function setCoursePublishedAction(input: {
  organizationId: string;
  courseId: string;
  published: boolean;
}): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    const { error } = await supabase
      .from("courses")
      .update({ status: input.published ? "published" : "draft" })
      .eq("organization_id", input.organizationId)
      .eq("id", input.courseId);
    if (error) throw error;
    await audit(supabase, userId, input.organizationId, input.published ? "course.published" : "course.unpublished", "course", input.courseId);
    revalidatePath("/learning/platform");
    return { ok: true, message: input.published ? "Course published." : "Course moved to draft." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to update the course." };
  }
}

export async function addLessonAction(input: {
  organizationId: string;
  courseId: string;
  title: string;
  description: string;
  contentType: "text" | "youtube" | "document" | "audio";
  contentUrl?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    const title = input.title.trim().slice(0, 180);
    if (title.length < 2) throw new Error("Enter the lesson name.");
    if (input.contentType === "youtube" && !videoSource(input.contentUrl ?? "")) {
      throw new Error("Use a valid YouTube link.");
    }
    if ((input.contentType === "document" || input.contentType === "audio") && !/^https:\/\//i.test(input.contentUrl ?? "")) {
      throw new Error("Use a valid HTTPS resource link.");
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", input.courseId)
      .eq("organization_id", input.organizationId)
      .single();
    if (courseError || !course) throw courseError ?? new Error("Curso no encontrado.");

    let { data: module } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", input.courseId)
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!module) {
      const created = await supabase
        .from("modules")
        .insert({ course_id: input.courseId, title: "Module 1", position: 1 })
        .select("id")
        .single();
      if (created.error || !created.data) throw created.error ?? new Error("The module could not be created.");
      module = created.data;
    }

    const { data: latest } = await supabase
      .from("lessons")
      .select("position")
      .eq("module_id", module.id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = Number(latest?.position ?? 0) + 1;
    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({
        module_id: module.id,
        title,
        description: input.description.trim().slice(0, 3000),
        content_type: input.contentType,
        body: input.contentType === "text" ? input.description.trim() : null,
        youtube_url: input.contentType === "youtube" ? input.contentUrl : null,
        resource_url: input.contentType === "document" || input.contentType === "audio" ? input.contentUrl : null,
        position,
      })
      .select("id")
      .single();
    if (error || !lesson) throw error ?? new Error("The lesson could not be created.");
    await audit(supabase, userId, input.organizationId, "lesson.created", "lesson", lesson.id);
    revalidatePath("/learning/platform");
    return { ok: true, message: "Lesson added to the course.", data: { id: lesson.id } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to create the lesson." };
  }
}

export async function loadCourseStudioAction(input: {
  organizationId: string;
  courseId: string;
}): Promise<ActionResult<{ blocks: LmsCourseBlock[]; modules: { id: string; title: string; position: number }[] }>> {
  try {
    const { supabase } = await requireStaff(input.organizationId);
    if (!validUuid(input.courseId)) throw new Error("Invalid course.");
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("id", input.courseId)
      .single();
    if (courseError || !course) throw new Error("Course not found.");

    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id, title, position")
      .eq("course_id", input.courseId)
      .order("position", { ascending: true });
    if (modulesError) throw modulesError;
    const moduleIds = (modules ?? []).map((module) => module.id);
    const lessonsResult = moduleIds.length
      ? await supabase
          .from("lessons")
          .select("id, module_id, title, description, content_type, body, youtube_url, resource_url, position, content_config")
          .in("module_id", moduleIds)
          .order("position", { ascending: true })
      : { data: [], error: null };
    if (lessonsResult.error) throw lessonsResult.error;

    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("id, title, description, assessment_type, passing_score, max_attempts, position, content_config")
      .eq("course_id", input.courseId)
      .order("position", { ascending: true });
    if (quizzesError) throw quizzesError;
    const quizIds = (quizzes ?? []).map((quiz) => quiz.id);
    const questionsResult = quizIds.length
      ? await supabase
          .from("quiz_questions")
          .select("id, quiz_id, prompt, options, correct_answer, position")
          .in("quiz_id", quizIds)
          .order("position", { ascending: true })
      : { data: [], error: null };
    if (questionsResult.error) throw questionsResult.error;

    const lessonBlocks: LmsCourseBlock[] = (lessonsResult.data ?? []).map((lesson) => ({
      id: lesson.id,
      moduleId: lesson.module_id,
      kind: courseBlockKinds.includes(lesson.content_type as LmsCourseBlockKind)
        ? (lesson.content_type as LmsCourseBlockKind)
        : "text",
      title: lesson.title,
      body: lesson.body || lesson.description || "",
      url: lesson.youtube_url || lesson.resource_url || "",
      position: Number(lesson.position ?? 0),
      config: normalizeBlockConfig((lesson.content_config ?? {}) as Partial<LmsCourseBlockConfig>),
    }));
    const quizBlocks: LmsCourseBlock[] = (quizzes ?? []).map((quiz) => {
      const question = (questionsResult.data ?? []).find((item) => item.quiz_id === quiz.id);
      const options = Array.isArray(question?.options)
        ? question.options.filter((option): option is string => typeof option === "string")
        : [];
      const rawAnswer = question?.correct_answer;
      const correctAnswer = typeof rawAnswer === "string"
        ? rawAnswer
        : Array.isArray(rawAnswer) && typeof rawAnswer[0] === "string"
          ? rawAnswer[0]
          : "";
      return {
        id: quiz.id,
        kind: quiz.assessment_type === "exam" ? "exam" : "quiz",
        title: quiz.title,
        body: quiz.description || "",
        url: "",
        position: Number(quiz.position ?? 0),
        config: normalizeBlockConfig((quiz.content_config ?? {}) as Partial<LmsCourseBlockConfig>),
        question: question?.prompt ?? "",
        options,
        correctAnswer,
        passingScore: Number(quiz.passing_score ?? 80),
        maxAttempts: Number(quiz.max_attempts ?? 3),
      };
    });
    const blocks = [...lessonBlocks, ...quizBlocks].sort((a, b) => a.position - b.position);
    return { ok: true, message: "Content loaded.", data: { blocks, modules: modules ?? [] } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to load the editor." };
  }
}

export async function updateCourseDetailsAction(input: {
  organizationId: string;
  courseId: string;
  title: string;
  level: string;
  description: string;
  color: string;
}): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    if (!validUuid(input.courseId)) throw new Error("Invalid course.");
    const title = input.title.trim().replace(/\s+/g, " ").slice(0, 160);
    const level = input.level.trim().toUpperCase().slice(0, 20);
    if (title.length < 3) throw new Error("Enter a valid course name.");
    if (!/^(A1|A2|B1|B2|C1|C2)$/.test(level)) throw new Error("Select a valid level.");
    if (!validHex(input.color)) throw new Error("Select a valid color.");
    const { error } = await supabase
      .from("courses")
      .update({
        title,
        level,
        description: input.description.trim().slice(0, 2000),
        cover_url: `color:${input.color.toUpperCase()}`,
      })
      .eq("organization_id", input.organizationId)
      .eq("id", input.courseId);
    if (error) throw error;
    await audit(supabase, userId, input.organizationId, "course.updated", "course", input.courseId);
    revalidatePath("/learning/platform");
    return { ok: true, message: "Course settings saved." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to save the course." };
  }
}

export async function saveCourseBlockAction(input: {
  organizationId: string;
  courseId: string;
  block: Omit<LmsCourseBlock, "id"> & { id?: string };
}): Promise<ActionResult<{ block: LmsCourseBlock }>> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    if (!validUuid(input.courseId)) throw new Error("Invalid course.");
    if (!courseBlockKinds.includes(input.block.kind)) throw new Error("Invalid content type.");
    const title = input.block.title.trim().replace(/\s+/g, " ").slice(0, 180);
    if (title.length < 2) throw new Error("Add a block title.");
    const body = input.block.body.trim().slice(0, 12000);
    const url = input.block.url.trim().slice(0, 2000);
    const config = normalizeBlockConfig(input.block.config);
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("id", input.courseId)
      .single();
    if (courseError || !course) throw new Error("Course not found.");

    if (["image", "document", "audio"].includes(input.block.kind) && !/^https:\/\//i.test(url)) {
      throw new Error("Add a valid HTTPS resource link.");
    }
    if (input.block.kind === "youtube" && !videoSource(url)) {
      throw new Error("Add a valid HTTPS YouTube, OneDrive or MP4/WebM link.");
    }

    const isAssessment = input.block.kind === "quiz" || input.block.kind === "exam";
    let blockId = input.block.id ?? "";
    let savedModuleId = isAssessment ? undefined : input.block.moduleId;
    const position = Math.max(1, Math.round(input.block.position || 1));
    if (isAssessment) {
      const options = (input.block.options ?? []).map((option) => option.trim()).filter(Boolean).slice(0, 6);
      const question = (input.block.question ?? "").trim().slice(0, 2000);
      const correctAnswer = (input.block.correctAnswer ?? "").trim();
      if (question.length < 3 || options.length < 2) throw new Error("Complete the question and at least two answers.");
      if (!options.includes(correctAnswer)) throw new Error("Select the correct answer.");
      const assessmentValues = {
        title,
        description: body,
        assessment_type: input.block.kind,
        passing_score: Math.max(0, Math.min(100, Math.round(input.block.passingScore ?? 80))),
        max_attempts: Math.max(1, Math.min(20, Math.round(input.block.maxAttempts ?? 3))),
        position,
        content_config: config,
      };
      if (blockId && validUuid(blockId)) {
        const { error } = await supabase
          .from("quizzes")
          .update(assessmentValues)
          .eq("id", blockId)
          .eq("course_id", input.courseId).select("id").single();
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("quizzes")
          .insert({ course_id: input.courseId, ...assessmentValues })
          .select("id")
          .single();
        if (error || !data) throw error ?? new Error("The assessment could not be created.");
        blockId = data.id;
      }
      const { data: existingQuestion, error: questionLookupError } = await supabase
        .from("quiz_questions")
        .select("id")
        .eq("quiz_id", blockId)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (questionLookupError) throw questionLookupError;
      const questionValues = {
        prompt: question,
        question_type: "single_choice",
        options,
        correct_answer: correctAnswer,
        position: 1,
      };
      const questionResult = existingQuestion
        ? await supabase.from("quiz_questions").update(questionValues).eq("id", existingQuestion.id)
        : await supabase.from("quiz_questions").insert({ quiz_id: blockId, ...questionValues });
      if (questionResult.error) throw questionResult.error;
    } else {
      const moduleLookup = await supabase
        .from("modules")
        .select("id")
        .eq("course_id", input.courseId)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (moduleLookup.error) throw moduleLookup.error;
      let courseModule = moduleLookup.data;
      if (input.block.moduleId) {
        const target = await supabase.from("modules").select("id").eq("id", input.block.moduleId).eq("course_id", input.courseId).single();
        if (target.error || !target.data) throw new Error("Invalid module.");
        courseModule = target.data;
      }
      if (!courseModule) {
        const created = await supabase
          .from("modules")
          .insert({ course_id: input.courseId, title: "Content", position: 1 })
          .select("id")
          .single();
        if (created.error || !created.data) throw created.error ?? new Error("The module could not be created.");
        courseModule = created.data;
      }
      const lessonValues = {
        title,
        description: body.slice(0, 3000),
        content_type: input.block.kind,
        body: input.block.kind === "text" ? body : body || null,
        youtube_url: input.block.kind === "youtube" ? url : null,
        resource_url: ["image", "document", "audio"].includes(input.block.kind) ? url : null,
        position,
        content_config: config,
      };
      savedModuleId = courseModule.id;
      if (blockId && validUuid(blockId)) {
        const { error } = await supabase
          .from("lessons")
          .update(lessonValues)
          .eq("id", blockId)
          .eq("module_id", courseModule.id).select("id").single();
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("lessons")
          .insert({ module_id: courseModule.id, ...lessonValues })
          .select("id")
          .single();
        if (error || !data) throw error ?? new Error("The block could not be created.");
        blockId = data.id;
      }
    }

    const savedBlock: LmsCourseBlock = {
      ...input.block,
      moduleId: savedModuleId,
      id: blockId,
      title,
      body,
      url,
      position,
      config,
    };
    await audit(supabase, userId, input.organizationId, "course.block_saved", isAssessment ? "quiz" : "lesson", blockId);
    revalidatePath("/learning/platform");
    return { ok: true, message: `${input.block.kind === "exam" ? "Exam" : input.block.kind === "quiz" ? "Quiz" : "Content"} saved.`, data: { block: savedBlock } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to save the content." };
  }
}

export async function deleteCourseBlockAction(input: {
  organizationId: string;
  courseId: string;
  blockId: string;
  kind: LmsCourseBlockKind;
}): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    if (!validUuid(input.courseId) || !validUuid(input.blockId)) throw new Error("Invalid content.");
    const isAssessment = input.kind === "quiz" || input.kind === "exam";
    if (isAssessment) {
      const { error } = await supabase.from("quizzes").delete().eq("id", input.blockId).eq("course_id", input.courseId);
      if (error) throw error;
    } else {
      const { data: modules, error: moduleError } = await supabase.from("modules").select("id").eq("course_id", input.courseId);
      if (moduleError) throw moduleError;
      const moduleIds = (modules ?? []).map((module) => module.id);
      if (!moduleIds.length) throw new Error("Content not found.");
      const { error } = await supabase.from("lessons").delete().eq("id", input.blockId).in("module_id", moduleIds);
      if (error) throw error;
    }
    await audit(supabase, userId, input.organizationId, "course.block_deleted", isAssessment ? "quiz" : "lesson", input.blockId);
    revalidatePath("/learning/platform");
    return { ok: true, message: "Block deleted." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to delete the content." };
  }
}

export async function uploadCourseImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const organizationId = String(formData.get("organizationId") ?? "");
    const courseId = String(formData.get("courseId") ?? "");
    await requireStaff(organizationId);
    if (!validUuid(courseId)) throw new Error("Invalid course.");
    const file = formData.get("image");
    if (!(file instanceof File) || !file.size) throw new Error("Select an image.");
    if (file.size > 2 * 1024 * 1024) throw new Error("The image must not exceed 2 MB.");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      throw new Error("Use a PNG, JPG or WEBP image.");
    }
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${organizationId}/courses/${courseId}/${crypto.randomUUID()}.${extension}`;
    const admin = createAdminClient();
    const { error } = await admin.storage.from("organization-assets").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    const { data } = admin.storage.from("organization-assets").getPublicUrl(path);
    return { ok: true, message: "Image uploaded.", data: { url: data.publicUrl } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to upload the image." };
  }
}

export async function saveBrandAction(input: {
  organizationId: string;
  primary: string;
  secondary: string;
  accent: string;
}): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    const colors = [input.primary, input.secondary, input.accent];
    if (colors.some((color) => !/^#[0-9a-f]{6}$/i.test(color))) throw new Error("Invalid color.");
    const { error } = await supabase.from("organization_branding").upsert({
      organization_id: input.organizationId,
      primary_color: input.primary,
      secondary_color: input.secondary,
      accent_color: input.accent,
    });
    if (error) throw error;
    await audit(supabase, userId, input.organizationId, "branding.updated", "organization_branding", input.organizationId);
    revalidatePath("/learning/platform");
    return { ok: true, message: "Branding saved." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to save branding." };
  }
}

export async function uploadBrandLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const organizationId = String(formData.get("organizationId") ?? "");
    await requireStaff(organizationId);
    const file = formData.get("logo");
    if (!(file instanceof File) || !file.size) throw new Error("Select an image.");
    if (file.size > 2 * 1024 * 1024) throw new Error("The logo must not exceed 2 MB.");
    if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
      throw new Error("Unsupported logo format.");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${organizationId}/logo.${extension}`;
    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from("organization-assets")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) throw uploadError;
    const { data } = admin.storage.from("organization-assets").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
    const { error: updateError } = await admin
      .from("organization_branding")
      .update({ logo_url: publicUrl })
      .eq("organization_id", organizationId);
    if (updateError) throw updateError;
    revalidatePath("/learning/platform");
    return { ok: true, message: "Logo updated.", data: { url: publicUrl } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to upload the logo." };
  }
}

export async function updateMonthlyFeeAction(input: {
  organizationId: string;
  monthlyFee: number;
}): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    const monthlyFee = Math.max(0, Math.round(Number(input.monthlyFee) || 0));
    const { error } = await supabase
      .from("organizations")
      .update({ default_monthly_fee: monthlyFee })
      .eq("id", input.organizationId);
    if (error) throw error;
    await audit(supabase, userId, input.organizationId, "billing.fee_updated", "organization", input.organizationId);
    revalidatePath("/learning/platform");
    return { ok: true, message: "Monthly fee updated." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to update the monthly fee." };
  }
}

export async function createTicketAction(input: {
  organizationId: string;
  title: string;
  description: string;
  priority: "Alta" | "Media" | "Baja";
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, userId } = await actor();
    const title = input.title.trim().slice(0, 180);
    const description = input.description.trim().slice(0, 5000);
    if (title.length < 2 || description.length < 5) throw new Error("Describe the issue in more detail.");
    const priority = { Alta: "high", Media: "medium", Baja: "low" }[input.priority];
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        organization_id: input.organizationId,
        created_by: userId,
        title,
        description,
        priority,
      })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("The ticket could not be created.");
    await audit(supabase, userId, input.organizationId, "ticket.created", "support_ticket", data.id);
    revalidatePath("/learning/platform");
    return { ok: true, message: "Report sent to CORVEN.", data: { id: data.id } };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to create the ticket." };
  }
}

export async function replyTicketAction(input: {
  organizationId: string;
  ticketId: string;
  body: string;
  status: "in_progress" | "answered";
}): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireStaff(input.organizationId);
    const body = input.body.trim().slice(0, 5000);
    if (input.status === "answered" && body.length < 2) throw new Error("Enter a reply.");
    if (body) {
      const { error: messageError } = await supabase.from("ticket_messages").insert({
        ticket_id: input.ticketId,
        author_id: userId,
        body,
      });
      if (messageError) throw messageError;
    }
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: input.status })
      .eq("id", input.ticketId)
      .eq("organization_id", input.organizationId);
    if (error) throw error;
    await audit(supabase, userId, input.organizationId, `ticket.${input.status}`, "support_ticket", input.ticketId);
    revalidatePath("/learning/platform");
    return { ok: true, message: input.status === "answered" ? "Reply sent." : "Ticket marked in progress." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Unable to update the ticket." };
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/learning/login");
}

export async function createCourseModuleAction(input: { organizationId: string; courseId: string; title: string }): Promise<ActionResult<{ id: string; title: string; position: number }>> {
  try {
    const { supabase } = await requireStaff(input.organizationId);
    const title = input.title.trim().slice(0, 180);
    if (title.length < 2) throw new Error("Add a module name.");
    const course = await supabase.from("courses").select("id").eq("id", input.courseId).eq("organization_id", input.organizationId).single();
    if (course.error || !course.data) throw new Error("Course unavailable.");
    const last = await supabase.from("modules").select("position").eq("course_id", input.courseId).order("position", { ascending: false }).limit(1).maybeSingle();
    if (last.error) throw last.error;
    const result = await supabase.from("modules").insert({ course_id: input.courseId, title, position: (last.data?.position ?? 0) + 1 }).select("id,title,position").single();
    if (result.error) throw result.error;
    revalidatePath("/learning/platform");
    return { ok: true, message: "Module created.", data: result.data };
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Unable to create the module." }; }
}
