"use client";

import { useState } from "react";

import styles from "./learning-demo.module.css";

type Role = "learner" | "manager" | "admin";
type LearnerView = "dashboard" | "course" | "quiz";

const learningPath = [
  { title: "Bienvenida a Nova Services", meta: "Completado · 8 min", status: "done" },
  { title: "Cultura y forma de trabajar", meta: "En progreso · 12 min", status: "active" },
  { title: "Servicio que crea confianza", meta: "Pendiente · 15 min", status: "pending" },
  { title: "Procedimiento de atención", meta: "Pendiente · 10 min", status: "pending" },
] as const;

const employees = [
  { initials: "AM", name: "Ana Méndez", team: "Servicio", progress: 100, state: "Completado" },
  { initials: "DL", name: "Daniel López", team: "Operaciones", progress: 76, state: "En progreso" },
  { initials: "SR", name: "Sofía Rojas", team: "Servicio", progress: 42, state: "En progreso" },
  { initials: "JV", name: "José Vargas", team: "Operaciones", progress: 0, state: "No iniciado" },
] as const;

const navItems = {
  learner: ["Mi aprendizaje", "Mis certificados", "Biblioteca", "Ayuda"],
  manager: ["Resumen del equipo", "Colaboradores", "Asignaciones", "Reportes"],
  admin: ["Panel general", "Usuarios", "Cursos", "Currículas", "Configuración"],
} as const;

export function LearningDemo() {
  const [role, setRole] = useState<Role>("learner");
  const [learnerView, setLearnerView] = useState<LearnerView>("dashboard");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<"correct" | "incorrect" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function changeRole(nextRole: Role) {
    setRole(nextRole);
    setLearnerView("dashboard");
    setSelectedAnswer(null);
    setQuizResult(null);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function submitQuiz() {
    if (!selectedAnswer) return;
    setQuizResult(selectedAnswer === "confirmar" ? "correct" : "incorrect");
  }

  return (
    <div className={styles.demoShell}>
      <header className={styles.topbar}>
        <div className={styles.productBrand}>
          <span className={styles.corvenMark}>CORVEN<span>.</span></span>
          <span className={styles.productName}>Learning</span>
        </div>

        <div className={styles.topbarTools}>
          <span className={styles.demoBadge}>Entorno demostrativo</span>
          <div className={styles.roleSwitch} aria-label="Cambiar perspectiva del demo">
            <button className={role === "learner" ? styles.roleActive : ""} onClick={() => changeRole("learner")}>Empleado</button>
            <button className={role === "manager" ? styles.roleActive : ""} onClick={() => changeRole("manager")}>Supervisor</button>
            <button className={role === "admin" ? styles.roleActive : ""} onClick={() => changeRole("admin")}>Administrador</button>
          </div>
          <div className={styles.avatar} aria-label="Cuenta demostrativa">MC</div>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.tenant}>
            <span className={styles.tenantLogo}>N</span>
            <div><small>Academia corporativa</small><strong>Nova Services</strong></div>
          </div>

          <nav className={styles.sideNav} aria-label="Navegación del demo">
            {navItems[role].map((item, index) => (
              <button className={index === 0 ? styles.navActive : ""} key={item} onClick={() => index > 0 && showToast(`${item}: disponible en la siguiente versión del demo`)}>
                <Icon name={index === 0 ? "home" : index === 1 ? "users" : index === 2 ? "book" : "chart"} />
                {item}
              </button>
            ))}
          </nav>

          <div className={styles.sidebarNote}>
            <span>Soporte administrado</span>
            <strong>Contenido y plataforma siempre actualizados.</strong>
            <button onClick={() => showToast("Solicitud de soporte simulada")}>Solicitar ayuda</button>
          </div>
        </aside>

        <main className={styles.mainArea}>
          {role === "learner" && learnerView === "dashboard" && <LearnerDashboard onContinue={() => setLearnerView("course")} onNotify={showToast} />}
          {role === "learner" && learnerView === "course" && <CourseView onBack={() => setLearnerView("dashboard")} onQuiz={() => setLearnerView("quiz")} />}
          {role === "learner" && learnerView === "quiz" && (
            <QuizView
              selectedAnswer={selectedAnswer}
              result={quizResult}
              onSelect={(value) => { setSelectedAnswer(value); setQuizResult(null); }}
              onSubmit={submitQuiz}
              onBack={() => setLearnerView("course")}
            />
          )}
          {role === "manager" && <ManagerDashboard onNotify={showToast} />}
          {role === "admin" && <AdminDashboard onNotify={showToast} />}
        </main>
      </div>

      {toast && <div className={styles.toast} role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}

function LearnerDashboard({ onContinue, onNotify }: { onContinue: () => void; onNotify: (message: string) => void }) {
  return (
    <div className={styles.pageContent}>
      <PageHeader eyebrow="Mi aprendizaje" title="Hola, María. Continuemos avanzando." text="Tu ruta de inducción está al día. Completa la siguiente lección para mantener el ritmo." />

      <section className={styles.learnerSummary}>
        <div className={styles.progressCard}>
          <div className={styles.progressRing} aria-label="62 por ciento completado"><div><strong>62%</strong><span>completado</span></div></div>
          <div><span className={styles.cardLabel}>Ruta activa</span><h2>Inducción Nova 2026</h2><p>2 de 4 cursos en progreso</p><button className={styles.primaryButton} onClick={onContinue}>Continuar aprendizaje <span>→</span></button></div>
        </div>
        <div className={styles.metricCard}><span className={styles.metricIcon}><Icon name="clock" /></span><small>Tiempo invertido</small><strong>1 h 24 min</strong><p>Esta semana</p></div>
        <div className={styles.metricCard}><span className={`${styles.metricIcon} ${styles.metricIconOrange}`}><Icon name="award" /></span><small>Certificados</small><strong>2</strong><p>Disponibles para descargar</p></div>
      </section>

      <section className={styles.twoColumns}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><div><span className={styles.cardLabel}>Currícula asignada</span><h2>Tu ruta de inducción</h2></div><span className={styles.panelMeta}>62% completado</span></div>
          <div className={styles.pathList}>
            {learningPath.map((item, index) => (
              <button key={item.title} className={`${styles.pathItem} ${item.status === "active" ? styles.pathActive : ""}`} onClick={() => item.status === "active" ? onContinue() : onNotify(item.status === "done" ? "Curso completado" : "Completa primero el curso anterior")}>
                <span className={`${styles.pathNumber} ${item.status === "done" ? styles.pathDone : ""}`}>{item.status === "done" ? "✓" : index + 1}</span>
                <span><strong>{item.title}</strong><small>{item.meta}</small></span>
                <span className={styles.pathArrow}>→</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}><div><span className={styles.cardLabel}>Conocimiento disponible</span><h2>Centro de procesos</h2></div></div>
          <div className={styles.knowledgeBox}>
            <div className={styles.knowledgeVisual}><Icon name="search" /></div>
            <h3>Encuentra respuestas sin esperar</h3>
            <p>Consulta procedimientos, políticas y guías aprobadas por tu empresa.</p>
            <button className={styles.secondaryButton} onClick={() => onNotify("Búsqueda simulada: procedimiento de escalamiento")}>Explorar biblioteca</button>
          </div>
          <div className={styles.quickLinks}>
            <button onClick={() => onNotify("Abriendo guía de atención")}>Guía de atención <span>↗</span></button>
            <button onClick={() => onNotify("Abriendo política de escalamiento")}>Política de escalamiento <span>↗</span></button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CourseView({ onBack, onQuiz }: { onBack: () => void; onQuiz: () => void }) {
  return (
    <div className={styles.pageContent}>
      <button className={styles.backButton} onClick={onBack}>← Volver a mi aprendizaje</button>
      <div className={styles.courseLayout}>
        <article className={styles.lessonPanel}>
          <div className={styles.lessonHero}>
            <span>Curso 2 · Inducción Nova 2026</span>
            <h1>Cultura y forma de trabajar</h1>
            <p>Conoce los comportamientos que permiten colaborar, resolver y servir mejor.</p>
          </div>
          <div className={styles.videoPlaceholder}>
            <button aria-label="Reproducir video demostrativo"><span>▶</span></button>
            <div><strong>Cómo colaboramos en Nova</strong><small>Video demostrativo · 03:20</small></div>
          </div>
          <div className={styles.lessonCopy}>
            <span className={styles.cardLabel}>Lección 2 de 3</span>
            <h2>De los valores al comportamiento</h2>
            <p>Un valor solo produce resultados cuando se convierte en acciones observables. En Nova, colaborar significa compartir información a tiempo, confirmar acuerdos y pedir apoyo antes de que un bloqueo afecte al cliente.</p>
            <div className={styles.callout}><strong>Aplicación práctica</strong><p>Antes de cerrar una conversación, confirma responsable, acción y fecha. Esa pequeña disciplina evita retrabajo y crea confianza.</p></div>
            <button className={styles.primaryButton} onClick={onQuiz}>Realizar comprobación <span>→</span></button>
          </div>
        </article>

        <aside className={styles.courseOutline}>
          <span className={styles.cardLabel}>Contenido del curso</span>
          <h2>3 lecciones · 12 min</h2>
          <div className={styles.outlineProgress}><span style={{ width: "67%" }}></span></div>
          <ol>
            <li className={styles.outlineDone}><span>✓</span><div><strong>Nuestra promesa</strong><small>Completado</small></div></li>
            <li className={styles.outlineCurrent}><span>2</span><div><strong>Cómo colaboramos</strong><small>En reproducción</small></div></li>
            <li><span>3</span><div><strong>Decisiones con el cliente al centro</strong><small>4 min</small></div></li>
          </ol>
        </aside>
      </div>
    </div>
  );
}

function QuizView({ selectedAnswer, result, onSelect, onSubmit, onBack }: { selectedAnswer: string | null; result: "correct" | "incorrect" | null; onSelect: (value: string) => void; onSubmit: () => void; onBack: () => void }) {
  const answers = [
    ["esperar", "Esperar a la reunión semanal para comunicar el bloqueo"],
    ["confirmar", "Compartirlo a tiempo y confirmar responsable, acción y fecha"],
    ["resolver", "Resolverlo individualmente aunque afecte el plazo acordado"],
  ] as const;

  return (
    <div className={styles.quizPage}>
      <button className={styles.backButton} onClick={onBack}>← Volver a la lección</button>
      <div className={styles.quizCard}>
        <div className={styles.quizTop}><span>Comprobación de conocimiento</span><strong>Pregunta 1 de 1</strong></div>
        <div className={styles.quizProgress}><span></span></div>
        <div className={styles.quizBody}>
          <span className={styles.cardLabel}>Selecciona una respuesta</span>
          <h1>¿Qué comportamiento representa mejor la colaboración en Nova?</h1>
          <div className={styles.answerList}>
            {answers.map(([value, label]) => (
              <label className={selectedAnswer === value ? styles.answerSelected : ""} key={value}>
                <input type="radio" name="answer" value={value} checked={selectedAnswer === value} onChange={() => onSelect(value)} />
                <span>{String.fromCharCode(65 + answers.findIndex(([answer]) => answer === value))}</span>
                <strong>{label}</strong>
              </label>
            ))}
          </div>
          {result && <div className={result === "correct" ? styles.resultCorrect : styles.resultIncorrect}><strong>{result === "correct" ? "¡Correcto!" : "Revisa el concepto"}</strong><span>{result === "correct" ? "Comunicar temprano y cerrar acuerdos reduce bloqueos y retrabajo." : "La colaboración requiere comunicar el bloqueo antes de que afecte al cliente."}</span></div>}
          <button className={styles.primaryButton} disabled={!selectedAnswer} onClick={onSubmit}>Comprobar respuesta</button>
        </div>
      </div>
    </div>
  );
}

function ManagerDashboard({ onNotify }: { onNotify: (message: string) => void }) {
  return (
    <div className={styles.pageContent}>
      <PageHeader eyebrow="Resumen del equipo" title="Visibilidad para acompañar el aprendizaje." text="Revisa avance, resultados y riesgos de cumplimiento desde un mismo lugar." action={<button className={styles.primaryButton} onClick={() => onNotify("Reporte ejecutivo preparado para descarga")}>Descargar reporte</button>} />
      <section className={styles.kpiGrid}>
        <Kpi label="Personas asignadas" value="24" detail="3 departamentos" tone="purple" />
        <Kpi label="Completion rate" value="78%" detail="+12% vs. semana anterior" tone="blue" />
        <Kpi label="Promedio de evaluación" value="88%" detail="Meta: 80%" tone="orange" />
        <Kpi label="Requieren seguimiento" value="4" detail="2 próximos a vencer" tone="red" />
      </section>
      <section className={styles.managerGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><div><span className={styles.cardLabel}>Tendencia semanal</span><h2>Finalización de cursos</h2></div><span className={styles.panelMeta}>Últimas 6 semanas</span></div>
          <div className={styles.barChart} aria-label="Gráfico demostrativo de finalización semanal">
            {[38, 48, 45, 63, 70, 78].map((value, index) => <div key={value}><span style={{ height: `${value}%` }}><i>{value}%</i></span><small>S{index + 1}</small></div>)}
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><div><span className={styles.cardLabel}>Estado actual</span><h2>Distribución del equipo</h2></div></div>
          <div className={styles.donutWrap}>
            <div className={styles.donut}><div><strong>24</strong><span>personas</span></div></div>
            <ul><li><span className={styles.legendPurple}></span><strong>Completado</strong><small>14</small></li><li><span className={styles.legendBlue}></span><strong>En progreso</strong><small>6</small></li><li><span className={styles.legendOrange}></span><strong>No iniciado</strong><small>4</small></li></ul>
          </div>
        </div>
      </section>
      <EmployeeTable onNotify={onNotify} />
    </div>
  );
}

function AdminDashboard({ onNotify }: { onNotify: (message: string) => void }) {
  return (
    <div className={styles.pageContent}>
      <PageHeader eyebrow="Administración" title="Una academia que se mantiene bajo control." text="Gestiona usuarios, contenido y asignaciones sin perder visibilidad de la operación." action={<button className={styles.primaryButton} onClick={() => onNotify("Flujo para crear usuario simulado")}>+ Agregar usuario</button>} />
      <section className={styles.kpiGrid}>
        <Kpi label="Usuarios activos" value="48" detail="5 incorporados este mes" tone="purple" />
        <Kpi label="Cursos publicados" value="12" detail="3 en revisión" tone="blue" />
        <Kpi label="Currículas activas" value="4" detail="Por rol y departamento" tone="orange" />
        <Kpi label="Contenido por actualizar" value="2" detail="Revisión programada" tone="red" />
      </section>
      <section className={styles.adminGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><div><span className={styles.cardLabel}>Acciones frecuentes</span><h2>Administración rápida</h2></div></div>
          <div className={styles.actionGrid}>
            {[['users', 'Importar empleados', 'Carga masiva mediante plantilla'], ['book', 'Publicar un curso', 'Contenido, quiz y aprobación'], ['path', 'Crear currícula', 'Ruta por puesto o departamento'], ['chart', 'Programar reporte', 'Entrega automática al liderazgo']].map(([icon, title, text]) => (
              <button key={title} onClick={() => onNotify(`${title}: flujo simulado`)}><span><Icon name={icon} /></span><strong>{title}</strong><small>{text}</small></button>
            ))}
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><div><span className={styles.cardLabel}>Calendario de contenido</span><h2>Próximas revisiones</h2></div></div>
          <div className={styles.reviewList}>
            <div><span>08<br/><small>OCT</small></span><p><strong>Procedimiento de atención</strong><small>Revisión trimestral · Operaciones</small></p></div>
            <div><span>15<br/><small>OCT</small></span><p><strong>Inducción Nova 2026</strong><small>Actualización de políticas · RH</small></p></div>
            <div><span>02<br/><small>NOV</small></span><p><strong>Coaching para líderes</strong><small>Nueva versión · Liderazgo</small></p></div>
          </div>
        </div>
      </section>
      <EmployeeTable onNotify={onNotify} admin />
    </div>
  );
}

function EmployeeTable({ onNotify, admin = false }: { onNotify: (message: string) => void; admin?: boolean }) {
  return (
    <section className={`${styles.panel} ${styles.tablePanel}`}>
      <div className={styles.panelHeader}><div><span className={styles.cardLabel}>{admin ? "Actividad reciente" : "Detalle del equipo"}</span><h2>{admin ? "Usuarios y asignaciones" : "Progreso por persona"}</h2></div><button className={styles.textButton} onClick={() => onNotify("Vista completa disponible en el producto final")}>Ver todos →</button></div>
      <div className={styles.tableWrap}>
        <table><thead><tr><th>Colaborador</th><th>Departamento</th><th>Progreso</th><th>Estado</th><th></th></tr></thead><tbody>{employees.map((employee) => <tr key={employee.name}><td><span className={styles.personAvatar}>{employee.initials}</span><strong>{employee.name}</strong></td><td>{employee.team}</td><td><div className={styles.tableProgress}><span style={{ width: `${employee.progress}%` }}></span></div><small>{employee.progress}%</small></td><td><span className={`${styles.statusPill} ${employee.state === "Completado" ? styles.statusDone : employee.state === "No iniciado" ? styles.statusLate : ""}`}>{employee.state}</span></td><td><button className={styles.moreButton} onClick={() => onNotify(`Perfil de ${employee.name}`)}>•••</button></td></tr>)}</tbody></table>
      </div>
    </section>
  );
}

function PageHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) {
  return <header className={styles.pageHeader}><div><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</header>;
}

function Kpi({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "purple" | "blue" | "orange" | "red" }) {
  return <div className={`${styles.kpiCard} ${styles[`kpi_${tone}`]}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2"/><path d="M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 4v2"/></>,
    book: <><path d="M4 5a3 3 0 0 1 3-2h5v16H7a3 3 0 0 0-3 2Z"/><path d="M20 5a3 3 0 0 0-3-2h-5v16h5a3 3 0 0 1 3 2Z"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    award: <><circle cx="12" cy="9" r="6"/><path d="m8 14-1 7 5-3 5 3-1-7"/></>,
    search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
    path: <><circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18c7 0 3-12 10-12"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">{paths[name] ?? paths.home}</svg>;
}
