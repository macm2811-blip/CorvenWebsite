"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import styles from "./level-up-lms.module.css";

type Role = "student" | "admin" | "owner";
type StudentView = "home" | "courses" | "sessions" | "billing" | "help";
type AdminView = "overview" | "students" | "courses" | "income" | "brand" | "support";
type OwnerView = "platform" | "academies" | "tickets" | "activity";
type View = StudentView | AdminView | OwnerView;

type Student = {
  id: number;
  name: string;
  email: string;
  initials: string;
  level: string;
  progress: number;
  active: boolean;
  payment: "Pagado" | "Pendiente" | "Vencido";
  dueDate: string;
  lastAccess: string;
};

type Course = {
  id: number;
  title: string;
  level: string;
  description: string;
  progress: number;
  lessons: number;
  duration: string;
  students: number;
  youtubeUrl: string;
  color: string;
  published: boolean;
};

type Ticket = {
  id: string;
  source: "Level Up" | "Estudiante";
  person: string;
  title: string;
  detail: string;
  priority: "Alta" | "Media" | "Baja";
  status: "Abierto" | "En proceso" | "Respondido";
  created: string;
  reply?: string;
};

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
  { id: 1, title: "English Foundations A1", level: "Beginner · A1", description: "Construye una base práctica para presentarte, conversar y desenvolverte en situaciones cotidianas.", progress: 68, lessons: 18, duration: "6 h 20 min", students: 4, youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U", color: "#6d28d9", published: true },
  { id: 2, title: "Everyday English A2", level: "Elementary · A2", description: "Vocabulario, listening y conversación para resolver situaciones comunes con mayor confianza.", progress: 44, lessons: 22, duration: "8 h 10 min", students: 4, youtubeUrl: "", color: "#ea580c", published: true },
  { id: 3, title: "Confident Conversations B1", level: "Intermediate · B1", description: "Práctica guiada para expresar ideas, explicar experiencias y participar en conversaciones más fluidas.", progress: 26, lessons: 16, duration: "7 h 40 min", students: 2, youtubeUrl: "", color: "#0891b2", published: false },
];

const initialTickets: Ticket[] = [
  { id: "SUP-1042", source: "Level Up", person: "Andrea · Administradora", title: "No carga el enlace de una clase", detail: "El video de la lección 4 muestra un mensaje de enlace no disponible.", priority: "Alta", status: "Abierto", created: "Hoy · 8:35 a. m." },
  { id: "SUP-1038", source: "Estudiante", person: "María Fernández", title: "No encuentro mi certificado", detail: "Completé el curso A1 y necesito descargar el certificado.", priority: "Media", status: "En proceso", created: "Ayer · 5:12 p. m." },
];

const navItems: Record<Role, { id: View; label: string; icon: string; count?: number }[]> = {
  student: [
    { id: "home", label: "Inicio", icon: "home" },
    { id: "courses", label: "Mis cursos", icon: "book" },
    { id: "sessions", label: "Clases en vivo", icon: "calendar", count: 2 },
    { id: "billing", label: "Pagos", icon: "card", count: 1 },
    { id: "help", label: "Ayuda", icon: "help" },
  ],
  admin: [
    { id: "overview", label: "Resumen", icon: "home" },
    { id: "students", label: "Estudiantes", icon: "users", count: 1 },
    { id: "courses", label: "Cursos", icon: "book" },
    { id: "income", label: "Ingresos", icon: "money", count: 3 },
    { id: "brand", label: "Identidad visual", icon: "palette" },
    { id: "support", label: "Soporte CORVEN", icon: "support", count: 1 },
  ],
  owner: [
    { id: "platform", label: "Panel CORVEN", icon: "chart" },
    { id: "academies", label: "Academias", icon: "school" },
    { id: "tickets", label: "Tickets", icon: "support", count: 2 },
    { id: "activity", label: "Actividad", icon: "clock" },
  ],
};

const roleDefaultView: Record<Role, View> = { student: "home", admin: "overview", owner: "platform" };

export function LevelUpLms() {
  const [role, setRole] = useState<Role>("student");
  const [view, setView] = useState<View>("home");
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [toast, setToast] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brand, setBrand] = useState({ primary: "#6d28d9", secondary: "#111827", accent: "#f97316" });
  const [monthlyFee, setMonthlyFee] = useState(35000);

  const activeCount = students.filter((student) => student.active).length;
  const paidCount = students.filter((student) => student.payment === "Pagado").length;
  const collectedRevenue = paidCount * monthlyFee;
  const projectedRevenue = students.length * monthlyFee;
  const themeVariables = { "--brand-primary": brand.primary, "--brand-secondary": brand.secondary, "--brand-accent": brand.accent } as React.CSSProperties;

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setView(roleDefaultView[nextRole]);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2700);
  }

  function updateStudent(id: number, changes: Partial<Student>) {
    setStudents((current) => current.map((student) => student.id === id ? { ...student, ...changes } : student));
  }

  function addTicket(ticket: Omit<Ticket, "id" | "status" | "created">) {
    setTickets((current) => [{ ...ticket, id: "SUP-" + String(1043 + current.length), status: "Abierto", created: "Ahora" }, ...current]);
    showToast("Reporte enviado a CORVEN. Te notificaremos la respuesta.");
  }

  function handleLogo(file?: File) {
    if (!file) return;
    setLogoUrl(URL.createObjectURL(file));
    showToast("Logo actualizado en la vista previa");
  }

  return (
    <div className={styles.appShell} style={themeVariables}>
      <header className={styles.topbar}>
        <div className={styles.mobileBrand}><TenantMark logoUrl={logoUrl} /><strong>Level Up</strong></div>
        <label className={styles.globalSearch}><Icon name="search" /><input aria-label="Buscar en la academia" placeholder="Buscar cursos, lecciones o estudiantes" /><kbd>⌘ K</kbd></label>
        <div className={styles.topbarTools}>
          <span className={styles.demoBadge}>Piloto Level Up</span>
          <button className={styles.notificationButton} onClick={() => showToast(role === "owner" ? "2 tickets requieren atención" : "Tienes notificaciones nuevas")} aria-label="Notificaciones"><Icon name="bell" /><span>{role === "student" ? 3 : role === "admin" ? 6 : 2}</span></button>
          <div className={styles.roleSwitch} aria-label="Cambiar perspectiva del demo">
            <button className={role === "student" ? styles.roleActive : ""} onClick={() => changeRole("student")}>Estudiante</button>
            <button className={role === "admin" ? styles.roleActive : ""} onClick={() => changeRole("admin")}>Level Up</button>
            <button className={role === "owner" ? styles.roleActive : ""} onClick={() => changeRole("owner")}>CORVEN</button>
          </div>
          <button className={styles.avatarButton} onClick={() => showToast("Menú de cuenta")}>{role === "student" ? "SR" : role === "admin" ? "AL" : "MC"}</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.tenantBrand}><TenantMark logoUrl={logoUrl} /><div><strong>Level Up</strong><span>English Academy</span></div></div>
          <nav className={styles.sideNav} aria-label="Navegación principal">
            {navItems[role].map((item) => <button key={item.id} className={view === item.id ? styles.navActive : ""} onClick={() => setView(item.id)}><Icon name={item.icon} /><span>{item.label}</span>{item.count ? <small>{item.count}</small> : null}</button>)}
          </nav>
          <div className={styles.hybridNote}><span className={styles.liveDot}></span><div><strong>Modalidad híbrida</strong><small>Clases en vivo + aprendizaje autónomo</small></div></div>
          <PoweredBy />
        </aside>

        <main className={styles.mainArea}>
          {role === "student" && <StudentExperience view={view as StudentView} setView={setView} courses={courses} onNotify={showToast} addTicket={addTicket} monthlyFee={monthlyFee} />}
          {role === "admin" && <AdminExperience view={view as AdminView} setView={setView} students={students} courses={courses} tickets={tickets} activeCount={activeCount} paidCount={paidCount} collectedRevenue={collectedRevenue} projectedRevenue={projectedRevenue} monthlyFee={monthlyFee} setMonthlyFee={setMonthlyFee} updateStudent={updateStudent} setCourses={setCourses} brand={brand} setBrand={setBrand} logoUrl={logoUrl} handleLogo={handleLogo} addTicket={addTicket} onNotify={showToast} />}
          {role === "owner" && <OwnerExperience view={view as OwnerView} setView={setView} students={students} courses={courses} tickets={tickets} setTickets={setTickets} collectedRevenue={collectedRevenue} onNotify={showToast} />}
          <footer className={styles.mobileFooter}><PoweredBy /></footer>
        </main>
      </div>
      {toast && <div className={styles.toast} role="status"><Icon name="check" />{toast}</div>}
    </div>
  );
}

function StudentExperience({ view, setView, courses, onNotify, addTicket, monthlyFee }: { view: StudentView; setView: (view: View) => void; courses: Course[]; onNotify: (message: string) => void; addTicket: (ticket: Omit<Ticket, "id" | "status" | "created">) => void; monthlyFee: number }) {
  if (view === "courses") return <StudentCourses courses={courses} onNotify={onNotify} />;
  if (view === "sessions") return <LiveSessions onNotify={onNotify} />;
  if (view === "billing") return <StudentBilling monthlyFee={monthlyFee} onNotify={onNotify} />;
  if (view === "help") return <HelpCenter addTicket={addTicket} onNotify={onNotify} />;
  return <Page>
    <PageHeader eyebrow="Tu espacio de aprendizaje" title="Good morning, Sofía." text="Continúa tu curso, revisa tu próxima clase y mantén tu aprendizaje al día." />
    <div className={styles.paymentReminder}><span className={styles.reminderIcon}><Icon name="card" /></span><div><strong>Tu próximo pago es el 15 de octubre</strong><p>Recuerda mantener tu mensualidad al día para conservar el acceso a tus cursos.</p></div><button onClick={() => setView("billing")}>Ver detalles</button></div>
    <section className={styles.studentHero}><div><span className={styles.eyebrowLight}>Continúa donde quedaste</span><h2>English Foundations A1</h2><p>Unidad 4 · Daily routines and time expressions</p><div className={styles.heroProgress}><span style={{ width: "68%" }}></span></div><small>68% completado · 7 lecciones pendientes</small><button onClick={() => onNotify("Abriendo la siguiente lección")}>Continuar curso <Icon name="play" /></button></div><div className={styles.heroWord}><span>Today&apos;s word</span><strong>progress</strong><p>/ˈprɑː.ɡres/</p><small>movement toward a better or more complete state</small></div></section>
    <section className={styles.sectionBlock}><SectionHeading title="Mis cursos" text="Aprende a tu ritmo entre cada clase en vivo." action="Ver todos" onAction={() => setView("courses")} /><div className={styles.courseGrid}>{courses.filter((course) => course.published).slice(0, 3).map((course) => <CourseCard key={course.id} course={course} student onOpen={() => onNotify("Abriendo " + course.title)} />)}</div></section>
    <section className={styles.homeColumns}><div className={styles.panel}><SectionHeading title="Próxima clase en vivo" text="Sesión guiada con tu instructor." /><div className={styles.nextSession}><div className={styles.dateCard}><strong>09</strong><span>OCT</span></div><div><span className={styles.liveLabel}>EN VIVO</span><h3>Conversation Lab: Daily routines</h3><p>Jueves · 6:30 p. m. · 60 minutos</p><small>Instructor: Andrea López</small></div><button onClick={() => onNotify("El enlace se habilitará 10 minutos antes")}>Ver clase</button></div></div><div className={styles.panel}><SectionHeading title="Tu semana" text="Actividad registrada en la plataforma." /><div className={styles.weekStats}><div><strong>3</strong><span>Lecciones</span></div><div><strong>84%</strong><span>Quiz</span></div><div><strong>2h</strong><span>Estudio</span></div></div></div></section>
  </Page>;
}

function StudentCourses({ courses, onNotify }: { courses: Course[]; onNotify: (message: string) => void }) {
  return <Page><PageHeader eyebrow="Biblioteca personal" title="Mis cursos" text="Todo tu contenido, progreso y próximas actividades en un solo lugar." /><div className={styles.filterRow}><button className={styles.filterActive}>Todos</button><button>En progreso</button><button>Completados</button><button>Guardados</button></div><div className={styles.courseGridLarge}>{courses.filter((course) => course.published).map((course) => <CourseCard key={course.id} course={course} student onOpen={() => onNotify("Abriendo " + course.title)} />)}</div><div className={styles.panel + " " + styles.certificatePanel}><div><span className={styles.iconTile}><Icon name="award" /></span><strong>Tu próximo certificado está cerca</strong><p>Completa English Foundations A1 y obtén tu certificado digital de Level Up.</p></div><button className={styles.secondaryButton} onClick={() => onNotify("Debes completar todas las lecciones y la evaluación final")}>Ver requisitos</button></div></Page>;
}

function LiveSessions({ onNotify }: { onNotify: (message: string) => void }) {
  const sessions = [
    { day: "09", month: "OCT", title: "Conversation Lab: Daily routines", time: "6:30 p. m.", course: "English Foundations A1", status: "Próxima" },
    { day: "13", month: "OCT", title: "Grammar Clinic: Present simple", time: "6:30 p. m.", course: "English Foundations A1", status: "Programada" },
    { day: "16", month: "OCT", title: "Listening Practice: At the café", time: "6:30 p. m.", course: "English Foundations A1", status: "Programada" },
  ];
  return <Page><PageHeader eyebrow="Modelo híbrido" title="Clases en vivo" text="Practica con tu instructor y usa el contenido del portal para prepararte y repasar." /><div className={styles.sessionList}>{sessions.map((session) => <article key={session.title} className={styles.sessionCard}><div className={styles.dateCard}><strong>{session.day}</strong><span>{session.month}</span></div><div><span className={styles.statusTag}>{session.status}</span><h3>{session.title}</h3><p>{session.course} · {session.time} · 60 minutos</p></div><div className={styles.sessionActions}><button onClick={() => onNotify("Clase agregada a tu calendario")}>Añadir al calendario</button><button className={styles.primaryButton} onClick={() => onNotify("El enlace se habilitará antes de la clase")}>Unirme</button></div></article>)}</div><div className={styles.infoBanner}><Icon name="video" /><div><strong>¿Cómo funcionan las clases híbridas?</strong><p>Completa la preparación indicada antes de la sesión. En vivo practicarás con tu instructor; luego encontrarás la grabación o material de repaso en el curso.</p></div></div></Page>;
}

function StudentBilling({ monthlyFee, onNotify }: { monthlyFee: number; onNotify: (message: string) => void }) {
  return <Page><PageHeader eyebrow="Cuenta y acceso" title="Pagos" text="Consulta tu mensualidad, fecha de cobro y comprobantes." /><div className={styles.billingGrid}><section className={styles.paymentCard}><span>Próximo pago</span><strong>{formatCurrency(monthlyFee)}</strong><p>Fecha límite: 15 de octubre de 2026</p><div className={styles.paymentStatus}><Icon name="check" />Cuenta al día</div><button className={styles.primaryButton} onClick={() => onNotify("El pago en línea se habilitará en una próxima etapa")}>Ver instrucciones de pago</button></section><section className={styles.panel}><SectionHeading title="Tu acceso" text="Estado de la membresía de Level Up." /><dl className={styles.definitionList}><div><dt>Estado</dt><dd><span className={styles.successPill}>Activo</span></dd></div><div><dt>Plan</dt><dd>English A1 · Mensual</dd></div><div><dt>Próxima fecha</dt><dd>15 oct. 2026</dd></div><div><dt>Recordatorio</dt><dd>5 días antes</dd></div></dl></section></div><section className={styles.panel + " " + styles.historyPanel}><SectionHeading title="Historial de pagos" text="Comprobantes registrados por la academia." /><div className={styles.simpleTable}><div className={styles.tableHead}><span>Periodo</span><span>Fecha</span><span>Monto</span><span>Estado</span></div><div><span>Octubre 2026</span><span>02 oct. 2026</span><span>{formatCurrency(monthlyFee)}</span><span className={styles.successPill}>Pagado</span></div><div><span>Septiembre 2026</span><span>01 sep. 2026</span><span>{formatCurrency(monthlyFee)}</span><span className={styles.successPill}>Pagado</span></div></div></section></Page>;
}

function HelpCenter({ addTicket, onNotify }: { addTicket: (ticket: Omit<Ticket, "id" | "status" | "created">) => void; onNotify: (message: string) => void }) {
  const [category, setCategory] = useState("Acceso");
  const [detail, setDetail] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (!detail.trim()) return; addTicket({ source: "Estudiante", person: "Sofía Rojas", title: category, detail, priority: "Media" }); setDetail(""); }
  return <Page><PageHeader eyebrow="Centro de ayuda" title="¿Cómo podemos ayudarte?" text="Encuentra respuestas o envía una solicitud al equipo de Level Up." /><label className={styles.helpSearch}><Icon name="search" /><input placeholder="Buscar una respuesta..." /><button onClick={() => onNotify("Mostrando resultados de ayuda")}>Buscar</button></label><div className={styles.helpGrid}>{[["lock", "Acceso y contraseña", "Recuperar contraseña, iniciar sesión y mantener tu cuenta segura."], ["book", "Cursos y progreso", "Lecciones, evaluaciones, certificados y avance."], ["calendar", "Clases en vivo", "Horarios, enlaces y preparación para sesiones."], ["card", "Pagos", "Fechas de cobro, comprobantes y estado de acceso."]].map(([icon, title, text]) => <button key={title} onClick={() => onNotify("Abriendo ayuda: " + title)}><Icon name={icon} /><strong>{title}</strong><span>{text}</span></button>)}</div><form className={styles.supportForm} onSubmit={submit}><div><span className={styles.eyebrow}>¿No encontraste la respuesta?</span><h2>Enviar una solicitud</h2><p>La academia podrá escalarla a CORVEN si es un problema técnico.</p></div><label>Tipo de ayuda<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Acceso</option><option>Curso o lección</option><option>Clase en vivo</option><option>Pago</option><option>Error técnico</option></select></label><label>¿Qué necesitas?<textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Cuéntanos qué ocurrió..." required /></label><button className={styles.primaryButton} type="submit">Enviar solicitud</button></form></Page>;
}

function AdminExperience(props: {
  view: AdminView; setView: (view: View) => void; students: Student[]; courses: Course[]; tickets: Ticket[]; activeCount: number; paidCount: number; collectedRevenue: number; projectedRevenue: number; monthlyFee: number; setMonthlyFee: (value: number) => void; updateStudent: (id: number, changes: Partial<Student>) => void; setCourses: React.Dispatch<React.SetStateAction<Course[]>>; brand: { primary: string; secondary: string; accent: string }; setBrand: React.Dispatch<React.SetStateAction<{ primary: string; secondary: string; accent: string }>>; logoUrl: string | null; handleLogo: (file?: File) => void; addTicket: (ticket: Omit<Ticket, "id" | "status" | "created">) => void; onNotify: (message: string) => void;
}) {
  if (props.view === "students") return <StudentManagement students={props.students} updateStudent={props.updateStudent} onNotify={props.onNotify} />;
  if (props.view === "courses") return <CourseStudio courses={props.courses} setCourses={props.setCourses} onNotify={props.onNotify} />;
  if (props.view === "income") return <IncomeDashboard students={props.students} monthlyFee={props.monthlyFee} setMonthlyFee={props.setMonthlyFee} collectedRevenue={props.collectedRevenue} projectedRevenue={props.projectedRevenue} onNotify={props.onNotify} />;
  if (props.view === "brand") return <BrandStudio brand={props.brand} setBrand={props.setBrand} logoUrl={props.logoUrl} handleLogo={props.handleLogo} onNotify={props.onNotify} />;
  if (props.view === "support") return <AdminSupport tickets={props.tickets} addTicket={props.addTicket} />;
  return <Page><PageHeader eyebrow="Administración de la academia" title="Buenos días, Andrea." text="Este es el estado de Level Up hoy." action={<button className={styles.primaryButton} onClick={() => props.setView("students")}>+ Agregar estudiante</button>} /><KpiGrid items={[{ icon: "users", label: "Estudiantes activos", value: String(props.activeCount), detail: "de 10 matriculados", tone: "purple" }, { icon: "money", label: "Ingresos recibidos", value: formatCurrency(props.collectedRevenue), detail: props.paidCount + " pagos registrados", tone: "green" }, { icon: "book", label: "Cursos publicados", value: String(props.courses.filter((course) => course.published).length), detail: "1 curso en borrador", tone: "orange" }, { icon: "support", label: "Soporte pendiente", value: "1", detail: "Ticket de alta prioridad", tone: "red" }]} /><div className={styles.adminOverviewGrid}><section className={styles.panel}><SectionHeading title="Ingresos del periodo" text="Pagos registrados durante los últimos seis meses." action="Ver ingresos" onAction={() => props.setView("income")} /><RevenueChart values={[185, 210, 245, 280, 315, Math.round(props.collectedRevenue / 1000)]} /></section><section className={styles.panel}><SectionHeading title="Próximas clases" text="Sesiones híbridas programadas." action="Gestionar" onAction={() => props.onNotify("Abriendo calendario de sesiones")} /><div className={styles.compactSessions}><div><span>09 OCT</span><p><strong>Conversation Lab</strong><small>6:30 p. m. · A1 · 4 estudiantes</small></p></div><div><span>13 OCT</span><p><strong>Grammar Clinic</strong><small>6:30 p. m. · A1 · 4 estudiantes</small></p></div><div><span>15 OCT</span><p><strong>Speaking Practice</strong><small>7:00 p. m. · A2 · 4 estudiantes</small></p></div></div></section></div><section className={styles.panel + " " + styles.dashboardTable}><SectionHeading title="Atención requerida" text="Estudiantes con pago pendiente, acceso suspendido o bajo progreso." action="Ver estudiantes" onAction={() => props.setView("students")} /><StudentTable students={props.students.filter((student) => student.payment !== "Pagado" || !student.active)} updateStudent={props.updateStudent} onNotify={props.onNotify} compact /></section></Page>;
}

function StudentManagement({ students, updateStudent, onNotify }: { students: Student[]; updateStudent: (id: number, changes: Partial<Student>) => void; onNotify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const filtered = students.filter((student) => (student.name + student.email).toLowerCase().includes(query.toLowerCase()));
  return <Page><PageHeader eyebrow="Usuarios y accesos" title="Estudiantes" text="Administra matrículas, contraseñas, pagos y acceso al contenido." action={<button className={styles.primaryButton} onClick={() => onNotify("Formulario para invitar estudiante")}>+ Invitar estudiante</button>} /><div className={styles.toolbar}><label><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o correo" /></label><button onClick={() => onNotify("Filtros de estudiantes")}>Filtrar</button><button onClick={() => onNotify("Exportando estudiantes a CSV")}>Exportar</button></div><section className={styles.panel + " " + styles.tablePanel}><StudentTable students={filtered} updateStudent={updateStudent} onNotify={onNotify} /></section><div className={styles.accessNote}><Icon name="lock" /><div><strong>Control de acceso por pago</strong><p>Desactivar un estudiante bloquea el ingreso al contenido, pero conserva su progreso, notas e historial. Al reactivarlo continúa donde quedó.</p></div></div></Page>;
}

function StudentTable({ students, updateStudent, onNotify, compact = false }: { students: Student[]; updateStudent: (id: number, changes: Partial<Student>) => void; onNotify: (message: string) => void; compact?: boolean }) {
  return <div className={styles.tableScroll}><table className={styles.dataTable}><thead><tr><th>Estudiante</th><th>Nivel</th><th>Progreso</th><th>Pago</th>{!compact && <th>Próximo cobro</th>}<th>Acceso</th>{!compact && <th>Cuenta</th>}</tr></thead><tbody>{students.map((student) => <tr key={student.id}><td><div className={styles.studentCell}><span>{student.initials}</span><p><strong>{student.name}</strong><small>{student.email}</small></p></div></td><td><span className={styles.levelPill}>{student.level}</span></td><td><div className={styles.miniProgress}><span style={{ width: student.progress + "%" }}></span></div><small>{student.progress}%</small></td><td><select className={styles.statusSelect} value={student.payment} onChange={(event) => updateStudent(student.id, { payment: event.target.value as Student["payment"] })}><option>Pagado</option><option>Pendiente</option><option>Vencido</option></select></td>{!compact && <td><input className={styles.dateInput} type="date" value={student.dueDate} onChange={(event) => { updateStudent(student.id, { dueDate: event.target.value }); onNotify("Fecha de cobro actualizada para " + student.name); }} /></td>}<td><button className={student.active ? styles.activeToggle : styles.inactiveToggle} onClick={() => { updateStudent(student.id, { active: !student.active }); onNotify((student.active ? "Acceso suspendido para " : "Acceso reactivado para ") + student.name); }}><i></i>{student.active ? "Activo" : "Suspendido"}</button></td>{!compact && <td><button className={styles.iconButton} title="Restablecer contraseña" onClick={() => onNotify("Enlace de contraseña enviado a " + student.email)}><Icon name="lock" /></button><button className={styles.iconButton} title="Reenviar acceso" onClick={() => onNotify("Acceso reenviado a " + student.email)}><Icon name="send" /></button></td>}</tr>)}</tbody></table></div>;
}

function CourseStudio({ courses, setCourses, onNotify }: { courses: Course[]; setCourses: React.Dispatch<React.SetStateAction<Course[]>>; onNotify: (message: string) => void }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("A1");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  function createCourse(event: FormEvent) { event.preventDefault(); if (!title.trim()) return; setCourses((current) => [...current, { id: Date.now(), title, level: level + " · Nuevo curso", description: description || "Curso creado por Level Up.", progress: 0, lessons: 1, duration: "Por definir", students: 0, youtubeUrl, color: "#6d28d9", published: false }]); setTitle(""); setYoutubeUrl(""); setDescription(""); setShowBuilder(false); onNotify("Curso creado como borrador"); }
  return <Page><PageHeader eyebrow="Course Studio" title="Cursos y contenido" text="Crea experiencias híbridas con lecciones, enlaces de YouTube, material y evaluaciones." action={<button className={styles.primaryButton} onClick={() => setShowBuilder(!showBuilder)}>+ Crear curso</button>} />{showBuilder && <form className={styles.builderPanel} onSubmit={createCourse}><div className={styles.builderHeader}><div><span className={styles.eyebrow}>Nuevo curso</span><h2>Información inicial</h2></div><button type="button" onClick={() => setShowBuilder(false)}>×</button></div><div className={styles.formGrid}><label>Nombre del curso<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Business English B1" required /></label><label>Nivel<select value={level} onChange={(event) => setLevel(event.target.value)}><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select></label><label className={styles.fullField}>Descripción<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="¿Qué logrará el estudiante?" /></label><label className={styles.fullField}>Primera clase en YouTube<input type="url" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." /><small>Por ahora guardaremos enlaces de YouTube; más adelante habilitaremos almacenamiento propio.</small></label></div><div className={styles.builderActions}><button type="button" onClick={() => setShowBuilder(false)}>Cancelar</button><button className={styles.primaryButton} type="submit">Crear borrador</button></div></form>}<div className={styles.courseAdminGrid}>{courses.map((course) => <article key={course.id} className={styles.adminCourseCard}><div className={styles.courseCover} style={{ background: "linear-gradient(135deg, " + course.color + ", #111827)" }}><span>{course.level.split(" · ")[0]}</span><Icon name="book" /></div><div><span className={course.published ? styles.successPill : styles.draftPill}>{course.published ? "Publicado" : "Borrador"}</span><h3>{course.title}</h3><p>{course.lessons} lecciones · {course.duration} · {course.students} estudiantes</p><div className={styles.cardActions}><button onClick={() => onNotify("Abriendo editor de " + course.title)}>Editar contenido</button><button onClick={() => { setCourses((current) => current.map((item) => item.id === course.id ? { ...item, published: !item.published } : item)); onNotify(course.published ? "Curso movido a borrador" : "Curso publicado"); }}>{course.published ? "Ocultar" : "Publicar"}</button></div></div></article>)}</div><section className={styles.panel + " " + styles.youtubeGuide}><div className={styles.youtubeIcon}><Icon name="video" /></div><div><strong>Contenido en YouTube</strong><p>Pega el enlace público o no listado. El estudiante verá la clase dentro de su curso sin salir del portal.</p></div><button className={styles.secondaryButton} onClick={() => onNotify("Guía de video abierta")}>Ver guía</button></section></Page>;
}

function IncomeDashboard({ students, monthlyFee, setMonthlyFee, collectedRevenue, projectedRevenue, onNotify }: { students: Student[]; monthlyFee: number; setMonthlyFee: (value: number) => void; collectedRevenue: number; projectedRevenue: number; onNotify: (message: string) => void }) {
  return <Page><PageHeader eyebrow="Gestión financiera" title="Ingresos y cobros" text="Visualiza mensualidades, pagos pendientes y fechas de cobro." action={<button className={styles.primaryButton} onClick={() => onNotify("Reporte financiero exportado")}>Exportar reporte</button>} /><div className={styles.feeControl}><div><span>Mensualidad por estudiante</span><strong>{formatCurrency(monthlyFee)}</strong></div><label>Editar monto<input type="number" min="0" step="1000" value={monthlyFee} onChange={(event) => setMonthlyFee(Number(event.target.value))} /></label></div><KpiGrid items={[{ icon: "money", label: "Ingresos recibidos", value: formatCurrency(collectedRevenue), detail: "Mes actual", tone: "green" }, { icon: "chart", label: "Ingreso proyectado", value: formatCurrency(projectedRevenue), detail: "Si pagan los 10 estudiantes", tone: "purple" }, { icon: "clock", label: "Pendiente de cobro", value: formatCurrency(students.filter((student) => student.payment !== "Pagado").length * monthlyFee), detail: "3 mensualidades", tone: "orange" }, { icon: "lock", label: "Accesos suspendidos", value: String(students.filter((student) => !student.active).length), detail: "Por pago vencido", tone: "red" }]} /><div className={styles.incomeLayout}><section className={styles.panel}><SectionHeading title="Ingresos mensuales" text="Historial de pagos registrados." /><RevenueChart values={[185, 210, 245, 280, 315, Math.round(collectedRevenue / 1000)]} /></section><section className={styles.panel}><SectionHeading title="Distribución" text="Estado de las mensualidades." /><div className={styles.donutChart} style={{ background: "conic-gradient(var(--brand-primary) 0 70%, var(--brand-accent) 70% 90%, #ef4444 90% 100%)" }}><div><strong>70%</strong><span>cobrado</span></div></div><ul className={styles.legend}><li><i className={styles.legendPaid}></i>Pagado <strong>7</strong></li><li><i className={styles.legendPending}></i>Pendiente <strong>2</strong></li><li><i className={styles.legendLate}></i>Vencido <strong>1</strong></li></ul></section></div></Page>;
}

function BrandStudio({ brand, setBrand, logoUrl, handleLogo, onNotify }: { brand: { primary: string; secondary: string; accent: string }; setBrand: React.Dispatch<React.SetStateAction<{ primary: string; secondary: string; accent: string }>>; logoUrl: string | null; handleLogo: (file?: File) => void; onNotify: (message: string) => void }) {
  return <Page><PageHeader eyebrow="White label" title="Identidad visual" text="Adapta el portal a la marca de Level Up. CORVEN permanecerá discretamente como proveedor tecnológico." /><div className={styles.brandGrid}><section className={styles.panel}><SectionHeading title="Marca de la academia" text="Los cambios se muestran inmediatamente." /><div className={styles.logoUploader}><TenantMark logoUrl={logoUrl} large /><div><strong>Logo de Level Up</strong><p>PNG, JPG o SVG. Recomendado: fondo transparente.</p><label>Seleccionar logo<input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(event) => handleLogo(event.target.files?.[0])} /></label></div></div><div className={styles.colorControls}><ColorControl label="Color principal" value={brand.primary} onChange={(value) => setBrand((current) => ({ ...current, primary: value }))} /><ColorControl label="Color secundario" value={brand.secondary} onChange={(value) => setBrand((current) => ({ ...current, secondary: value }))} /><ColorControl label="Color de acento" value={brand.accent} onChange={(value) => setBrand((current) => ({ ...current, accent: value }))} /></div><button className={styles.primaryButton} onClick={() => onNotify("Identidad visual guardada")}>Guardar identidad</button></section><section className={styles.brandPreview}><span>Vista previa</span><div className={styles.previewWindow}><div className={styles.previewTop}><TenantMark logoUrl={logoUrl} /><strong>Level Up</strong><i></i></div><div className={styles.previewBody}><small>YOUR NEXT LESSON</small><h3>English Foundations</h3><p>Keep building your confidence.</p><button>Continue learning</button><div className={styles.previewCards}><span></span><span></span></div></div><div className={styles.previewPowered}>Powered by CORVEN</div></div></section></div></Page>;
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className={styles.colorControl}><span>{label}</span><div><input type="color" value={value} onChange={(event) => onChange(event.target.value)} /><input value={value.toUpperCase()} onChange={(event) => /^#[0-9A-Fa-f]{6}$/.test(event.target.value) && onChange(event.target.value)} /></div></label>;
}

function AdminSupport({ tickets, addTicket }: { tickets: Ticket[]; addTicket: (ticket: Omit<Ticket, "id" | "status" | "created">) => void }) {
  const [title, setTitle] = useState(""); const [detail, setDetail] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (!title.trim() || !detail.trim()) return; addTicket({ source: "Level Up", person: "Andrea · Administradora", title, detail, priority: "Alta" }); setTitle(""); setDetail(""); }
  return <Page><PageHeader eyebrow="Soporte técnico" title="Soporte CORVEN" text="Reporta errores de la plataforma y sigue la respuesta del owner." /><div className={styles.supportLayout}><form className={styles.panel + " " + styles.reportForm} onSubmit={submit}><SectionHeading title="Reportar un problema" text="Incluye los pasos que seguiste y qué esperabas que ocurriera." /><label>Asunto<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. No puedo publicar una lección" required /></label><label>Detalle<textarea value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Describe el error..." required /></label><label>Prioridad<select><option>Alta · Bloquea el trabajo</option><option>Media · Puedo continuar</option><option>Baja · Consulta o mejora</option></select></label><button className={styles.primaryButton} type="submit">Enviar a CORVEN</button></form><section className={styles.panel}><SectionHeading title="Mis solicitudes" text="Historial y estado de tus reportes." /><TicketList tickets={tickets.filter((ticket) => ticket.source === "Level Up")} /></section></div></Page>;
}

function OwnerExperience({ view, setView, students, courses, tickets, setTickets, collectedRevenue, onNotify }: { view: OwnerView; setView: (view: View) => void; students: Student[]; courses: Course[]; tickets: Ticket[]; setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>; collectedRevenue: number; onNotify: (message: string) => void }) {
  if (view === "tickets") return <OwnerTickets tickets={tickets} setTickets={setTickets} onNotify={onNotify} />;
  if (view === "academies") return <AcademiesView students={students} courses={courses} collectedRevenue={collectedRevenue} onNotify={onNotify} />;
  if (view === "activity") return <ActivityView />;
  return <Page><PageHeader eyebrow="CORVEN Learning Platform" title="Control de la plataforma" text="Supervisa academias, actividad, soporte y salud del servicio." action={<button className={styles.primaryButton} onClick={() => setView("tickets")}>Revisar tickets</button>} /><KpiGrid items={[{ icon: "school", label: "Academias activas", value: "1", detail: "Level Up · Piloto", tone: "purple" }, { icon: "users", label: "Usuarios totales", value: "12", detail: "10 estudiantes + 2 admins", tone: "green" }, { icon: "book", label: "Cursos", value: String(courses.length), detail: courses.filter((course) => course.published).length + " publicados", tone: "orange" }, { icon: "support", label: "Tickets abiertos", value: String(tickets.filter((ticket) => ticket.status !== "Respondido").length), detail: "1 de prioridad alta", tone: "red" }]} /><div className={styles.ownerGrid}><section className={styles.panel}><SectionHeading title="Level Up English Academy" text="Salud general del cliente piloto." action="Abrir academia" onAction={() => setView("academies")} /><div className={styles.healthHeader}><div className={styles.healthScore}>96<span>%</span></div><div><strong>Servicio saludable</strong><p>Última actividad: hoy, 9:42 a. m.</p></div></div><div className={styles.healthRows}><div><span>Base de datos</span><strong className={styles.online}>Operativa</strong></div><div><span>Autenticación</span><strong className={styles.online}>Operativa</strong></div><div><span>Contenido y enlaces</span><strong className={styles.warning}>1 advertencia</strong></div><div><span>Último respaldo</span><strong>Hoy · 3:00 a. m.</strong></div></div></section><section className={styles.panel}><SectionHeading title="Soporte reciente" text="Solicitudes que requieren seguimiento." action="Ver todos" onAction={() => setView("tickets")} /><TicketList tickets={tickets.slice(0, 3)} compact /></section></div><section className={styles.panel + " " + styles.ownerActions}><SectionHeading title="Acciones de owner" text="Herramientas de operación de CORVEN." /><div><button onClick={() => onNotify("Modo de soporte para Level Up")}><Icon name="school" /><span><strong>Acceder como soporte</strong><small>Revisar configuración del cliente</small></span></button><button onClick={() => onNotify("Revisión de seguridad iniciada")}><Icon name="lock" /><span><strong>Revisar accesos</strong><small>Roles y actividad reciente</small></span></button><button onClick={() => onNotify("Reporte de uso preparado")}><Icon name="chart" /><span><strong>Reporte de uso</strong><small>Actividad y adopción del portal</small></span></button></div></section></Page>;
}

function OwnerTickets({ tickets, setTickets, onNotify }: { tickets: Ticket[]; setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>; onNotify: (message: string) => void }) {
  const [selected, setSelected] = useState<string | null>(tickets[0]?.id ?? null); const [reply, setReply] = useState(""); const activeTicket = tickets.find((ticket) => ticket.id === selected);
  function sendReply() { if (!activeTicket || !reply.trim()) return; setTickets((current) => current.map((ticket) => ticket.id === activeTicket.id ? { ...ticket, reply, status: "Respondido" } : ticket)); setReply(""); onNotify("Respuesta enviada a " + activeTicket.source); }
  return <Page><PageHeader eyebrow="Mesa de soporte" title="Tickets de la plataforma" text="Recibe, prioriza y responde solicitudes de academias y estudiantes." /><div className={styles.ticketWorkspace}><div className={styles.ticketQueue}>{tickets.map((ticket) => <button key={ticket.id} className={selected === ticket.id ? styles.ticketSelected : ""} onClick={() => setSelected(ticket.id)}><div><span>{ticket.id}</span><small className={ticket.priority === "Alta" ? styles.priorityHigh : ""}>{ticket.priority}</small></div><strong>{ticket.title}</strong><p>{ticket.source} · {ticket.created}</p><em>{ticket.status}</em></button>)}</div>{activeTicket && <section className={styles.ticketDetail}><div className={styles.ticketDetailTop}><div><span>{activeTicket.id} · {activeTicket.source}</span><h2>{activeTicket.title}</h2><p>{activeTicket.person} · {activeTicket.created}</p></div><span className={activeTicket.priority === "Alta" ? styles.priorityHighPill : styles.statusTag}>{activeTicket.priority}</span></div><div className={styles.messageBubble}><strong>{activeTicket.person}</strong><p>{activeTicket.detail}</p></div>{activeTicket.reply && <div className={styles.ownerReply}><strong>CORVEN Support</strong><p>{activeTicket.reply}</p></div>}<label className={styles.replyBox}>Responder<textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Escribe una respuesta clara para el cliente..." /><div><button onClick={() => { setTickets((current) => current.map((ticket) => ticket.id === activeTicket.id ? { ...ticket, status: "En proceso" } : ticket)); onNotify("Ticket marcado en proceso"); }}>Marcar en proceso</button><button className={styles.primaryButton} onClick={sendReply}>Enviar respuesta</button></div></label></section>}</div></Page>;
}

function AcademiesView({ students, courses, collectedRevenue, onNotify }: { students: Student[]; courses: Course[]; collectedRevenue: number; onNotify: (message: string) => void }) {
  return <Page><PageHeader eyebrow="Clientes" title="Academias" text="Administra organizaciones, planes y consumo de la plataforma." action={<button className={styles.primaryButton} onClick={() => onNotify("Formulario de nueva academia")}>+ Nueva academia</button>} /><article className={styles.academyCard}><div className={styles.academyIdentity}><TenantMark /><div><span>Cliente piloto</span><h2>Level Up English Academy</h2><p>Modalidad híbrida · Costa Rica</p></div></div><div className={styles.academyMetrics}><div><span>Estudiantes</span><strong>{students.length}</strong></div><div><span>Cursos</span><strong>{courses.length}</strong></div><div><span>Actividad</span><strong>83%</strong></div><div><span>Ingresos gestionados</span><strong>{formatCurrency(collectedRevenue)}</strong></div></div><div className={styles.academyFooter}><span><i></i> Servicio activo</span><small>Próxima revisión: 14 oct. 2026</small><button onClick={() => onNotify("Abriendo configuración de Level Up")}>Administrar →</button></div></article></Page>;
}

function ActivityView() {
  const events = ["Andrea publicó English Foundations A1", "Sofía completó la lección Daily routines", "CORVEN recibió el ticket SUP-1042", "José fue suspendido por pago vencido", "Andrea actualizó la fecha de cobro de María", "Level Up cambió el color principal de su portal"];
  return <Page><PageHeader eyebrow="Auditoría" title="Actividad de la plataforma" text="Registro de cambios importantes realizados por CORVEN, administradores y estudiantes." /><section className={styles.panel}><div className={styles.activityList}>{events.map((event, index) => <div key={event}><span><Icon name={index % 2 ? "users" : "clock"} /></span><p><strong>{event}</strong><small>{index < 2 ? "Hoy" : "Ayer"} · {9 - index}:2{index} a. m.</small></p></div>)}</div></section></Page>;
}

function CourseCard({ course, student, onOpen }: { course: Course; student?: boolean; onOpen: () => void }) {
  return <article className={styles.courseCard}><button className={styles.courseImage} style={{ background: "linear-gradient(135deg, " + course.color + ", #101827)" }} onClick={onOpen}><span>{course.level.split(" · ")[0]}</span><div><Icon name="play" /></div><small>LEVEL UP</small></button><div className={styles.courseBody}><span>{course.level}</span><h3>{course.title}</h3><p>{course.description}</p><div className={styles.courseMeta}><span>{course.lessons} lecciones</span><span>{course.duration}</span></div>{student && <><div className={styles.courseProgress}><span style={{ width: course.progress + "%" }}></span></div><small>{course.progress}% completado</small></>}</div></article>;
}

function TicketList({ tickets, compact = false }: { tickets: Ticket[]; compact?: boolean }) {
  if (!tickets.length) return <div className={styles.emptyState}><Icon name="check" /><strong>No hay solicitudes pendientes</strong></div>;
  return <div className={styles.ticketList}>{tickets.map((ticket) => <div key={ticket.id}><span className={ticket.priority === "Alta" ? styles.ticketHighIcon : styles.ticketIcon}><Icon name="support" /></span><p><strong>{ticket.title}</strong><small>{ticket.id} · {ticket.created}</small>{!compact && <em>{ticket.detail}</em>}</p><span className={ticket.status === "Respondido" ? styles.successPill : styles.statusTag}>{ticket.status}</span></div>)}</div>;
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
  if (logoUrl) return <span className={large ? styles.tenantLogoLarge : styles.tenantLogo}><Image src={logoUrl} alt="Logo de Level Up" fill unoptimized /></span>;
  return <span className={large ? styles.tenantLogoLarge : styles.tenantLogo}>LU</span>;
}

function PoweredBy() { return <div className={styles.poweredBy}><span>Powered by</span><Image src="/brand/corven-imagotype-purple.png" alt="CORVEN" width={360} height={120} /></div>; }
function formatCurrency(value: number) { return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(value); }

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>, users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2"/><path d="M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 4v2"/></>, book: <><path d="M4 5a3 3 0 0 1 3-2h5v16H7a3 3 0 0 0-3 2Z"/><path d="M20 5a3 3 0 0 0-3-2h-5v16h5a3 3 0 0 1 3 2Z"/></>, chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, award: <><circle cx="12" cy="9" r="6"/><path d="m8 14-1 7 5-3 5 3-1-7"/></>, search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>, card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>, help: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.4 2c-.8.5-1.2 1-1.2 2M12 17h.01"/></>, money: <><rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3"/><path d="M7 9H6v1M17 16h1v-1"/></>, palette: <><path d="M12 3a9 9 0 1 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3a6 6 0 0 0 0-12Z"/><circle cx="7.5" cy="10" r=".5" fill="currentColor"/><circle cx="9.5" cy="6.5" r=".5" fill="currentColor"/></>, support: <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v5H5a1 1 0 0 1-1-1ZM20 14h-3v5h2a1 1 0 0 0 1-1ZM17 19c0 2-2 2-4 2"/></>, school: <><path d="m3 10 9-5 9 5-9 5Z"/><path d="M7 13v4c3 2 7 2 10 0v-4M21 10v6"/></>, bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M10 19h4"/></>, lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>, video: <><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2Z"/></>, play: <path d="m9 7 8 5-8 5Z"/>, check: <path d="m5 12 4 4L19 6"/>, send: <><path d="m3 11 18-8-8 18-2-7Z"/><path d="m11 14 4-4"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] ?? paths.home}</svg>;
}
