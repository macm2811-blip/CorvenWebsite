"use client";
import { displayLabel } from "@/lib/lms/display-label";

import Image from "next/image";
import { StudentPlanSelect, StudentPlanEditor } from "@/components/student-plan-select";
import { FormEvent, useState } from "react";

import type {
  LmsAcademy,
  LmsAcademyAdmin,
  LmsActivityEvent,
  LmsBrand,
  LmsCourse,
  LmsInitialData,
  LmsRole,
  LmsStudent,
  LmsTicket,
} from "@/lib/lms/types";
import {
  addLessonAction,
  createAcademyAction,
  createCourseAction,
  createTicketAction,
  inviteAcademyAdminAction,
  inviteStudentAction,
  replyTicketAction,
  saveBrandAction,
  sendPasswordResetAction,
  setCoursePublishedAction,
  signOutAction,
  updateMonthlyFeeAction,
  updateAcademyStatusAction,
  updateStudentAction,
  uploadBrandLogoAction,
} from "@/app/(es)/learning/platform/actions";
import { CourseStudioWorkspace } from "@/app/(es)/learning/platform/course-studio";
import { AcademyWorkspace, EnrollmentForm, AcademySupport } from "@/app/(es)/learning/platform/academy-workspace";
import { AdminStudentPreview } from "@/app/(es)/learning/platform/admin-student-preview";
import { StudentWorkspace } from "@/app/(es)/learning/platform/student-workspace";

import styles from "./level-up-lms.module.css";

type Role = LmsRole;
type StudentView = "home" | "courses" | "sessions" | "billing" | "help" | "paths";
type AdminView = "sessions" | "overview" | "students" | "courses" | "income" | "brand" | "support";
type OwnerView = "platform" | "academies" | "tickets" | "activity";
type View = StudentView | AdminView | OwnerView;

type Student = LmsStudent;
type Course = LmsCourse;
type Ticket = LmsTicket;
type Academy = LmsAcademy;
type AcademyAdmin = LmsAcademyAdmin;
type ActivityEvent = LmsActivityEvent;

const initialStudents: Student[] = [
  { id: 1, name: "Sofía Rojas", email: "sofia@demo.levelup.cr", initials: "SR", level: "A1", progress: 68, active: true, payment: "Pagado", dueDate: "2026-10-15", lastAccess: "Hoy, 8:42 a. m." },
  { id: 2, name: "Daniel Vargas", email: "daniel@demo.levelup.cr", initials: "DV", level: "A1", progress: 42, active: true, payment: "Pagado", dueDate: "2026-10-15", lastAccess: "Ayer, 7:18 p. m." },
  { id: 3, name: "María Fernández", email: "maria@demo.levelup.cr", initials: "MF", level: "A2", progress: 81, active: true, payment: "Pendiente", dueDate: "2026-10-10", lastAccess: "Hoy, 6:11 a. m." },
  { id: 4, name: "José Salas", email: "jose@demo.levelup.cr", initials: "JS", level: "A1", progress: 20, active: false, payment: "Vencido", dueDate: "2026-10-05", lastAccess: "Hace 5 días" },
  { id: 5, name: "Laura Jiménez", email: "laura@demo.levelup.cr", initials: "LJ", level: "A2", progress: 74, active: true, payment: "Pagado", dueDate: "2026-10-18", lastAccess: "Hoy, 9:03 a. m." },
  { id: 6, name: "Andrés Mora", email: "andres@demo.levelup.cr", initials: "AM", level: "B1", progress: 55, active: true, payment: "Pagado", dueDate: "2026-10-20", lastAccess: "Ayer, 9:40 p. m." },
  { id: 7, name: "Valeria Castro", email: "valeria@demo.levelup.cr", initials: "VC", level: "A2", progress: 36, active: true, payment: "Pendiente", dueDate: "2026-10-12", lastAccess: "Hace 2 días" },
  { id: 8, name: "Gabriel Hernández", email: "gabriel@demo.levelup.cr", initials: "GH", level: "B1", progress: 92, active: true, payment: "Pagado", dueDate: "2026-10-22", lastAccess: "Hoy, 7:29 a. m." },
  { id: 9, name: "Camila Araya", email: "camila@demo.levelup.cr", initials: "CA", level: "A1", progress: 12, active: true, payment: "Pagado", dueDate: "2026-10-25", lastAccess: "Ayer, 4:14 p. m." },
  { id: 10, name: "Mateo Sánchez", email: "mateo@demo.levelup.cr", initials: "MS", level: "A2", progress: 61, active: true, payment: "Pagado", dueDate: "2026-10-28", lastAccess: "Hoy, 8:07 a. m." },
];

const initialCourses: Course[] = [
  { id: 1, title: "English Foundations A1", level: "Beginner · A1", description: "Construye una base práctica para presentarte, conversar y desenvolverte en situaciones cotidianas.", progress: 68, lessons: 18, duration: "6 h 20 min", students: 4, youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U", color: "#2C55A2", published: true },
  { id: 2, title: "Everyday English A2", level: "Elementary · A2", description: "Vocabulario, listening y conversación para resolver situaciones comunes con mayor confianza.", progress: 44, lessons: 22, duration: "8 h 10 min", students: 4, youtubeUrl: "", color: "#E97704", published: true },
  { id: 3, title: "Confident Conversations B1", level: "Intermediate · B1", description: "Práctica guiada para expresar ideas, explicar experiencias y participar en conversaciones más fluidas.", progress: 26, lessons: 16, duration: "7 h 40 min", students: 2, youtubeUrl: "", color: "#0DBAC3", published: false },
];

const initialTickets: Ticket[] = [
  { id: "SUP-1042", source: "Level Up", person: "Andrea · Administradora", title: "No carga el enlace de una clase", detail: "El video de la lección 4 muestra un mensaje de enlace no disponible.", priority: "Alta", status: "Abierto", created: "Hoy · 8:35 a. m." },
  { id: "SUP-1038", source: "Student", person: "María Fernández", title: "No encuentro mi certificado", detail: "Completé el curso A1 y necesito descargar el certificado.", priority: "Media", status: "En proceso", created: "Ayer · 5:12 p. m." },
];

const initialAcademies: Academy[] = [{
  id: "demo-level-up",
  name: "Level Up English Academy",
  slug: "level-up",
  status: "active",
  learningModel: "hybrid",
  studentCount: 10,
  courseCount: 3,
  adminCount: 1,
  monthlyRevenue: 280000,
  defaultMonthlyFee: 35000,
  currency: "CRC",
  createdAt: "7 oct. 2026",
  admins: [{ id: "demo-admin", name: "Andrea López", email: "andrea@demo.levelup.cr", role: "academy_admin", accessStatus: "active" }],
  students: initialStudents,
  courses: initialCourses,
}];

const navItems: Record<Role, { id: View; label: string; icon: string; count?: number }[]> = {
  student: [
    { id: "home", label: "Home", icon: "home" },
    { id: "courses", label: "My courses", icon: "book" },
    {id:"paths",label:"My learning path",icon:"award"},
    { id: "sessions", label: "Live classes", icon: "calendar", count: 2 },
    { id: "billing", label: "Payments", icon: "card", count: 1 },
    { id: "help", label: "Help", icon: "help" },
  ],
  admin: [
    { id: "overview", label: "Overview", icon: "home" },
    { id: "students", label: "Students", icon: "users", count: 1 },
    { id: "courses", label: "Courses", icon: "book" },
    { id: "sessions", label: "Live classes", icon: "calendar" },
    { id: "income", label: "Income", icon: "money", count: 3 },
    { id: "brand", label: "Branding", icon: "palette" },
    { id: "support", label: "CORVEN support", icon: "support", count: 1 },
  ],
  owner: [
    { id: "platform", label: "CORVEN dashboard", icon: "chart" },
    { id: "academies", label: "Academies", icon: "school" },
    { id: "tickets", label: "Tickets", icon: "support", count: 2 },
    { id: "activity", label: "Activity", icon: "clock" },
  ],
};

const roleDefaultView: Record<Role, View> = { student: "home", admin: "overview", owner: "platform" };

export function LevelUpLms({ initialData }: { initialData?: LmsInitialData }) {
  const persistent = Boolean(initialData?.persistent);
  const [role, setRole] = useState<Role>(initialData?.role ?? "student");
  const [accountOpen, setAccountOpen] = useState(false);
  const [view, setView] = useState<View>(roleDefaultView[initialData?.role ?? "student"]);
  const [students, setStudents] = useState<Student[]>(initialData?.students ?? initialStudents);
  const [courses, setCourses] = useState<Course[]>(initialData?.courses ?? initialCourses);
  const [tickets, setTickets] = useState<Ticket[]>(initialData?.tickets ?? initialTickets);
  const [academies, setAcademies] = useState<Academy[]>(initialData?.academies ?? initialAcademies);
  const [activity, setActivity] = useState<ActivityEvent[]>(initialData?.activity ?? []);
  const [toast, setToast] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData?.logoUrl ?? null);
  const [brand, setBrand] = useState<LmsBrand>(initialData?.brand ?? { primary: "#2C55A2", secondary: "#000000", accent: "#E97704" });
  const [monthlyFee, setMonthlyFee] = useState(initialData?.monthlyFee ?? 35000);

  const activeCount = students.filter((student) => student.active).length;
  const paidCount = students.filter((student) => !student.isSample && student.payment === "Pagado").length;
  const collectedRevenue = paidCount * monthlyFee;
  const projectedRevenue = students.filter(s=>!s.isSample).length * monthlyFee;
  const themeVariables = { "--brand-primary": brand.primary, "--brand-secondary": brand.secondary, "--brand-accent": brand.accent } as React.CSSProperties;

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setView(roleDefaultView[nextRole]);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2700);
  }

  async function updateStudent(id: Student["id"], changes: Partial<Student>) {
    const previous=students.find(s=>s.id===id);
    setStudents(current=>current.map(s=>s.id===id?{...s,...changes}:s));
    if(!persistent||!initialData||typeof id!=="string")return true;
    try {
      const result=await updateStudentAction({organizationId:initialData.organizationId,studentId:id,changes:{active:changes.active,payment:changes.payment,dueDate:changes.dueDate,groupName:changes.groupName,planName:changes.planName}});
      if(!result.ok)throw new Error(result.message);
      return true;
    }catch(error){if(previous)setStudents(current=>current.map(s=>s.id===id?previous:s));showToast(error instanceof Error?error.message:"Unable to update student.");return false;}
  }

  async function addTicket(ticket: Omit<Ticket, "id" | "status" | "created">) {
    if (persistent && initialData) {
      const result = await createTicketAction({
        organizationId: initialData.organizationId,
        title: ticket.title,
        description: ticket.detail,
        priority: ticket.priority,
      });
      if (!result.ok || !result.data) return showToast(result.message);
      setTickets((current) => [{ ...ticket, id: result.data!.id, status: "Abierto", created: "Ahora" }, ...current]);
      return showToast(result.message);
    }
    setTickets((current) => [{ ...ticket, id: "SUP-" + String(1043 + current.length), status: "Abierto", created: "Ahora" }, ...current]);
    showToast("Report sent to CORVEN. Te notificaremos la respuesta.");
  }

  async function handleLogo(file?: File) {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setLogoUrl(preview);
    if (!persistent || !initialData) return showToast("Logo actualizado en la vista previa");
    const formData = new FormData();
    formData.set("organizationId", initialData.organizationId);
    formData.set("logo", file);
    const result = await uploadBrandLogoAction(formData);
    if (result.ok && result.data) setLogoUrl(result.data.url);
    showToast(result.message);
  }

  async function saveBrand() {
    if (!persistent || !initialData) return showToast("Branding guardada");
    const result = await saveBrandAction({ organizationId: initialData.organizationId, ...brand });
    showToast(result.message);
  }

  async function saveMonthlyFee(value: number) {
    setMonthlyFee(value);
    if (!persistent || !initialData) return;
    const result = await updateMonthlyFeeAction({ organizationId: initialData.organizationId, monthlyFee: value });
    showToast(result.message);
  }

  async function inviteStudent(input: {fullName:string;email:string;level:string;dueDate:string;courseId?:string;planName?:string;groupName?:string}) {
    if(!persistent||!initialData){showToast("Invitations are available in the academy portal.");return false;}
    try {
      const result=await inviteStudentAction({organizationId:initialData.organizationId,...input,monthlyFee});
      showToast(result.message);
      if(!result.ok||!result.data)return false;
      const id=result.data.id;
      setStudents(current=>{const old=current.find(s=>s.id===id);const student:Student={id,name:input.fullName,email:input.email,initials:initialsFor(input.fullName),level:input.level,progress:old?.progress??0,active:old?.active??result.data!.accessStatus==="active",payment:old?.payment??"Pendiente",dueDate:old?.dueDate??input.dueDate,lastAccess:old?.lastAccess??"Invitation pending",studentCode:result.data!.studentCode,planName:input.planName??"1 class / week",groupName:input.groupName??""};return old?current.map(s=>s.id===id?student:s):[...current,student];});
      return true;
    }catch(error){showToast(error instanceof Error?error.message:"Unable to invite student.");return false;}
  }

  async function createAcademy(input: { name: string; learningModel: Academy["learningModel"]; monthlyFee: number; primaryColor: string }) {
    if (!persistent) {
      const academy: Academy = {
        id: `demo-${Date.now()}`,
        name: input.name,
        slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        status: "active",
        learningModel: input.learningModel,
        studentCount: 0,
        courseCount: 0,
        adminCount: 0,
        monthlyRevenue: 0,
        defaultMonthlyFee: input.monthlyFee,
        currency: "CRC",
        createdAt: "Ahora",
        admins: [],
        students: [],
        courses: [],
      };
      setAcademies((current) => [...current, academy]);
      showToast(`${input.name} fue creada en el demo.`);
      return true;
    }
    const result = await createAcademyAction(input);
    if (result.ok && result.data) {
      setAcademies((current) => [...current, result.data!]);
      setActivity((current) => [{ id: `local-${Date.now()}`, action: "Creó una academia", actor: initialData?.viewerName ?? "CORVEN", academy: result.data!.name, created: "Ahora" }, ...current]);
    }
    showToast(result.message);
    return result.ok;
  }

  async function inviteAcademyAdmin(organizationId: string, input: { fullName: string; email: string }) {
    if (!persistent) {
      const admin: AcademyAdmin = { id: `demo-admin-${Date.now()}`, name: input.fullName, email: input.email, role: "academy_admin", accessStatus: "invited" };
      setAcademies((current) => current.map((academy) => academy.id === organizationId ? { ...academy, admins: [...academy.admins, admin], adminCount: academy.adminCount + 1 } : academy));
      showToast(`Invitation prepared for ${input.email}.`);
      return true;
    }
    const result = await inviteAcademyAdminAction({ organizationId, ...input });
    if (result.ok && result.data) {
      setAcademies((current) => current.map((academy) => {
        if (academy.id !== organizationId) return academy;
        const withoutExisting = academy.admins.filter((admin) => admin.id !== result.data!.id);
        return { ...academy, admins: [...withoutExisting, result.data!], adminCount: withoutExisting.length + 1 };
      }));
    }
    showToast(result.message);
    return result.ok;
  }

  async function updateAcademyStatus(organizationId: string, status: "active" | "suspended") {
    if (persistent) {
      const result = await updateAcademyStatusAction({ organizationId, status });
      if (!result.ok) {
        showToast(result.message);
        return false;
      }
      showToast(result.message);
    } else {
      showToast(status === "active" ? "Academia reactivada en el demo." : "Academia suspendida en el demo.");
    }
    setAcademies((current) => current.map((academy) => academy.id === organizationId ? { ...academy, status } : academy));
    return true;
  }

  async function inviteAcademyStudent(organizationId: string, input: { fullName: string; email: string; level: string; dueDate: string; courseId?: string; planName?: string; groupName?: string }) {
    const academy = academies.find((item) => item.id === organizationId);
    if (!academy) return false;
    let studentId: string | number = `demo-student-${Date.now()}`;
    let active = false;
    if (persistent) {
      const result = await inviteStudentAction({
        organizationId,
        ...input,
        monthlyFee: academy.defaultMonthlyFee,
      });
      showToast(result.message);
      if (!result.ok || !result.data) return false;
      studentId = result.data.id;
      active = result.data.accessStatus === "active";
    } else {
      showToast(`Acceso preparado para ${input.email}.`);
    }
    const student: Student = {
      id: studentId,
      name: input.fullName,
      email: input.email,
      initials: initialsFor(input.fullName),
      level: input.level,
      progress: 0,
      active,
      payment: "Pendiente",
      dueDate: input.dueDate,
      lastAccess: active ? "Existing account" : "Invitation pending",
    };
    setAcademies((current) => current.map((item) => {
      if (item.id !== organizationId) return item;
      const withoutExisting = item.students.filter((existing) => existing.id !== student.id);
      return { ...item, students: [...withoutExisting, student], studentCount: withoutExisting.length + 1 };
    }));
    return true;
  }

  async function updateAcademyStudent(organizationId: string, studentId: Student["id"], changes: Partial<Student>) {
    const previous = academies;
    setAcademies((current) => current.map((academy) => academy.id === organizationId ? {
      ...academy,
      students: academy.students.map((student) => student.id === studentId ? { ...student, ...changes } : student),
    } : academy));
    if (!persistent || typeof studentId !== "string") {
      showToast("Estudiante actualizado en el demo.");
      return true;
    }
    const result = await updateStudentAction({
      organizationId,
      studentId,
      changes: { active: changes.active, payment: changes.payment, dueDate: changes.dueDate, groupName:changes.groupName,planName:changes.planName },
    });
    showToast(result.message);
    if (!result.ok) setAcademies(previous);
    return result.ok;
  }

  async function createAcademyCourse(organizationId: string, input: { title: string; level: string; description: string; youtubeUrl: string }) {
    let courseId: string | number = `demo-course-${Date.now()}`;
    if (persistent) {
      const result = await createCourseAction({ organizationId, ...input });
      showToast(result.message);
      if (!result.ok || !result.data) return false;
      courseId = result.data.id;
    } else {
      showToast("Course created as a draft en el demo.");
    }
    const course: Course = {
      id: courseId,
      title: input.title,
      level: `${input.level} · Borrador`,
      description: input.description || "Curso creado por CORVEN.",
      progress: 0,
      lessons: 1,
      duration: "Por definir",
      students: 0,
      youtubeUrl: input.youtubeUrl,
      color: "#2C55A2",
      published: false,
    };
    setAcademies((current) => current.map((academy) => academy.id === organizationId ? {
      ...academy,
      courses: [...academy.courses, course],
      courseCount: academy.courses.length + 1,
    } : academy));
    return true;
  }

  async function publishAcademyCourse(organizationId: string, courseId: Course["id"], published: boolean) {
    if (persistent && typeof courseId === "string") {
      const result = await setCoursePublishedAction({ organizationId, courseId, published });
      showToast(result.message);
      if (!result.ok) return false;
    } else {
      showToast(published ? "Course published en el demo." : "Course moved to draft en el demo.");
    }
    setAcademies((current) => current.map((academy) => academy.id === organizationId ? {
      ...academy,
      courses: academy.courses.map((course) => course.id === courseId ? { ...course, published, level: course.level.replace(/ · (Publicado|Borrador)$/, ` · ${published ? "Publicado" : "Borrador"}`) } : course),
    } : academy));
    return true;
  }

  async function addAcademyLesson(organizationId: string, courseId: Course["id"], input: { title: string; description: string; contentType: "text" | "youtube" | "document" | "audio"; contentUrl: string }) {
    if (persistent && typeof courseId === "string") {
      const result = await addLessonAction({ organizationId, courseId, ...input });
      showToast(result.message);
      if (!result.ok) return false;
    } else {
      showToast("Lección agregada en el demo.");
    }
    setAcademies((current) => current.map((academy) => academy.id === organizationId ? {
      ...academy,
      courses: academy.courses.map((course) => course.id === courseId ? { ...course, lessons: course.lessons + 1, youtubeUrl: input.contentType === "youtube" ? input.contentUrl : course.youtubeUrl } : course),
    } : academy));
    return true;
  }

  return (
    <div lang="en" className={styles.appShell} style={themeVariables}>
      <header className={styles.topbar}>
        <div className={styles.mobileBrand}>{role === "owner" ? <AcademyMark name="CORVEN" /> : <TenantMark logoUrl={logoUrl} />}<strong>{role === "owner" ? "CORVEN Learning" : initialData?.organizationName ?? "Level Up"}</strong></div>
        {!persistent && <label className={styles.globalSearch}><Icon name="search" /><input aria-label="Search the academy" placeholder="Search courses, lessons or students" /><kbd>⌘ K</kbd></label>}
        <div className={styles.topbarTools}>
          <span className={styles.demoBadge}>{persistent&&role==="student"?(initialData?.students.find(s=>s.id===initialData.viewerId)?.planName||initialData?.viewerPlanName||"English learning plan"):persistent?"Secure portal":"Level Up demo"}</span>
          {!persistent && <button className={styles.notificationButton} onClick={() => showToast(role === "owner" ? "2 tickets requieren atención" : "Tienes notificaciones nuevas")} aria-label="Notifications"><Icon name="bell" /><span>{role === "student" ? 3 : role === "admin" ? 6 : 2}</span></button>}
          {!persistent && <div className={styles.roleSwitch} aria-label="Change demo role">
            <button className={role === "student" ? styles.roleActive : ""} onClick={() => changeRole("student")}>Student</button>
            <button className={role === "admin" ? styles.roleActive : ""} onClick={() => changeRole("admin")}>Level Up</button>
            <button className={role === "owner" ? styles.roleActive : ""} onClick={() => changeRole("owner")}>CORVEN</button>
          </div>}
          {persistent ? <div className={styles.accountMenu} onKeyDown={(event) => { if (event.key === "Escape") setAccountOpen(false); }}><button className={`${styles.avatarButton} ${role !== "owner" ? styles.levelUpAvatar : ""}`} type="button" aria-label="Open profile menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((current) => !current)}>{role === "owner" ? initialsFor(initialData?.viewerName ?? "User") : <Image src="/brand/level-up/mark-transparent.png" alt="Level Up" width={1451} height={1084} sizes="40px" />}</button>{accountOpen && <div className={styles.accountDropdown}><strong>{initialData?.viewerName ?? "My account"}</strong><span>{role === "student" ? "Student" : role === "admin" ? "Academy administration" : "CORVEN Learning"}</span><form action={signOutAction}><button type="submit">Sign out ↗</button></form></div>}</div> : <button className={styles.avatarButton} onClick={() => showToast("Menú de cuenta")}>{role === "student" ? "SR" : role === "admin" ? "AL" : "MC"}</button>}
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.tenantBrand}>{role === "owner" ? <AcademyMark name="CORVEN" /> : <TenantMark logoUrl={logoUrl} />}<div><strong>{role === "owner" ? "CORVEN" : initialData?.organizationName ?? "Level Up"}</strong><span>{role === "owner" ? "Learning Platform" : "English Academy"}</span></div></div>
          <nav className={styles.sideNav} aria-label="Main navigation">
            {navItems[role].map((item) => <button key={item.id} className={view === item.id ? styles.navActive : ""} onClick={() => setView(item.id)}><Icon name={item.icon} /><span>{item.label}</span>{!persistent && item.count ? <small>{item.count}</small> : null}</button>)}
          </nav>
          {(!persistent || role === "student") && <div className={styles.hybridNote}><span className={styles.liveDot}></span><div><strong>Hybrid learning</strong><small>Live classes + self-paced learning</small></div></div>}
          <PoweredBy />
        </aside>

        <main className={styles.mainArea}>
          {role === "student" && (persistent && initialData ? <StudentWorkspace key={view} initialData={initialData} view={view as StudentView} setView={setView} /> : <StudentExperience view={view as StudentView} setView={setView} courses={courses} onNotify={showToast} addTicket={addTicket} monthlyFee={monthlyFee} viewerName="Sofía Rojas" dueDate="2026-10-15" payment="Pagado" level="A1" />)}
          {role === "admin" && <AdminExperience view={view as AdminView} setView={setView} students={students} courses={courses} tickets={tickets} activeCount={activeCount} paidCount={paidCount} collectedRevenue={collectedRevenue} projectedRevenue={projectedRevenue} monthlyFee={monthlyFee} setMonthlyFee={saveMonthlyFee} updateStudent={updateStudent} setCourses={setCourses} inviteStudent={inviteStudent} brand={brand} setBrand={setBrand} saveBrand={saveBrand} logoUrl={logoUrl} handleLogo={handleLogo} addTicket={addTicket} onNotify={showToast} persistent={persistent} organizationId={initialData?.organizationId} viewerName={initialData?.viewerName ?? "Andrea"} />}
          {role === "owner" && <OwnerExperience view={view as OwnerView} setView={setView} academies={academies} activity={activity} tickets={tickets} setTickets={setTickets} onCreateAcademy={createAcademy} onInviteAdmin={inviteAcademyAdmin} onInviteStudent={inviteAcademyStudent} onUpdateStudent={updateAcademyStudent} onCreateCourse={createAcademyCourse} onPublishCourse={publishAcademyCourse} onAddLesson={addAcademyLesson} onUpdateAcademyStatus={updateAcademyStatus} onNotify={showToast} persistent={persistent} organizationId={initialData?.organizationId} />}
          <footer className={styles.mobileFooter}><PoweredBy /></footer>
        </main>
      </div>
      {toast && <div className={styles.toast} role="status"><Icon name="check" />{toast}</div>}
    </div>
  );
}

function StudentExperience({ view, setView, courses, onNotify, addTicket, monthlyFee, viewerName, dueDate, payment, level }: { view: StudentView; setView: (view: View) => void; courses: Course[]; onNotify: (message: string) => void; addTicket: (ticket: Omit<Ticket, "id" | "status" | "created">) => void; monthlyFee: number; viewerName: string; dueDate: string; payment: Student["payment"]; level: string }) {
  if (view === "courses") return <StudentCourses courses={courses} onNotify={onNotify} />;
  if (view === "sessions") return <LiveSessions onNotify={onNotify} />;
  if (view === "billing") return <StudentBilling monthlyFee={monthlyFee} dueDate={dueDate} payment={payment} level={level} onNotify={onNotify} />;
  if (view === "help") return <HelpCenter addTicket={addTicket} onNotify={onNotify} />;
  return <Page>
    <PageHeader eyebrow="Your learning space" title={`Hello, ${viewerName.split(" ")[0]}.`} text="Continue your course, check your next class and keep learning." action={<Image className={styles.welcomeMascot} src="/brand/level-up/mascot-relaxed.jpg" alt="" width={1536} height={1024} sizes="(max-width: 760px) 120px, 180px" />} />
    <div className={styles.paymentReminder}><span className={styles.reminderIcon}><Icon name="card" /></span><div><strong>{payment === "Pagado" ? `Tu próximo pago es el ${formatDate(dueDate)}` : `Tu pago está ${payment.toLowerCase()}`}</strong><p>Keep your payments up to date to maintain course access.</p></div><button onClick={() => setView("billing")}>View details</button></div>
    <section className={styles.studentHero}><div><span className={styles.eyebrowLight}>Continue where you left off</span><h2>English Foundations A1</h2><p>Unit 4 · Daily routines and time expressions</p><div className={styles.heroProgress}><span style={{ width: "68%" }}></span></div><small>68% complete · 7 lessons remaining</small><button onClick={() => onNotify("Abriendo la siguiente lección")}>Continue course <Icon name="play" /></button></div><div className={styles.heroWord}><span>Today&apos;s word</span><strong>progress</strong><p>/ˈprɑː.ɡres/</p><small>movement toward a better or more complete state</small></div></section>
    <section className={styles.sectionBlock}><SectionHeading title="My courses" text="Learn at your own pace between live classes." action="View all" onAction={() => setView("courses")} /><div className={styles.courseGrid}>{courses.filter((course) => course.published).slice(0, 3).map((course) => <CourseCard key={course.id} course={course} student onOpen={() => onNotify("Abriendo " + course.title)} />)}</div></section>
    <section className={styles.homeColumns}><div className={styles.panel}><SectionHeading title="Next live class" text="A guided session with your instructor." /><div className={styles.nextSession}><div className={styles.dateCard}><strong>09</strong><span>OCT</span></div><div><span className={styles.liveLabel}>LIVE</span><h3>Conversation Lab: Daily routines</h3><p>Jueves · 6:30 p. m. · 60 minutes</p><small>Instructor: Andrea López</small></div><button onClick={() => onNotify("El enlace se habilitará 10 minutes antes")}>View class</button></div></div><div className={styles.panel}><SectionHeading title="Your week" text="Activity recorded on the platform." /><div className={styles.weekStats}><div><strong>3</strong><span>Lessons</span></div><div><strong>84%</strong><span>Quiz</span></div><div><strong>2h</strong><span>Study</span></div></div></div></section>
  </Page>;
}

function StudentCourses({ courses, onNotify }: { courses: Course[]; onNotify: (message: string) => void }) {
  return <Page><PageHeader eyebrow="Personal library" title="My courses" text="All your content, progress and upcoming activities in one place." /><div className={styles.filterRow}><button className={styles.filterActive}>All</button><button>In progress</button><button>Completed</button><button>Saved</button></div><div className={styles.courseGridLarge}>{courses.filter((course) => course.published).map((course) => <CourseCard key={course.id} course={course} student onOpen={() => onNotify("Abriendo " + course.title)} />)}</div><div className={styles.panel + " " + styles.certificatePanel}><div><span className={styles.iconTile}><Icon name="award" /></span><strong>Your next certificate is close</strong><p>Complete English Foundations A1 to earn your Level Up digital certificate.</p></div><button className={styles.secondaryButton} onClick={() => onNotify("Debes completar todas las lessons y la evaluación final")}>View requirements</button></div></Page>;
}

function LiveSessions({ onNotify }: { onNotify: (message: string) => void }) {
  const sessions = [
    { day: "09", month: "OCT", title: "Conversation Lab: Daily routines", time: "6:30 p. m.", course: "English Foundations A1", status: "Próxima" },
    { day: "13", month: "OCT", title: "Grammar Clinic: Present simple", time: "6:30 p. m.", course: "English Foundations A1", status: "Programada" },
    { day: "16", month: "OCT", title: "Listening Practice: At the café", time: "6:30 p. m.", course: "English Foundations A1", status: "Programada" },
  ];
  return <Page><PageHeader eyebrow="Hybrid model" title="Live classes" text="Practice with your instructor and use the portal content to prepare and review." /><div className={styles.sessionList}>{sessions.map((session) => <article key={session.title} className={styles.sessionCard}><div className={styles.dateCard}><strong>{session.day}</strong><span>{session.month}</span></div><div><span className={styles.statusTag}>{session.status}</span><h3>{session.title}</h3><p>{session.course} · {session.time} · 60 minutes</p></div><div className={styles.sessionActions}><button onClick={() => onNotify("Clase agregada a tu calendario")}>Add to calendar</button><button className={styles.primaryButton} onClick={() => onNotify("El enlace se habilitará antes de la clase")}>Join</button></div></article>)}</div><div className={styles.infoBanner}><Icon name="video" /><div><strong>How do hybrid classes work?</strong><p>Complete the preparation before class, practice live with your instructor, then review the recording or course materials.</p></div></div></Page>;
}

function StudentBilling({ monthlyFee, dueDate, payment, level, onNotify }: { monthlyFee: number; dueDate: string; payment: Student["payment"]; level: string; onNotify: (message: string) => void }) {
  return <Page><PageHeader eyebrow="Account and access" title="Payments" text="Review your fees, payment due dates and receipts." /><div className={styles.billingGrid}><section className={styles.paymentCard}><span>Next payment</span><strong>{formatCurrency(monthlyFee)}</strong><p>Due date: {formatDate(dueDate)}</p><div className={styles.paymentStatus}><Icon name={payment === "Pagado" ? "check" : "clock"} />{payment === "Pagado" ? "Cuenta al día" : `Pago ${payment.toLowerCase()}`}</div><button className={styles.primaryButton} onClick={() => onNotify("Consulta las instrucciones de pago directamente con Level Up")}>View payment instructions</button></section><section className={styles.panel}><SectionHeading title="Your access" text="Your Level Up membership status." /><dl className={styles.definitionList}><div><dt>Status</dt><dd><span className={payment === "Vencido" ? styles.draftPill : styles.successPill}>{payment === "Vencido" ? "Requiere atención" : "Active"}</span></dd></div><div><dt>Plan</dt><dd>English {level} · Monthly</dd></div><div><dt>Next date</dt><dd>{formatDate(dueDate)}</dd></div><div><dt>Reminder</dt><dd>5 days before</dd></div></dl></section></div><section className={styles.panel + " " + styles.historyPanel}><SectionHeading title="Payment history" text="Receipts appear when Level Up records each payment." /><div className={styles.simpleTable}><div className={styles.tableHead}><span>Period</span><span>Date</span><span>Amount</span><span>Status</span></div><div><span>Current period</span><span>{formatDate(dueDate)}</span><span>{formatCurrency(monthlyFee)}</span><span className={payment === "Pagado" ? styles.successPill : styles.draftPill}>{displayLabel(payment)}</span></div></div></section></Page>;
}

function HelpCenter({ addTicket, onNotify }: { addTicket: (ticket: Omit<Ticket, "id" | "status" | "created">) => void; onNotify: (message: string) => void }) {
  const [category, setCategory] = useState("Acceso");
  const [detail, setDetail] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (!detail.trim()) return; addTicket({ source: "Student", person: "Sofía Rojas", title: category, detail, priority: "Media" }); setDetail(""); }
  return <Page><PageHeader eyebrow="Help center" title="How can we help?" text="Find answers or send a request to the Level Up team." /><label className={styles.helpSearch}><Icon name="search" /><input placeholder="Search for an answer..." /><button onClick={() => onNotify("Mostrando resultados de ayuda")}>Search</button></label><div className={styles.helpGrid}>{[["lock", "Acceso y contraseña", "Recuperar contraseña, iniciar sesión y mantener tu cuenta segura."], ["book", "Cursos y progreso", "Lessons, evaluaciones, certificados y avance."], ["calendar", "Live classes", "Horarios, enlaces y preparación para sesiones."], ["card", "Pagos", "Dates de cobro, comprobantes y estado de acceso."]].map(([icon, title, text]) => <button key={title} onClick={() => onNotify("Abriendo ayuda: " + title)}><Icon name={icon} /><strong>{title}</strong><span>{text}</span></button>)}</div><form className={styles.supportForm} onSubmit={submit}><div><span className={styles.eyebrow}>Could not find an answer?</span><h2>Send a request</h2><p>Your academy can escalate technical issues to CORVEN.</p></div><label>Help category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Access</option><option>Course or lesson</option><option>Live class</option><option>Payment</option><option>Technical issue</option></select></label><label>What do you need?<textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Tell us what happened..." required /></label><button className={styles.primaryButton} type="submit">Send request</button></form></Page>;
}

function AdminExperience(props: {
  view: AdminView; setView: (view: View) => void; students: Student[]; courses: Course[]; tickets: Ticket[]; activeCount: number; paidCount: number; collectedRevenue: number; projectedRevenue: number; monthlyFee: number; setMonthlyFee: (value: number) => void | Promise<void>; updateStudent: (id: Student["id"], changes: Partial<Student>) => void | boolean | Promise<void | boolean>; setCourses: React.Dispatch<React.SetStateAction<Course[]>>; inviteStudent: (input: { fullName: string; email: string; level: string; dueDate: string; courseId?: string; planName?: string; groupName?: string }) => boolean | Promise<boolean>; brand: LmsBrand; setBrand: React.Dispatch<React.SetStateAction<LmsBrand>>; saveBrand: () => void | Promise<void>; logoUrl: string | null; handleLogo: (file?: File) => void | Promise<void>; addTicket: (ticket: Omit<Ticket, "id" | "status" | "created">) => void | Promise<void>; onNotify: (message: string) => void; persistent: boolean; organizationId?: string; viewerName: string;
}) {
  if (props.persistent && props.organizationId && ["overview","income","sessions"].includes(props.view)) return <AcademyWorkspace organizationId={props.organizationId} view={props.view as "overview"|"income"|"sessions"} students={props.students} courses={props.courses} onNavigate={props.setView} />;
  if (props.persistent && props.organizationId && props.view === "support") return <AcademySupport organizationId={props.organizationId} />;
  if (props.persistent && props.organizationId && props.view === "students") return <><AdminStudentPreview organizationId={props.organizationId} students={props.students}/><EnrollmentForm organizationId={props.organizationId} students={props.students} courses={props.courses}/><StudentManagement students={props.students} courses={props.courses} updateStudent={props.updateStudent} inviteStudent={props.inviteStudent} onNotify={props.onNotify}/></>;
  if (props.view === "students") return <StudentManagement students={props.students} courses={props.courses} updateStudent={props.updateStudent} inviteStudent={props.inviteStudent} onNotify={props.onNotify} />;
  if (props.view === "courses") return props.persistent
    ? <Page><PageHeader eyebrow="Content management" title="Courses" text="Design, organize and publish learning experiences." /><CourseStudioWorkspace students={props.students} courses={props.courses} setCourses={props.setCourses} onNotify={props.onNotify} persistent={props.persistent} organizationId={props.organizationId} /></Page>
    : <CourseStudio courses={props.courses} setCourses={props.setCourses} onNotify={props.onNotify} persistent={props.persistent} organizationId={props.organizationId} />;
  if (props.view === "income") return <IncomeDashboard students={props.students} monthlyFee={props.monthlyFee} setMonthlyFee={props.setMonthlyFee} collectedRevenue={props.collectedRevenue} projectedRevenue={props.projectedRevenue} onNotify={props.onNotify} />;
  if (props.view === "brand") return <BrandStudio brand={props.brand} setBrand={props.setBrand} saveBrand={props.saveBrand} logoUrl={props.logoUrl} handleLogo={props.handleLogo} onNotify={props.onNotify} />;
  if (props.view === "support") return <AdminSupport tickets={props.tickets} addTicket={props.addTicket} />;
  return <Page><PageHeader eyebrow="Academy administration" title={`Hello, ${props.viewerName.split(" ")[0]}.`} text="Here is how Level Up is doing today." action={<button className={styles.primaryButton} onClick={() => props.setView("students")}>+ Add student</button>} /><KpiGrid items={[{ icon: "users", label: "Active students", value: String(props.activeCount), detail: `de ${props.students.length} matriculados`, tone: "purple" }, { icon: "money", label: "Ingresos recibidos", value: formatCurrency(props.collectedRevenue), detail: props.paidCount + " pagos registrados", tone: "green" }, { icon: "book", label: "Published courses", value: String(props.courses.filter((course) => course.published).length), detail: `${props.courses.filter((course) => !course.published).length} en borrador`, tone: "orange" }, { icon: "support", label: "Soporte pendiente", value: String(props.tickets.filter((ticket) => ticket.status !== "Respondido").length), detail: "Solicitudes por atender", tone: "red" }]} /><div className={styles.adminOverviewGrid}><section className={styles.panel}><SectionHeading title="Revenue for the period" text="Recorded payments over the last six months." action="View income" onAction={() => props.setView("income")} /><RevenueChart values={[185, 210, 245, 280, 315, Math.round(props.collectedRevenue / 1000)]} /></section><section className={styles.panel}><SectionHeading title="Upcoming classes" text="Scheduled sessions." action="Manage" onAction={() => props.onNotify("Abriendo calendario de sesiones")} /><div className={styles.compactSessions}><div><span>09 OCT</span><p><strong>Conversation Lab</strong><small>6:30 p. m. · A1 · 4 students</small></p></div><div><span>13 OCT</span><p><strong>Grammar Clinic</strong><small>6:30 p. m. · A1 · 4 students</small></p></div><div><span>15 OCT</span><p><strong>Speaking Practice</strong><small>7:00 p. m. · A2 · 4 students</small></p></div></div></section></div><section className={styles.panel + " " + styles.dashboardTable}><SectionHeading title="Needs attention" text="Students with pending payments, suspended access or low progress." action="View students" onAction={() => props.setView("students")} /><StudentTable students={props.students.filter((student) => student.payment !== "Pagado" || !student.active)} updateStudent={props.updateStudent} onNotify={props.onNotify} compact /></section></Page>;
}

function StudentManagement({ students, courses, updateStudent, inviteStudent, onNotify }: { students: Student[]; courses: Course[]; updateStudent: (id: Student["id"], changes: Partial<Student>) => void | boolean | Promise<void | boolean>; inviteStudent: (input: { fullName: string; email: string; level: string; dueDate: string; courseId?: string; planName?: string; groupName?: string }) => boolean | Promise<boolean>; onNotify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [accessFilter, setAccessFilter] = useState("all");
  const [minProgress,setMinProgress]=useState(0),[maxProgress,setMaxProgress]=useState(100),[dueAfter,setDueAfter]=useState(""),[dueBefore,setDueBefore]=useState(""),[sortKey,setSortKey]=useState("name");
  const [paymentFilter,setPaymentFilter]=useState("all"),[groupFilter,setGroupFilter]=useState("all"),[levelFilter,setLevelFilter]=useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ fullName: "", email: "", level: "A1", dueDate: new Date().toISOString().slice(0, 10), courseId: "", planName:"1 class / week", groupName:"" });
  const filtered = students.filter((student) => (student.name + student.email + (student.studentCode??"") + (student.groupName??"") + student.lastAccess).toLowerCase().includes(query.toLowerCase()) && student.progress>=minProgress && student.progress<=maxProgress && (!dueAfter||student.dueDate>=dueAfter) && (!dueBefore||student.dueDate<=dueBefore) && (paymentFilter==="all"||student.payment===paymentFilter) && (groupFilter==="all"||student.groupName===groupFilter) && (levelFilter==="all"||student.level===levelFilter) && (accessFilter === "all" || (accessFilter === "active" ? student.active : !student.active))).sort((a,b)=>sortKey==="progress"?a.progress-b.progress:sortKey==="due"?a.dueDate.localeCompare(b.dueDate):sortKey==="group"?(a.groupName??"").localeCompare(b.groupName??""):a.name.localeCompare(b.name));
  const [inviting,setInviting]=useState(false);
  async function submitInvite(event: FormEvent) { event.preventDefault(); setInviting(true); const success=await inviteStudent(invite); setInviting(false); if(!success)return; setInvite({ fullName: "", email: "", level: "A1", dueDate: new Date().toISOString().slice(0, 10), courseId: "", planName:"1 class / week", groupName:"" }); setShowInvite(false); }
  return <Page><PageHeader eyebrow="Users and access" title="Students" text="Manage enrollments, passwords, payments and content access." action={<button className={styles.primaryButton} onClick={() => setShowInvite((current) => !current)}>+ Invite student</button>} />{showInvite && <form className={styles.builderPanel} onSubmit={submitInvite}><div className={styles.builderHeader}><div><span className={styles.eyebrow}>New account</span><h2>Invite student</h2></div><button type="button" onClick={() => setShowInvite(false)}>×</button></div><div className={styles.formGrid}><label>Full name<input value={invite.fullName} onChange={(event) => setInvite((current) => ({ ...current, fullName: event.target.value }))} required /></label><label>Email<input type="email" value={invite.email} onChange={(event) => setInvite((current) => ({ ...current, email: event.target.value }))} required /></label><label>Level<select value={invite.level} onChange={(event) => setInvite((current) => ({ ...current, level: event.target.value }))}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label><label>First payment due date<input type="date" value={invite.dueDate} onChange={(event) => setInvite((current) => ({ ...current, dueDate: event.target.value }))} required /></label><StudentPlanSelect value={invite.planName} onChange={planName=>setInvite(current=>({...current,planName}))} required disabled={inviting}/><label>Group (optional)<input maxLength={80} value={invite.groupName} onChange={e=>setInvite(current=>({...current,groupName:e.target.value}))} placeholder="e.g. Morning group"/></label><p className={styles.fullField}>A unique student code is assigned automatically when the invitation is created.</p><label className={styles.fullField}>Initial course<select value={invite.courseId} onChange={(event) => setInvite((current) => ({ ...current, courseId: event.target.value }))}><option value="">Assign later</option>{courses.map((course) => <option key={course.id} value={String(course.id)}>{course.title}</option>)}</select></label></div><div className={styles.builderActions}><button type="button" onClick={() => setShowInvite(false)}>Cancel</button><button className={styles.primaryButton} type="submit" disabled={inviting}>{inviting?"Sending…":"Send invitation"}</button></div></form>}<div className={styles.studentFilters}><label className={styles.studentSearch}>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email or student code" /></label><label>Access<select aria-label="Filter access" value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)}><option value="all">All accounts</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label><label>Payment<select aria-label="Filter payment" value={paymentFilter} onChange={e=>setPaymentFilter(e.target.value)}><option value="all">All payments</option><option value="Pagado">Paid</option><option value="Pendiente">Pending</option><option value="Vencido">Overdue</option></select></label><label>Group<select aria-label="Filter group" value={groupFilter} onChange={e=>setGroupFilter(e.target.value)}><option value="all">All groups</option>{Array.from(new Set(students.map(s=>s.groupName).filter(Boolean))).map(group=><option key={group}>{group}</option>)}</select></label><label>Level<select aria-label="Filter level" value={levelFilter} onChange={e=>setLevelFilter(e.target.value)}><option value="all">All levels</option>{Array.from(new Set(students.map(s=>s.level))).map(level=><option key={level}>{level}</option>)}</select></label><label>Progress from (%)<input aria-label="Minimum progress" type="number" min={0} max={100} value={minProgress} onChange={e=>setMinProgress(Number(e.target.value))}/></label><label>Progress to (%)<input aria-label="Maximum progress" type="number" min={0} max={100} value={maxProgress} onChange={e=>setMaxProgress(Number(e.target.value))}/></label><label>Due after<input type="date" value={dueAfter} onChange={e=>setDueAfter(e.target.value)}/></label><label>Due before<input type="date" value={dueBefore} onChange={e=>setDueBefore(e.target.value)}/></label><label>Sort by<select aria-label="Sort students" value={sortKey} onChange={e=>setSortKey(e.target.value)}><option value="name">Name A–Z</option><option value="progress">Progress</option><option value="due">Due date</option><option value="group">Group</option></select></label><button type="button" onClick={() => exportStudents(filtered)}>Export CSV</button></div><section className={styles.panel + " " + styles.tablePanel}><StudentTable students={filtered} updateStudent={updateStudent} onNotify={onNotify} /></section><div className={styles.accessNote}><Icon name="lock" /><div><strong>Payment access control</strong><p>Suspending a student blocks content access while preserving progress, grades and history. Reactivating restores access where they left off.</p></div></div></Page>;
}

function StudentTable({ students, updateStudent, onNotify, compact = false }: { students: Student[]; updateStudent: (id: Student["id"], changes: Partial<Student>) => void | boolean | Promise<void | boolean>; onNotify: (message: string) => void; compact?: boolean }) {
  return <div className={styles.tableScroll}><table className={styles.dataTable}><thead><tr><th>Student</th><th>Student code</th><th>Level</th><th>Progress</th>{!compact&&<><th>Group</th><th>Plan</th></>}<th>Payment</th>{!compact && <th>Next payment</th>}<th>Access</th>{!compact && <th>Account</th>}</tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><div className={styles.studentCell}><span>{student.initials}</span><p><strong>{student.name}</strong><small>{student.email}</small></p></div></td><td><code>{student.studentCode||"—"}</code></td><td><span className={styles.levelPill}>{student.level}</span></td><td><div className={styles.miniProgress}><span style={{ width: student.progress + "%" }}></span></div><small>{student.progress}%</small></td>{!compact&&<><td><input aria-label={`Group for ${student.name}`} defaultValue={student.groupName??""} maxLength={80} onBlur={e=>{if(e.target.value!==(student.groupName??""))void updateStudent(student.id,{groupName:e.target.value});}}/></td><td><StudentPlanEditor name={student.name} value={student.planName??""} onSave={planName=>updateStudent(student.id,{planName})}/></td></>}<td><select className={styles.statusSelect} value={student.payment} onChange={(event) => updateStudent(student.id, { payment: event.target.value as Student["payment"] })}><option value="Pagado">Paid</option><option value="Pendiente">Pending</option><option value="Vencido">Overdue</option></select></td>{!compact && <td><input className={styles.dateInput} type="date" value={student.dueDate} onChange={(event) => { updateStudent(student.id, { dueDate: event.target.value }); onNotify("Payment due date updated for " + student.name); }} /></td>}<td><button className={student.active ? styles.activeToggle : styles.inactiveToggle} onClick={() => { updateStudent(student.id, { active: !student.active }); onNotify((student.active ? "Access suspended for " : "Access restored for ") + student.name); }}><i></i>{student.active ? "Active" : "Suspended"}</button></td>{!compact && <td><button className={styles.iconButton} title="Reset password" onClick={async () => { const result = await sendPasswordResetAction(student.email); onNotify(result.message); }}><Icon name="lock" /></button><button className={styles.iconButton} title="Resend access" onClick={async () => { const result = await sendPasswordResetAction(student.email); onNotify(result.message); }}><Icon name="send" /></button></td>}</tr>)}</tbody></table></div>;
}

function CourseStudio({ courses, setCourses, onNotify, persistent, organizationId }: { courses: Course[]; setCourses: React.Dispatch<React.SetStateAction<Course[]>>; onNotify: (message: string) => void; persistent: boolean; organizationId?: string }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("A1");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState({ title: "", description: "", contentType: "youtube" as "text" | "youtube" | "document" | "audio", contentUrl: "" });
  async function createCourse(event: FormEvent) { event.preventDefault(); if (!title.trim()) return; let id: string | number = Date.now(); if (persistent && organizationId) { const result = await createCourseAction({ organizationId, title, level, description, youtubeUrl }); if (!result.ok || !result.data) return onNotify(result.message); id = result.data.id; onNotify(result.message); } else { onNotify("Course created as a draft"); } setCourses((current) => [...current, { id, title, level: level + " · New course", description: description || "Curso creado por Level Up.", progress: 0, lessons: 1, duration: "Por definir", students: 0, youtubeUrl, color: "#2C55A2", published: false }]); setTitle(""); setYoutubeUrl(""); setDescription(""); setShowBuilder(false); }
  async function toggleCourse(course: Course) { const published = !course.published; if (persistent && organizationId && typeof course.id === "string") { const result = await setCoursePublishedAction({ organizationId, courseId: course.id, published }); if (!result.ok) return onNotify(result.message); onNotify(result.message); } else { onNotify(course.published ? "Course moved to draft" : "Course published"); } setCourses((current) => current.map((item) => item.id === course.id ? { ...item, published } : item)); }
  async function addLesson(event: FormEvent) { event.preventDefault(); if (!editingCourse) return; if (persistent && organizationId && typeof editingCourse.id === "string") { const result = await addLessonAction({ organizationId, courseId: editingCourse.id, ...lesson }); if (!result.ok) return onNotify(result.message); onNotify(result.message); } else { onNotify("Lección agregada al demo"); } setCourses((current) => current.map((course) => course.id === editingCourse.id ? { ...course, lessons: course.lessons + 1, youtubeUrl: lesson.contentType === "youtube" ? lesson.contentUrl : course.youtubeUrl } : course)); setLesson({ title: "", description: "", contentType: "youtube", contentUrl: "" }); }
  return <Page><PageHeader eyebrow="Course Studio" title="Courses and content" text="Create hybrid learning experiences with lessons, video links, materials and assessments." action={<button className={styles.primaryButton} onClick={() => setShowBuilder(!showBuilder)}>+ Create course</button>} />{showBuilder && <form className={styles.builderPanel} onSubmit={createCourse}><div className={styles.builderHeader}><div><span className={styles.eyebrow}>New course</span><h2>Course basics</h2></div><button type="button" onClick={() => setShowBuilder(false)}>×</button></div><div className={styles.formGrid}><label>Course name<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Business English B1" required /></label><label>Level<select value={level} onChange={(event) => setLevel(event.target.value)}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label><label className={styles.fullField}>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What will the student achieve?" /></label><label className={styles.fullField}>First YouTube lesson<input type="url" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." /><small>Use a YouTube link for this lesson.</small></label></div><div className={styles.builderActions}><button type="button" onClick={() => setShowBuilder(false)}>Cancel</button><button className={styles.primaryButton} type="submit">Create draft</button></div></form>}{editingCourse && <form className={styles.builderPanel} onSubmit={addLesson}><div className={styles.builderHeader}><div><span className={styles.eyebrow}>Content editor</span><h2>{editingCourse.title}</h2></div><button type="button" onClick={() => setEditingCourse(null)}>×</button></div><div className={styles.formGrid}><label>Lesson title<input value={lesson.title} onChange={(event) => setLesson((current) => ({ ...current, title: event.target.value }))} required /></label><label>Tipo<select value={lesson.contentType} onChange={(event) => setLesson((current) => ({ ...current, contentType: event.target.value as typeof lesson.contentType }))}><option value="youtube">YouTube lesson</option><option value="text">Text or instructions</option><option value="document">Document link</option><option value="audio">Audio link</option></select></label><label className={styles.fullField}>Description<textarea value={lesson.description} onChange={(event) => setLesson((current) => ({ ...current, description: event.target.value }))} placeholder="Lesson objectives, instructions or content" /></label>{lesson.contentType !== "text" && <label className={styles.fullField}>Content link<input type="url" value={lesson.contentUrl} onChange={(event) => setLesson((current) => ({ ...current, contentUrl: event.target.value }))} placeholder={lesson.contentType === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://..."} required /></label>}</div><div className={styles.builderActions}><button type="button" onClick={() => setEditingCourse(null)}>Close</button><button className={styles.primaryButton} type="submit">Add lesson</button></div></form>}<div className={styles.courseAdminGrid}>{courses.map((course) => <article key={course.id} className={styles.adminCourseCard}><div className={styles.courseCover} style={{ background: "linear-gradient(135deg, " + course.color + ", #000000)" }}><span>{course.level.split(" · ")[0]}</span><Icon name="book" /></div><div><span className={course.published ? styles.successPill : styles.draftPill}>{course.published ? "Publicado" : "Borrador"}</span><h3>{course.title}</h3><p>{course.lessons} lessons · {course.duration} · {course.students} students</p><div className={styles.cardActions}><button onClick={() => setEditingCourse(course)}>Edit content</button><button onClick={() => toggleCourse(course)}>{course.published ? "Unpublish" : "Publicar"}</button></div></div></article>)}</div><section className={styles.panel + " " + styles.youtubeGuide}><div className={styles.youtubeIcon}><Icon name="video" /></div><div><strong>YouTube content</strong><p>Paste a public or unlisted link. Students can watch the lesson inside their course.</p></div><button className={styles.secondaryButton} onClick={() => onNotify("Guía de video abierta")}>View guide</button></section></Page>;
}

function IncomeDashboard({ students, monthlyFee, setMonthlyFee, collectedRevenue, projectedRevenue, onNotify }: { students: Student[]; monthlyFee: number; setMonthlyFee: (value: number) => void | Promise<void>; collectedRevenue: number; projectedRevenue: number; onNotify: (message: string) => void }) {
  const [draftFee, setDraftFee] = useState(monthlyFee);
  const paid = students.filter((student) => !student.isSample && student.payment === "Pagado").length;
  const pending = students.filter((student) => student.payment === "Pendiente").length;
  const overdue = students.filter((student) => student.payment === "Vencido").length;
  const total = Math.max(students.length, 1);
  const paidPercentage = Math.round((paid / total) * 100);
  const pendingPercentage = Math.round((pending / total) * 100);
  return <Page><PageHeader eyebrow="Financial management" title="Income and charges" text="Review fees, pending payments and due dates." action={<button className={styles.primaryButton} onClick={() => onNotify("Reporte financiero exportado")}>Export report</button>} /><div className={styles.feeControl}><div><span>Monthly fee per student</span><strong>{formatCurrency(monthlyFee)}</strong></div><label>Edit amount<input type="number" min="0" step="1000" value={draftFee} onChange={(event) => setDraftFee(Number(event.target.value))} onBlur={() => setMonthlyFee(draftFee)} /></label></div><KpiGrid items={[{ icon: "money", label: "Ingresos recibidos", value: formatCurrency(collectedRevenue), detail: "Mes actual", tone: "green" }, { icon: "chart", label: "Ingreso proyectado", value: formatCurrency(projectedRevenue), detail: `Si pagan los ${students.length} students`, tone: "purple" }, { icon: "clock", label: "Pendiente de cobro", value: formatCurrency((pending + overdue) * monthlyFee), detail: `${pending + overdue} mensualidades`, tone: "orange" }, { icon: "lock", label: "Accesos suspendidos", value: String(students.filter((student) => !student.active).length), detail: "Por pago vencido", tone: "red" }]} /><div className={styles.incomeLayout}><section className={styles.panel}><SectionHeading title="Monthly income" text="Recorded payment history." /><RevenueChart values={[185, 210, 245, 280, 315, Math.round(collectedRevenue / 1000)]} /></section><section className={styles.panel}><SectionHeading title="Distribution" text="Monthly payment status." /><div className={styles.donutChart} style={{ background: `conic-gradient(var(--brand-primary) 0 ${paidPercentage}%, var(--brand-accent) ${paidPercentage}% ${paidPercentage + pendingPercentage}%, #E97704 ${paidPercentage + pendingPercentage}% 100%)` }}><div><strong>{paidPercentage}%</strong><span>collected</span></div></div><ul className={styles.legend}><li><i className={styles.legendPaid}></i>Paid <strong>{paid}</strong></li><li><i className={styles.legendPending}></i>Pending <strong>{pending}</strong></li><li><i className={styles.legendLate}></i>Overdue <strong>{overdue}</strong></li></ul></section></div></Page>;
}

function BrandStudio({ brand, setBrand, saveBrand, logoUrl, handleLogo }: { brand: LmsBrand; setBrand: React.Dispatch<React.SetStateAction<LmsBrand>>; saveBrand: () => void | Promise<void>; logoUrl: string | null; handleLogo: (file?: File) => void | Promise<void>; onNotify: (message: string) => void }) {
  return <Page><PageHeader eyebrow="White label" title="Branding" text="Customize the portal for Level Up. CORVEN remains the technology provider." /><div className={styles.brandGrid}><section className={styles.panel}><SectionHeading title="Academy branding" text="Changes appear immediately." /><div className={styles.logoUploader}><TenantMark logoUrl={logoUrl} large /><div><strong>Level Up logo</strong><p>PNG, JPG, WEBP or SVG. Maximum 2 MB.</p><label>Select logo<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(event) => handleLogo(event.target.files?.[0])} /></label></div></div><div className={styles.colorControls}><ColorControl label="Primary color" value={brand.primary} onChange={(value) => setBrand((current) => ({ ...current, primary: value }))} /><ColorControl label="Secondary color" value={brand.secondary} onChange={(value) => setBrand((current) => ({ ...current, secondary: value }))} /><ColorControl label="Accent color" value={brand.accent} onChange={(value) => setBrand((current) => ({ ...current, accent: value }))} /></div><button className={styles.primaryButton} onClick={saveBrand}>Save branding</button></section><section className={styles.brandPreview}><span>Preview</span><div className={styles.previewWindow}><div className={styles.previewTop}><TenantMark logoUrl={logoUrl} /><strong>Level Up</strong><i></i></div><div className={styles.previewBody}><small>YOUR NEXT LESSON</small><h3>English Foundations</h3><p>Keep building your confidence.</p><button>Continue learning</button><div className={styles.previewCards}><span></span><span></span></div></div><div className={styles.previewPowered}>Powered by CORVEN</div></div></section></div></Page>;
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className={styles.colorControl}><span>{label}</span><div><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><input value={value.toUpperCase()} onChange={(event) => /^#[0-9A-Fa-f]{6}$/.test(event.target.value) && onChange(event.target.value)} /></div></label>;
}

function AdminSupport({ tickets, addTicket }: { tickets: Ticket[]; addTicket: (ticket: Omit<Ticket, "id" | "status" | "created">) => void }) {
  const [title, setTitle] = useState(""); const [detail, setDetail] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (!title.trim() || !detail.trim()) return; addTicket({ source: "Level Up", person: "Andrea · Administradora", title, detail, priority: "Alta" }); setTitle(""); setDetail(""); }
  return <Page><PageHeader eyebrow="Technical support" title="CORVEN support" text="Report platform issues and track the owner's response." /><div className={styles.supportLayout}><form className={styles.panel + " " + styles.reportForm} onSubmit={submit}><SectionHeading title="Report an issue" text="Include the steps you followed and what you expected to happen." /><label>Subject<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. I cannot publish a lesson" required /></label><label>Details<textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Describe the issue..." required /></label><label>Priority<select><option>High · Blocks work</option><option>Medium · I can continue</option><option>Low · Question or improvement</option></select></label><button className={styles.primaryButton} type="submit">Send to CORVEN</button></form><section className={styles.panel}><SectionHeading title="My requests" text="Your report history and status." /><TicketList tickets={tickets} /></section></div></Page>;
}

function OwnerExperience({ view, setView, academies, activity, tickets, setTickets, onCreateAcademy, onInviteAdmin, onInviteStudent, onUpdateStudent, onCreateCourse, onPublishCourse, onAddLesson, onUpdateAcademyStatus, onNotify, persistent, organizationId }: {
  view: OwnerView;
  setView: (view: View) => void;
  academies: Academy[];
  activity: ActivityEvent[];
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  onCreateAcademy: (input: { name: string; learningModel: Academy["learningModel"]; monthlyFee: number; primaryColor: string }) => Promise<boolean>;
  onInviteAdmin: (organizationId: string, input: { fullName: string; email: string }) => Promise<boolean>;
  onInviteStudent: (organizationId: string, input: { fullName: string; email: string; level: string; dueDate: string; courseId?: string; planName?: string; groupName?: string }) => Promise<boolean>;
  onUpdateStudent: (organizationId: string, studentId: Student["id"], changes: Partial<Student>) => Promise<boolean>;
  onCreateCourse: (organizationId: string, input: { title: string; level: string; description: string; youtubeUrl: string }) => Promise<boolean>;
  onPublishCourse: (organizationId: string, courseId: Course["id"], published: boolean) => Promise<boolean>;
  onAddLesson: (organizationId: string, courseId: Course["id"], input: { title: string; description: string; contentType: "text" | "youtube" | "document" | "audio"; contentUrl: string }) => Promise<boolean>;
  onUpdateAcademyStatus: (organizationId: string, status: "active" | "suspended") => Promise<boolean>;
  onNotify: (message: string) => void;
  persistent: boolean;
  organizationId?: string;
}) {
  const activeAcademies = academies.filter((academy) => academy.status === "active");
  const totalStudents = academies.reduce((total, academy) => total + academy.studentCount, 0);
  const totalCourses = academies.reduce((total, academy) => total + academy.courseCount, 0);
  const totalAdmins = academies.reduce((total, academy) => total + academy.adminCount, 0);
  if (view === "tickets") return <OwnerTickets tickets={tickets} setTickets={setTickets} onNotify={onNotify} persistent={persistent} organizationId={organizationId} />;
  if (view === "academies") return <AcademiesView academies={academies} onCreateAcademy={onCreateAcademy} onInviteAdmin={onInviteAdmin} onInviteStudent={onInviteStudent} onUpdateStudent={onUpdateStudent} onCreateCourse={onCreateCourse} onPublishCourse={onPublishCourse} onAddLesson={onAddLesson} onUpdateStatus={onUpdateAcademyStatus} onNotify={onNotify} />;
  if (view === "activity") return <ActivityView events={activity} />;
  return <Page><PageHeader eyebrow="CORVEN Learning Platform" title="Platform management" text="Monitor academies, access, support and activity in one place." action={<button className={styles.primaryButton} onClick={() => setView("academies")}>Manage academies</button>} /><KpiGrid items={[{ icon: "school", label: "Academias activas", value: String(activeAcademies.length), detail: `${academies.length} registradas`, tone: "purple" }, { icon: "users", label: "Students", value: String(totalStudents), detail: `${totalAdmins} administradores`, tone: "green" }, { icon: "book", label: "Courses", value: String(totalCourses), detail: "En todas las academias", tone: "orange" }, { icon: "support", label: "Tickets abiertos", value: String(tickets.filter((ticket) => ticket.status !== "Respondido").length), detail: "Pendientes de seguimiento", tone: "red" }]} /><div className={styles.ownerGrid}><section className={styles.panel}><SectionHeading title="Academy portfolio" text="Operational status of CORVEN clients." action="View academies" onAction={() => setView("academies")} /><div className={styles.healthHeader}><div className={styles.healthScore}>{academies.length ? Math.round(activeAcademies.length / academies.length * 100) : 0}<span>%</span></div><div><strong>{activeAcademies.length === academies.length ? "Operación saludable" : "Requiere revisión"}</strong><p>{activeAcademies.length} active academies out of {academies.length}</p></div></div><div className={styles.healthRows}><div><span>Database</span><strong className={styles.online}>Operational</strong></div><div><span>Authentication</span><strong className={styles.online}>Operational</strong></div><div><span>Assigned administrators</span><strong>{totalAdmins}</strong></div><div><span>Recorded activity</span><strong>{activity.length} events</strong></div></div></section><section className={styles.panel}><SectionHeading title="Recent support" text="Requests requiring follow-up." action="View all" onAction={() => setView("tickets")} /><TicketList tickets={tickets.slice(0, 3)} compact /></section></div><section className={styles.panel + " " + styles.ownerActions}><SectionHeading title="Owner actions" text="CORVEN administration tools." /><div><button onClick={() => setView("academies")}><Icon name="school" /><span><strong>Create academy</strong><small>Set up a new client</small></span></button><button onClick={() => setView("academies")}><Icon name="lock" /><span><strong>Assign administrators</strong><small>Invite and review access</small></span></button><button onClick={() => setView("activity")}><Icon name="clock" /><span><strong>Review activity</strong><small>Audit of recent changes</small></span></button></div></section></Page>;
}

function OwnerTickets({ tickets, setTickets, onNotify, persistent, organizationId }: { tickets: Ticket[]; setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>; onNotify: (message: string) => void; persistent: boolean; organizationId?: string }) {
  const [selected, setSelected] = useState<string | null>(tickets[0]?.id ?? null); const [reply, setReply] = useState(""); const activeTicket = tickets.find((ticket) => ticket.id === selected);
  async function updateTicket(status: "in_progress" | "answered", body = "") { if (!activeTicket) return; const ticketOrganizationId = activeTicket.organizationId ?? organizationId; if (persistent && ticketOrganizationId) { const result = await replyTicketAction({ organizationId: ticketOrganizationId, ticketId: activeTicket.id, body, status }); if (!result.ok) return onNotify(result.message); onNotify(result.message); } setTickets((current) => current.map((ticket) => ticket.id === activeTicket.id ? { ...ticket, reply: body || ticket.reply, status: status === "answered" ? "Respondido" : "En proceso" } : ticket)); if (status === "answered") setReply(""); }
  function sendReply() { if (!activeTicket || !reply.trim()) return; void updateTicket("answered", reply); }
  return <Page><PageHeader eyebrow="Support desk" title="Platform tickets" text="Receive, prioritize and respond to requests from academies and students." /><div className={styles.ticketWorkspace}><div className={styles.ticketQueue}>{tickets.map((ticket) => <button key={ticket.id} className={selected === ticket.id ? styles.ticketSelected : ""} onClick={() => setSelected(ticket.id)}><div><span>{ticket.id}</span><small className={ticket.priority === "Alta" ? styles.priorityHigh : ""}>{displayLabel(ticket.priority)}</small></div><strong>{ticket.title}</strong><p>{displayLabel(ticket.source)} · {ticket.created}</p><em>{displayLabel(ticket.status)}</em></button>)}</div>{activeTicket && <section className={styles.ticketDetail}><div className={styles.ticketDetailTop}><div><span>{activeTicket.id} · {activeTicket.source}</span><h2>{activeTicket.title}</h2><p>{activeTicket.person} · {activeTicket.created}</p></div><span className={activeTicket.priority === "Alta" ? styles.priorityHighPill : styles.statusTag}>{displayLabel(activeTicket.priority)}</span></div><div className={styles.messageBubble}><strong>{activeTicket.person}</strong><p>{activeTicket.detail}</p></div>{activeTicket.reply && <div className={styles.ownerReply}><strong>CORVEN Support</strong><p>{activeTicket.reply}</p></div>}<label className={styles.replyBox}>Reply<textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a clear reply to the client..." /><div><button onClick={() => void updateTicket("in_progress")}>Mark in progress</button><button className={styles.primaryButton} onClick={sendReply}>Send reply</button></div></label></section>}</div></Page>;
}

function AcademiesView({ academies, onCreateAcademy, onInviteAdmin, onInviteStudent, onUpdateStudent, onCreateCourse, onPublishCourse, onAddLesson, onUpdateStatus, onNotify }: {
  academies: Academy[];
  onCreateAcademy: (input: { name: string; learningModel: Academy["learningModel"]; monthlyFee: number; primaryColor: string }) => Promise<boolean>;
  onInviteAdmin: (organizationId: string, input: { fullName: string; email: string }) => Promise<boolean>;
  onInviteStudent: (organizationId: string, input: { fullName: string; email: string; level: string; dueDate: string; courseId?: string; planName?: string; groupName?: string }) => Promise<boolean>;
  onUpdateStudent: (organizationId: string, studentId: Student["id"], changes: Partial<Student>) => Promise<boolean>;
  onCreateCourse: (organizationId: string, input: { title: string; level: string; description: string; youtubeUrl: string }) => Promise<boolean>;
  onPublishCourse: (organizationId: string, courseId: Course["id"], published: boolean) => Promise<boolean>;
  onAddLesson: (organizationId: string, courseId: Course["id"], input: { title: string; description: string; contentType: "text" | "youtube" | "document" | "audio"; contentUrl: string }) => Promise<boolean>;
  onUpdateStatus: (organizationId: string, status: "active" | "suspended") => Promise<boolean>;
  onNotify: (message: string) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [managedId, setManagedId] = useState<string | null>(null);
  const [operationView, setOperationView] = useState<"students" | "courses">("students");
  const [name, setName] = useState("");
  const [learningModel, setLearningModel] = useState<Academy["learningModel"]>("hybrid");
  const [monthlyFee, setMonthlyFee] = useState(35000);
  const [primaryColor, setPrimaryColor] = useState("#2C55A2");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitAcademy(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const created = await onCreateAcademy({ name, learningModel, monthlyFee, primaryColor });
    setBusy(false);
    if (!created) return;
    setName("");
    setShowCreate(false);
  }

  async function submitAdmin(event: FormEvent, academyId: string) {
    event.preventDefault();
    setBusy(true);
    const invited = await onInviteAdmin(academyId, { fullName: adminName, email: adminEmail });
    setBusy(false);
    if (!invited) return;
    setAdminName("");
    setAdminEmail("");
  }

  async function toggleStatus(academy: Academy) {
    const nextStatus = academy.status === "active" ? "suspended" : "active";
    if (nextStatus === "suspended" && !window.confirm(`¿Suspender el acceso de ${academy.name}?`)) return;
    setBusy(true);
    await onUpdateStatus(academy.id, nextStatus);
    setBusy(false);
  }

  return <Page>
    <PageHeader eyebrow="Clients" title="Academies" text="Create organizations, assign administrators and manage access." action={<button className={styles.primaryButton} onClick={() => setShowCreate((current) => !current)}>{showCreate ? "Cerrar formulario" : "+ Nueva academia"}</button>} />
    {showCreate && <form className={`${styles.panel} ${styles.ownerFormPanel}`} onSubmit={submitAcademy}>
      <SectionHeading title="Create academy" text="Set up the organization, then assign its administrator." />
      <div className={styles.ownerFormGrid}>
        <label>Academy name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Horizon Academy" required minLength={3} /></label>
        <label>Learning model<select value={learningModel} onChange={(event) => setLearningModel(event.target.value as Academy["learningModel"])}><option value="hybrid">Hybrid</option><option value="self_paced">Self-paced</option><option value="instructor_led">Instructor-led</option></select></label>
        <label>Base monthly fee (CRC)<input type="number" min="0" step="1000" value={monthlyFee} onChange={(event) => setMonthlyFee(Number(event.target.value))} /></label>
        <label>Primary color<input className={styles.ownerColorInput} type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} /></label>
      </div>
      <div className={styles.ownerFormActions}><button type="button" onClick={() => setShowCreate(false)}>Cancel</button><button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Creando..." : "Create academy"}</button></div>
    </form>}
    <div className={styles.academyList}>
      {academies.map((academy) => <article className={styles.academyCard} key={academy.id}>
        <div className={styles.academyIdentity}><AcademyMark name={academy.name} /><div><span>{academy.status === "active" ? "Servicio activo" : "Servicio suspendido"}</span><h2>{academy.name}</h2><p>{learningModelLabel(academy.learningModel)} · /{academy.slug}</p></div></div>
        <div className={styles.academyMetrics}><div><span>Students</span><strong>{academy.studentCount}</strong></div><div><span>Courses</span><strong>{academy.courseCount}</strong></div><div><span>Administrators</span><strong>{academy.adminCount}</strong></div><div><span>Managed revenue</span><strong>{formatCurrency(academy.monthlyRevenue)}</strong></div></div>
        <div className={styles.academyFooter}><span className={academy.status === "active" ? styles.academyActive : styles.academySuspended}><i></i>{academy.status === "active" ? "Servicio activo" : "Servicio suspendido"}</span><small>Created: {academy.createdAt}</small><button onClick={() => { setManagedId((current) => current === academy.id ? null : academy.id); setOperationView("students"); }}>{managedId === academy.id ? "Cerrar" : "Administrar →"}</button></div>
        {managedId === academy.id && <div className={styles.academyManager}>
          <div className={styles.adminAccessList}><h3>Administrators and access</h3>{academy.admins.length ? academy.admins.map((admin) => <div key={admin.id}><AcademyMark name={admin.name} /><p><strong>{admin.name}</strong><small>{admin.email}</small></p><span data-status={admin.accessStatus}>{accessStatusLabel(admin.accessStatus)}</span></div>) : <p className={styles.mutedText}>No administrators assigned yet.</p>}</div>
          <form className={styles.adminInviteForm} onSubmit={(event) => submitAdmin(event, academy.id)}><h3>Assign administrator</h3><label>Full name<input value={adminName} onChange={(event) => setAdminName(event.target.value)} required minLength={2} /></label><label>Email address<input type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} required /></label><button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Procesando..." : "Invitar administrador"}</button></form>
          <section className={styles.ownerAcademyOperations}>
            <div className={styles.ownerOperationHeader}><div><span>Academy operations</span><h3>Users and content</h3></div><div><button className={operationView === "students" ? styles.ownerOperationActive : ""} onClick={() => setOperationView("students")}><Icon name="users" />Students ({academy.students.length})</button><button className={operationView === "courses" ? styles.ownerOperationActive : ""} onClick={() => setOperationView("courses")}><Icon name="book" />Courses ({academy.courses.length})</button></div></div>
            {operationView === "students"
              ? <AcademyStudentOperations academy={academy} onInvite={onInviteStudent} onUpdate={onUpdateStudent} onNotify={onNotify} />
              : <AcademyCourseOperations academy={academy} onCreate={onCreateCourse} onPublish={onPublishCourse} onAddLesson={onAddLesson} />}
          </section>
          <div className={styles.academyDangerZone}><div><strong>Service status</strong><p>{academy.status === "active" ? "La academia y sus usuarios pueden acceder normalmente." : "La academia está pausada hasta que CORVEN la reactive."}</p></div><button disabled={busy} onClick={() => void toggleStatus(academy)}>{academy.status === "active" ? "Suspender academia" : "Reactivar academia"}</button></div>
        </div>}
      </article>)}
      {!academies.length && <section className={`${styles.panel} ${styles.emptyState}`}><Icon name="school" /><strong>No academies yet</strong><p>Create the first organization to get started.</p></section>}
    </div>
  </Page>;
}

function AcademyStudentOperations({ academy, onInvite, onUpdate, onNotify }: {
  academy: Academy;
  onInvite: (organizationId: string, input: { fullName: string; email: string; level: string; dueDate: string; courseId?: string; planName?: string; groupName?: string }) => Promise<boolean>;
  onUpdate: (organizationId: string, studentId: Student["id"], changes: Partial<Student>) => Promise<boolean>;
  onNotify: (message: string) => void;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ fullName: "", email: "", level: "A1", dueDate: new Date().toISOString().slice(0, 10), courseId: "" });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const invited = await onInvite(academy.id, { ...draft, courseId: draft.courseId || undefined });
    setBusy(false);
    if (!invited) return;
    setDraft({ fullName: "", email: "", level: "A1", dueDate: new Date().toISOString().slice(0, 10), courseId: "" });
    setShowInvite(false);
  }

  return <div className={styles.ownerOperationBody}>
    <div className={styles.ownerOperationToolbar}><div><strong>Students in {academy.name}</strong><span>Base monthly fee: {formatCurrency(academy.defaultMonthlyFee)}</span></div><button className={styles.primaryButton} onClick={() => setShowInvite((current) => !current)}>{showInvite ? "Cerrar" : "+ Invite student"}</button></div>
    {showInvite && <form className={styles.ownerInlineForm} onSubmit={submit}>
      <label>Full name<input value={draft.fullName} onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))} required minLength={2} /></label>
      <label>Email address<input type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} required /></label>
      <label>Level<select value={draft.level} onChange={(event) => setDraft((current) => ({ ...current, level: event.target.value }))}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label>
      <label>First payment due date<input type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} required /></label>
      <label>Initial course<select value={draft.courseId} onChange={(event) => setDraft((current) => ({ ...current, courseId: event.target.value }))}><option value="">Assign later</option>{academy.courses.map((course) => <option key={course.id} value={String(course.id)}>{course.title}</option>)}</select></label>
      <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Procesando..." : "Crear acceso"}</button>
    </form>}
    {academy.students.length ? <div className={styles.ownerStudentTable}><table><thead><tr><th>Student</th><th>Level</th><th>Payment</th><th>Next payment</th><th>Access</th></tr></thead><tbody>{academy.students.map((student) => <tr key={student.id}><td><div className={styles.studentCell}><span>{student.initials}</span><p><strong>{student.name}</strong><small>{student.email}</small></p></div></td><td><span className={styles.levelPill}>{student.level}</span></td><td><select className={styles.statusSelect} value={student.payment} onChange={async (event) => { const payment = event.target.value as Student["payment"]; if (await onUpdate(academy.id, student.id, { payment })) onNotify(`Pago de ${student.name}: ${payment}.`); }}><option value="Pagado">Paid</option><option value="Pendiente">Pending</option><option value="Vencido">Overdue</option></select></td><td><input className={styles.dateInput} type="date" value={student.dueDate} onChange={async (event) => { if (await onUpdate(academy.id, student.id, { dueDate: event.target.value })) onNotify(`Payment due date updated for ${student.name}.`); }} /></td><td><button className={student.active ? styles.activeToggle : styles.inactiveToggle} onClick={async () => { if (await onUpdate(academy.id, student.id, { active: !student.active })) onNotify(`${student.active ? "Acceso suspendido" : "Acceso reactivado"} para ${student.name}.`); }}><i></i>{student.active ? "Active" : "Suspended"}</button></td></tr>)}</tbody></table></div> : <div className={styles.ownerOperationEmpty}><Icon name="users" /><strong>No students yet</strong><span>Invite the first student and assign an initial course.</span></div>}
  </div>;
}

function AcademyCourseOperations({ academy, onCreate, onPublish, onAddLesson }: {
  academy: Academy;
  onCreate: (organizationId: string, input: { title: string; level: string; description: string; youtubeUrl: string }) => Promise<boolean>;
  onPublish: (organizationId: string, courseId: Course["id"], published: boolean) => Promise<boolean>;
  onAddLesson: (organizationId: string, courseId: Course["id"], input: { title: string; description: string; contentType: "text" | "youtube" | "document" | "audio"; contentUrl: string }) => Promise<boolean>;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<Course["id"] | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ title: "", level: "A1", description: "", youtubeUrl: "" });
  const [lesson, setLesson] = useState({ title: "", description: "", contentType: "youtube" as "text" | "youtube" | "document" | "audio", contentUrl: "" });
  const editingCourse = academy.courses.find((course) => course.id === editingCourseId);

  async function submitCourse(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const created = await onCreate(academy.id, draft);
    setBusy(false);
    if (!created) return;
    setDraft({ title: "", level: "A1", description: "", youtubeUrl: "" });
    setShowCreate(false);
  }

  async function submitLesson(event: FormEvent) {
    event.preventDefault();
    if (!editingCourse) return;
    setBusy(true);
    const created = await onAddLesson(academy.id, editingCourse.id, lesson);
    setBusy(false);
    if (!created) return;
    setLesson({ title: "", description: "", contentType: "youtube", contentUrl: "" });
  }

  return <div className={styles.ownerOperationBody}>
    <div className={styles.ownerOperationToolbar}><div><strong>Courses and resources</strong><span>Create drafts, add lessons and manage publishing.</span></div><button className={styles.primaryButton} onClick={() => setShowCreate((current) => !current)}>{showCreate ? "Cerrar" : "+ Create course"}</button></div>
    {showCreate && <form className={styles.ownerInlineForm} onSubmit={submitCourse}>
      <label>Course name<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} required minLength={3} /></label>
      <label>Level<select value={draft.level} onChange={(event) => setDraft((current) => ({ ...current, level: event.target.value }))}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label>
      <label className={styles.ownerFormWide}>Description<textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Course objectives and scope" /></label>
      <label className={styles.ownerFormWide}>First YouTube lesson<input type="url" value={draft.youtubeUrl} onChange={(event) => setDraft((current) => ({ ...current, youtubeUrl: event.target.value }))} placeholder="https://www.youtube.com/watch?v=..." /></label>
      <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Creando..." : "Create draft"}</button>
    </form>}
    {academy.courses.length ? <div className={styles.ownerCourseGrid}>{academy.courses.map((course) => <article key={course.id}><div className={styles.ownerCourseCover} style={{ background: `linear-gradient(135deg, ${course.color}, #000000)` }}><Icon name="book" /><span>{course.level.split(" · ")[0]}</span></div><div><span className={course.published ? styles.successPill : styles.draftPill}>{course.published ? "Publicado" : "Borrador"}</span><h4>{course.title}</h4><p>{course.lessons} lessons · {course.students} students</p><div><button onClick={() => setEditingCourseId((current) => current === course.id ? null : course.id)}>{editingCourseId === course.id ? "Cerrar editor" : "Add lesson"}</button><button onClick={() => void onPublish(academy.id, course.id, !course.published)}>{course.published ? "Unpublish" : "Publicar"}</button></div></div></article>)}</div> : <div className={styles.ownerOperationEmpty}><Icon name="book" /><strong>No courses yet</strong><span>Create the first draft and add content using links.</span></div>}
    {editingCourse && <form className={`${styles.ownerInlineForm} ${styles.ownerLessonForm}`} onSubmit={submitLesson}><div className={styles.ownerFormTitle}><span>Add content</span><strong>{editingCourse.title}</strong></div><label>Lesson title<input value={lesson.title} onChange={(event) => setLesson((current) => ({ ...current, title: event.target.value }))} required minLength={2} /></label><label>Tipo<select value={lesson.contentType} onChange={(event) => setLesson((current) => ({ ...current, contentType: event.target.value as typeof lesson.contentType }))}><option value="youtube">YouTube</option><option value="text">Text</option><option value="document">Document link</option><option value="audio">Audio link</option></select></label><label className={styles.ownerFormWide}>Description<textarea value={lesson.description} onChange={(event) => setLesson((current) => ({ ...current, description: event.target.value }))} placeholder="Objectives and instructions" /></label>{lesson.contentType !== "text" && <label className={styles.ownerFormWide}>Link HTTPS<input type="url" value={lesson.contentUrl} onChange={(event) => setLesson((current) => ({ ...current, contentUrl: event.target.value }))} required placeholder={lesson.contentType === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://..."} /></label>}<button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? "Saving..." : "Add lesson"}</button></form>}
  </div>;
}

function ActivityView({ events }: { events: ActivityEvent[] }) {
  return <Page><PageHeader eyebrow="Audit" title="Platform activity" text="Record of changes made by CORVEN and administrators." /><section className={styles.panel}>{events.length ? <div className={styles.activityList}>{events.map((event, index) => <div key={event.id}><span><Icon name={index % 2 ? "users" : "clock"} /></span><p><strong>{event.action}</strong><small>{event.actor} · {event.academy} · {event.created}</small></p></div>)}</div> : <div className={styles.emptyState}><Icon name="clock" /><strong>No activity recorded yet</strong><p>New administrative actions will appear here.</p></div>}</section></Page>;
}

function CourseCard({ course, student, onOpen }: { course: Course; student?: boolean; onOpen: () => void }) {
  return <article className={styles.courseCard}><button className={styles.courseImage} style={{ background: "linear-gradient(135deg, " + course.color + ", #101827)" }} onClick={onOpen}><span>{course.level.split(" · ")[0]}</span><div><Icon name="play" /></div><small>LEVEL UP</small></button><div className={styles.courseBody}><span>{course.level}</span><h3>{course.title}</h3><p>{course.description}</p><div className={styles.courseMeta}><span>{course.lessons} lessons</span><span>{course.duration}</span></div>{student && <><div className={styles.courseProgress}><span style={{ width: course.progress + "%" }}></span></div><small>{course.progress}% complete</small></>}</div></article>;
}

function TicketList({ tickets, compact = false }: { tickets: Ticket[]; compact?: boolean }) {
  if (!tickets.length) return <div className={styles.emptyState}><Icon name="check" /><strong>No pending requests</strong></div>;
  return <div className={styles.ticketList}>{tickets.map((ticket) => <div key={ticket.id}><span className={ticket.priority === "Alta" ? styles.ticketHighIcon : styles.ticketIcon}><Icon name="support" /></span><p><strong>{ticket.title}</strong><small>{ticket.id} · {ticket.created}</small>{!compact && <em>{ticket.detail}</em>}</p><span className={ticket.status === "Respondido" ? styles.successPill : styles.statusTag}>{displayLabel(ticket.status)}</span></div>)}</div>;
}

function RevenueChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1); const months = ["MAY", "JUN", "JUL", "AGO", "SEP", "OCT"];
  return <div className={styles.revenueChart}>{values.map((value, index) => <div key={months[index]}><span style={{ height: Math.max(12, value / max * 100) + "%" }}><i>₡{value}k</i></span><small>{months[index]}</small></div>)}</div>;
}

function KpiGrid({ items }: { items: { icon: string; label: string; value: string; detail: string; tone: string }[] }) {
  return <section className={styles.kpiGrid}>{items.map((item) => <article key={item.label} className={styles.kpiCard} data-tone={item.tone}><span><Icon name={item.icon} /></span><div><small>{item.label}</small><strong>{item.value}</strong><p>{item.detail}</p></div></article>)}</section>;
}

function Page({ children }: { children: React.ReactNode }) { return <div className={styles.pageContent}>{children}</div>; }
function PageHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) { return <header className={styles.pageHeader}><div><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</header>; }
function SectionHeading({ title, text, action, onAction }: { title: string; text?: string; action?: string; onAction?: () => void }) { return <div className={styles.sectionHeading}><div><h2>{title}</h2>{text && <p>{text}</p>}</div>{action && <button onClick={onAction}>{action} →</button>}</div>; }

function TenantMark({ logoUrl, large = false }: { logoUrl?: string | null; large?: boolean }) {
  if (logoUrl) return <span className={large ? styles.tenantLogoLarge : styles.tenantLogo}><Image src={logoUrl} alt="Level Up logo" fill unoptimized /></span>;
  return <span className={`${large ? styles.tenantLogoLarge : styles.tenantLogo} ${styles.levelUpMark}`}><Image src="/brand/level-up/mark-transparent.png" alt="Level Up" fill sizes={large ? "78px" : "42px"} /></span>;
}

function AcademyMark({ name }: { name: string }) {
  return <span className={styles.academyMark}>{initialsFor(name)}</span>;
}

function PoweredBy() { return <div className={styles.poweredBy}><span>Powered by</span><Image src="/brand/corven-imagotype-purple.png" alt="CORVEN" width={360} height={120} /></div>; }
function formatCurrency(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string) { if (!value) return "por definir"; const date = new Date(`${value}T12:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "America/Costa_Rica" }).format(date); }
function initialsFor(value: string) { return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "LU"; }
function learningModelLabel(value: Academy["learningModel"]) { return { hybrid: "Hybrid learning", self_paced: "Self-paced learning", instructor_led: "Instructor-led" }[value]; }
function accessStatusLabel(value: AcademyAdmin["accessStatus"]) { return { invited: "Invitation pending", active: "Active", suspended: "Suspended", archived: "Archived" }[value]; }

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>, users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2"/><path d="M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 4v2"/></>, book: <><path d="M4 5a3 3 0 0 1 3-2h5v16H7a3 3 0 0 0-3 2Z"/><path d="M20 5a3 3 0 0 0-3-2h-5v16h5a3 3 0 0 1 3 2Z"/></>, chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, award: <><circle cx="12" cy="9" r="6"/><path d="m8 14-1 7 5-3 5 3-1-7"/></>, search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>, card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>, help: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.4 2c-.8.5-1.2 1-1.2 2M12 17h.01"/></>, money: <><rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3"/><path d="M7 9H6v1M17 16h1v-1"/></>, palette: <><path d="M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12Z"/><circle cx="7.5" cy="10" r=".5" fill="currentColor"/><circle cx="9.5" cy="6.5" r=".5" fill="currentColor"/></>, support: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v5H5a1 1 0 0 1-1-1ZM20 14h-3v5h2a1 1 0 0 0 1-1ZM17 19c0 2-2 2-4 2"/></>, school: <><path d="m3 10 9-5 9 5-9 5Z"/><path d="M7 13v4c3 2 7 2 10 0v-4M21 10v6"/></>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 19h4"/></>, lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>, video: <><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2Z"/></>, play: <path d="m9 7 8 5-8 5Z"/>, check: <path d="m5 12 4 4L19 6"/>, send: <><path d="m3 11 18-8-8 18-2-7Z"/><path d="m11 14 4-4"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.home}</svg>;
}

function exportStudents(students: Student[]) {
  const rows = [["Name","Email","Student code","Level","Plan","Group","Progress","Payment","Access"], ...students.map(s => [s.name,s.email,s.studentCode??"",s.level,s.planName??"",s.groupName??"",String(s.progress),s.payment,s.active?"Active":"Suspended"])];
  const csv = rows.map(row => row.map(value => '"'+value.replace(/^[=+@-]/,"'").replaceAll('"','""')+'"').join(",")).join("\r\n");
  const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download="estudiantes-level-up.csv";link.click();URL.revokeObjectURL(url);
}
