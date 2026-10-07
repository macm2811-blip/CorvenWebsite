import "server-only";

import { createClient } from "@/lib/supabase/server";

import type {
  LmsCourse,
  LmsInitialData,
  LmsRole,
  LmsStudent,
  LmsTicket,
} from "./types";

type LooseRecord = Record<string, unknown>;

function object(value: unknown): LooseRecord {
  return value && typeof value === "object" ? (value as LooseRecord) : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LU";
}

function relativeAccess(value: unknown) {
  if (!value || typeof value !== "string") return "Sin ingreso registrado";
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Costa_Rica",
  }).format(new Date(value));
}

function createdLabel(value: unknown) {
  if (!value || typeof value !== "string") return "Reciente";
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeZone: "America/Costa_Rica",
  }).format(new Date(value));
}

function paymentLabel(value: unknown): LmsStudent["payment"] {
  if (value === "paid" || value === "waived") return "Pagado";
  if (value === "overdue") return "Vencido";
  return "Pendiente";
}

function ticketPriority(value: unknown): LmsTicket["priority"] {
  if (value === "urgent" || value === "high") return "Alta";
  if (value === "low") return "Baja";
  return "Media";
}

function ticketStatus(value: unknown): LmsTicket["status"] {
  if (value === "answered" || value === "closed") return "Respondido";
  if (value === "in_progress") return "En proceso";
  return "Abierto";
}

export async function loadPlatformData(): Promise<LmsInitialData | null> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = text(claimsData?.claims?.sub);
  if (!userId) return null;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, platform_role")
    .eq("id", userId)
    .single();

  if (profileError) throw new Error(profileError.message);
  const profile = object(profileData);
  const platformRole = text(profile.platform_role, "user");
  let role: LmsRole = platformRole === "owner" || platformRole === "support" ? "owner" : "student";

  const { data: membershipData } = await supabase
    .from("memberships")
    .select("organization_id, role, access_status, payment_status, billing_due_date, monthly_fee, level")
    .eq("profile_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const membership = object(membershipData);
  if (membership.access_status === "invited") {
    await supabase.rpc("activate_current_membership");
    membership.access_status = "active";
  }
  if (role !== "owner") {
    const membershipRole = text(membership.role);
    role = membershipRole === "academy_admin" || membershipRole === "instructor" ? "admin" : "student";
  }

  let organizationId = text(membership.organization_id);
  if (!organizationId && role === "owner") {
    const { data } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", "level-up")
      .single();
    organizationId = text(object(data).id);
  }
  if (!organizationId) throw new Error("La cuenta no pertenece a una academia.");

  const accessStatus = text(
    membership.access_status,
    role === "owner" ? "active" : "invited",
  ) as LmsInitialData["accessStatus"];

  if (accessStatus === "suspended" || accessStatus === "archived") {
    return {
      persistent: true,
      role,
      viewerId: userId,
      viewerName: text(profile.full_name, "Usuario"),
      viewerEmail: text(profile.email),
      organizationId,
      organizationName: "Level Up English Academy",
      accessStatus,
      viewerLevel: text(membership.level, "A1"),
      viewerPayment: paymentLabel(membership.payment_status),
      viewerDueDate: text(membership.billing_due_date),
      students: [],
      courses: [],
      tickets: [],
      brand: {
        primary: "#6d28d9",
        secondary: "#111827",
        accent: "#f97316",
      },
      logoUrl: null,
      monthlyFee: number(membership.monthly_fee, 35000),
    };
  }

  const [organizationResult, brandingResult, coursesResult, enrollmentsResult, membersResult, ticketsResult] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, default_monthly_fee, currency")
      .eq("id", organizationId)
      .single(),
    supabase
      .from("organization_branding")
      .select("logo_url, primary_color, secondary_color, accent_color")
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("courses")
      .select("id, title, description, level, cover_url, status")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("enrollments")
      .select("id, course_id, student_id, progress, status")
      .eq("organization_id", organizationId),
    role === "student"
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("memberships")
          .select("profile_id, access_status, payment_status, billing_due_date, monthly_fee, level, last_access_at, profiles(full_name, email)")
          .eq("organization_id", organizationId)
          .eq("role", "student")
          .order("created_at", { ascending: true }),
    supabase
      .from("support_tickets")
      .select("id, created_by, title, description, priority, status, created_at, profiles!support_tickets_created_by_fkey(full_name)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const firstError = [organizationResult, brandingResult, coursesResult, enrollmentsResult, membersResult, ticketsResult]
    .map((result) => result.error)
    .find(Boolean);
  if (firstError) throw new Error(firstError.message);

  const organization = object(organizationResult.data);
  const branding = object(brandingResult.data);
  const enrollments = (enrollmentsResult.data ?? []).map(object);

  const courseIds = (coursesResult.data ?? []).map((course) => text(object(course).id));
  const moduleResult = courseIds.length
    ? await supabase
        .from("modules")
        .select("id, course_id")
        .in("course_id", courseIds)
    : { data: [], error: null };
  if (moduleResult.error) throw new Error(moduleResult.error.message);
  const modules = (moduleResult.data ?? []).map(object);

  const lessonResult = modules.length
    ? await supabase
        .from("lessons")
        .select("id, module_id, duration_minutes, youtube_url")
        .in("module_id", modules.map((module) => text(module.id)))
    : { data: [], error: null };
  if (lessonResult.error) throw new Error(lessonResult.error.message);
  const lessons = (lessonResult.data ?? []).map(object);

  const courses: LmsCourse[] = (coursesResult.data ?? []).map((rawCourse, index) => {
    const course = object(rawCourse);
    const courseId = text(course.id);
    const courseModules = modules.filter((module) => text(module.course_id) === courseId);
    const moduleIds = new Set(courseModules.map((module) => text(module.id)));
    const courseLessons = lessons.filter((lesson) => moduleIds.has(text(lesson.module_id)));
    const courseEnrollments = enrollments.filter((enrollment) => text(enrollment.course_id) === courseId);
    const ownEnrollment = courseEnrollments.find((enrollment) => text(enrollment.student_id) === userId);
    const minutes = courseLessons.reduce((total, lesson) => total + number(lesson.duration_minutes), 0);

    return {
      id: courseId,
      title: text(course.title, "Curso sin título"),
      level: `${text(course.level, "General")} · ${course.status === "published" ? "Publicado" : "Borrador"}`,
      description: text(course.description, "Curso de Level Up."),
      progress: number(ownEnrollment?.progress),
      lessons: courseLessons.length,
      duration: minutes ? `${Math.max(1, Math.round(minutes / 60))} h` : "Por definir",
      students: courseEnrollments.length,
      youtubeUrl: text(courseLessons.find((lesson) => text(lesson.youtube_url))?.youtube_url),
      color: ["#6d28d9", "#ea580c", "#0891b2"][index % 3],
      published: course.status === "published",
    };
  });

  const students: LmsStudent[] = (membersResult.data ?? []).map((rawMember) => {
    const member = object(rawMember);
    const memberProfile = object(Array.isArray(member.profiles) ? member.profiles[0] : member.profiles);
    const studentId = text(member.profile_id);
    const studentEnrollments = enrollments.filter((enrollment) => text(enrollment.student_id) === studentId);
    const averageProgress = studentEnrollments.length
      ? Math.round(studentEnrollments.reduce((total, item) => total + number(item.progress), 0) / studentEnrollments.length)
      : 0;
    const name = text(memberProfile.full_name, "Estudiante");

    return {
      id: studentId,
      name,
      email: text(memberProfile.email),
      initials: initials(name),
      level: text(member.level, "A1"),
      progress: averageProgress,
      active: member.access_status === "active",
      payment: paymentLabel(member.payment_status),
      dueDate: text(member.billing_due_date),
      lastAccess: relativeAccess(member.last_access_at),
    };
  });

  const tickets: LmsTicket[] = (ticketsResult.data ?? []).map((rawTicket) => {
    const ticket = object(rawTicket);
    const author = object(Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles);
    return {
      id: text(ticket.id),
      source: text(ticket.created_by) === userId && role === "student" ? "Estudiante" : "Level Up",
      person: text(author.full_name, "Usuario de Level Up"),
      title: text(ticket.title, "Solicitud de soporte"),
      detail: text(ticket.description),
      priority: ticketPriority(ticket.priority),
      status: ticketStatus(ticket.status),
      created: createdLabel(ticket.created_at),
    };
  });

  return {
    persistent: true,
    role,
    viewerId: userId,
    viewerName: text(profile.full_name, "Usuario"),
    viewerEmail: text(profile.email),
    organizationId,
    organizationName: text(organization.name, "Level Up English Academy"),
    accessStatus,
    viewerLevel: text(membership.level, "A1"),
    viewerPayment: paymentLabel(membership.payment_status),
    viewerDueDate: text(membership.billing_due_date),
    students,
    courses,
    tickets,
    brand: {
      primary: text(branding.primary_color, "#6d28d9"),
      secondary: text(branding.secondary_color, "#111827"),
      accent: text(branding.accent_color, "#f97316"),
    },
    logoUrl: text(branding.logo_url) || null,
    monthlyFee: number(organization.default_monthly_fee, number(membership.monthly_fee, 35000)),
  };
}
