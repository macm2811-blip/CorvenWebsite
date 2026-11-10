const courses = [
  {
    id: "seguridad",
    title: "Seguridad en mantenimiento de elevadores",
    category: "Seguridad",
    level: "Obligatorio",
    duration: "1 h 45 min",
    lessons: 6,
    progress: 68,
    due: "18 nov",
    tone: "",
    icon: "🛡",
    description: "Controles esenciales antes, durante y después de una intervención de mantenimiento.",
  },
  {
    id: "fallas",
    title: "Diagnóstico básico de fallas",
    category: "Técnico",
    level: "Intermedio",
    duration: "2 h 20 min",
    lessons: 8,
    progress: 35,
    due: "27 nov",
    tone: "amber",
    icon: "⚙",
    description: "Método estructurado para identificar síntomas, recopilar evidencia y escalar fallas.",
  },
  {
    id: "servicio",
    title: "Servicio al cliente en campo",
    category: "Servicio",
    level: "Esencial",
    duration: "55 min",
    lessons: 5,
    progress: 0,
    due: "5 dic",
    tone: "green",
    icon: "◎",
    description: "Comunicación clara, manejo de expectativas y cierre profesional de cada visita.",
  },
  {
    id: "bloqueo",
    title: "Bloqueo y etiquetado de energías",
    category: "Seguridad",
    level: "Obligatorio",
    duration: "1 h 15 min",
    lessons: 5,
    progress: 100,
    due: "Completado",
    tone: "purple",
    icon: "⚡",
    description: "Secuencia de aislamiento, verificación y restitución segura de energías peligrosas.",
  },
  {
    id: "preventivo",
    title: "Fundamentos de mantenimiento preventivo",
    category: "Técnico",
    level: "Inicial",
    duration: "2 h",
    lessons: 7,
    progress: 0,
    due: "Disponible",
    tone: "green",
    icon: "⌁",
    description: "Principios para inspeccionar componentes, documentar hallazgos y prevenir fallas.",
  },
  {
    id: "supervision",
    title: "Supervisión segura de trabajos en sitio",
    category: "Liderazgo",
    level: "Supervisores",
    duration: "1 h 30 min",
    lessons: 6,
    progress: 0,
    due: "Disponible",
    tone: "amber",
    icon: "▦",
    description: "Preparación del sitio, coordinación del equipo y control de condiciones críticas.",
  },
];

const lessonData = [
  { title: "Bienvenida y objetivos", time: "5 min", complete: true },
  { title: "Identificación de peligros", time: "18 min", complete: true },
  { title: "Preparación del área de trabajo", time: "20 min", complete: true },
  { title: "Control de energías", time: "24 min", complete: true },
  { title: "Trabajo seguro en el foso", time: "23 min", complete: false },
  { title: "Evaluación final", time: "15 min", complete: false, quiz: true },
];

const main = document.getElementById("mainContent");
const sidebar = document.getElementById("sidebar");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalContent = document.getElementById("modalContent");
const searchInput = document.getElementById("globalSearch");
let currentView = "home";
let currentLesson = 4;
let catalogFilter = "Todos";

function courseCard(course, compact = false) {
  return `
    <article class="course-card" data-course-card="${course.id}" data-search="${(course.title + " " + course.category).toLowerCase()}">
      <div class="course-cover ${course.tone}">
        <span class="course-tag">${course.category} · ${course.level}</span>
        <span class="course-icon" aria-hidden="true">${course.icon}</span>
      </div>
      <div class="course-body">
        <h3>${course.title}</h3>
        <div class="course-meta"><span>◷ ${course.duration}</span><span>▤ ${course.lessons} lecciones</span></div>
        ${compact ? "" : `
          <div class="progress-line"><span style="width:${course.progress}%"></span></div>
          <div class="progress-caption"><span>${course.progress}% completado</span><span>${course.due}</span></div>
        `}
      </div>
      <button class="course-action" data-open-course="${course.id}">${course.progress ? "Continuar curso" : "Ver curso"} →</button>
    </article>`;
}

function pageHead(eyebrow, title, description, chip = "9 de noviembre de 2026") {
  return `<div class="page-head"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${description}</p></div><span class="date-chip">${chip}</span></div>`;
}

function renderHome() {
  main.innerHTML = `
    ${pageHead("Panel personal", "Buenos días, Joel", "Continúe su ruta técnica y revise sus próximos vencimientos.")}
    <section class="hero-grid">
      <article class="hero-card">
        <div class="hero-copy">
          <span class="label">● EN PROGRESO · LECCIÓN 5 DE 6</span>
          <h2>Seguridad en mantenimiento de elevadores</h2>
          <p>Retome el módulo sobre trabajo seguro en el foso y complete la evaluación final.</p>
          <button class="primary-button" data-open-course="seguridad">Continuar aprendizaje&nbsp; →</button>
        </div>
        <div class="elevator-visual" aria-hidden="true"><div class="floor-lines"></div><div class="elevator-frame"><div class="elevator-dot"></div><div class="elevator-door"></div></div></div>
      </article>
      <article class="progress-card">
        <div class="progress-card-top"><div><h3>Progreso de la ruta</h3><p>Técnico de mantenimiento · Nivel 1</p></div><span class="status-pill blue">Activo</span></div>
        <div class="ring" style="--progress:68"><div><strong>68%</strong><small>completado</small></div></div>
        <div class="mini-stats"><div><strong>3</strong><span>Asignados</span></div><div><strong>1</strong><span>Completado</span></div><div><strong>1</strong><span>Próximo</span></div></div>
      </article>
    </section>

    <section class="section">
      <div class="section-head"><h2>Continúe aprendiendo</h2><button class="text-button" data-view="learning">Ver toda mi formación →</button></div>
      <div class="course-grid">${courses.slice(0,3).map(c => courseCard(c)).join("")}</div>
    </section>

    <section class="section lower-grid">
      <article class="panel">
        <div class="section-head"><h2>Ruta Técnico de mantenimiento</h2><span class="status-pill blue">3 de 6 módulos</span></div>
        <div class="path-list">
          <div class="path-item complete"><span class="path-number">✓</span><div><strong>Inducción a ETSA y cultura de seguridad</strong><small>Completado el 28 de octubre</small></div><span class="status-pill green">Completado</span></div>
          <div class="path-item current"><span class="path-number">02</span><div><strong>Seguridad en mantenimiento de elevadores</strong><small>4 de 6 lecciones completadas</small></div><span class="status-pill blue">En curso</span></div>
          <div class="path-item"><span class="path-number">03</span><div><strong>Diagnóstico básico de fallas</strong><small>Disponible ahora</small></div><span class="status-pill">Pendiente</span></div>
          <div class="path-item"><span class="path-number">04</span><div><strong>Mantenimiento preventivo</strong><small>Se habilita al completar diagnóstico</small></div><span class="status-pill">Bloqueado</span></div>
        </div>
      </article>
      <aside class="panel">
        <div class="section-head"><h2>Avisos</h2><button class="text-button">Ver todos</button></div>
        <div class="announcement"><span class="announcement-icon">!</span><div><strong>Evaluación de seguridad vence el 18 de noviembre</strong><small>Hace 2 horas</small></div></div>
        <div class="announcement"><span class="announcement-icon" style="background:var(--cyan-soft);color:var(--blue)">▤</span><div><strong>Nuevo recurso: Lista de verificación previa al mantenimiento</strong><small>Ayer</small></div></div>
        <div class="announcement"><span class="announcement-icon" style="background:var(--green-soft);color:var(--green)">✓</span><div><strong>Certificado de bloqueo y etiquetado disponible</strong><small>3 de noviembre</small></div></div>
      </aside>
    </section>`;
}

function renderLearning() {
  const assigned = courses.filter(c => c.progress < 100).slice(0,4);
  main.innerHTML = `
    ${pageHead("Formación asignada", "Mi aprendizaje", "Revise cursos activos, fechas límite y avance de su ruta.", "Ruta técnica · Nivel 1")}
    <div class="filter-bar"><div class="filter-pills"><button class="filter-pill active">Todos 4</button><button class="filter-pill">En progreso 2</button><button class="filter-pill">Sin iniciar 2</button></div><button class="secondary-button" data-view="catalog">Explorar catálogo</button></div>
    <div class="course-grid">${assigned.map(c => courseCard(c)).join("")}</div>
    <section class="section panel">
      <div class="section-head"><h2>Historial reciente</h2><span class="status-pill green">1 completado</span></div>
      <div class="path-item complete"><span class="path-number">✓</span><div><strong>Bloqueo y etiquetado de energías</strong><small>Resultado 92% · Completado el 2 de noviembre de 2026</small></div><button class="text-button" data-view="certificates">Ver certificado</button></div>
    </section>`;
}

function renderCatalog() {
  const categories = ["Todos", "Seguridad", "Técnico", "Servicio", "Liderazgo"];
  const visible = catalogFilter === "Todos" ? courses : courses.filter(c => c.category === catalogFilter);
  main.innerHTML = `
    ${pageHead("Biblioteca de formación", "Catálogo de cursos", "Explore contenido técnico, seguridad, servicio y liderazgo.", `${visible.length} cursos disponibles`)}
    <div class="filter-bar"><div class="filter-pills">${categories.map(c => `<button class="filter-pill ${catalogFilter === c ? "active" : ""}" data-filter="${c}">${c}</button>`).join("")}</div></div>
    <div class="course-grid catalog-grid" id="catalogGrid">${visible.map(c => courseCard(c, true)).join("")}</div>`;
}

function renderCertificates() {
  main.innerHTML = `
    ${pageHead("Evidencia de formación", "Mis certificados", "Descargue constancias de cursos aprobados y revise renovaciones.", "1 certificado activo")}
    <div class="certificate-grid">
      <article class="certificate-card">
        <div class="certificate-inner">
          <div class="seal">◇</div><p>ETSA ACADEMY CERTIFICA QUE</p><h2>Joel</h2><p>ha completado satisfactoriamente el curso</p><h3>Bloqueo y etiquetado de energías</h3><p>Resultado final 92% · Emitido el 2 de noviembre de 2026<br>Válido hasta el 2 de noviembre de 2027</p>
          <button class="primary-button" id="downloadCertificate">Descargar certificado</button>
        </div>
      </article>
      <div class="certificate-side">
        <article class="panel"><div class="section-head"><h2>Resumen</h2></div><div class="mini-stats"><div><strong>1</strong><span>Vigente</span></div><div><strong>0</strong><span>Por vencer</span></div><div><strong>0</strong><span>Vencido</span></div></div></article>
        <article class="panel"><div class="section-head"><h2>Próxima certificación</h2><span class="status-pill blue">68%</span></div><h3 style="font-size:14px">Seguridad en mantenimiento de elevadores</h3><p style="color:var(--muted);font-size:10px;line-height:1.5">Complete dos lecciones y obtenga una nota mínima de 80% en la evaluación.</p><button class="secondary-button" data-open-course="seguridad">Continuar curso</button></article>
      </div>
    </div>`;
}

function renderAdmin() {
  main.innerHTML = `
    ${pageHead("Vista de demostración", "Panel administrativo", "Seguimiento básico de usuarios, finalización y resultados.", "Última actualización · Hoy 8:30")}
    <div class="metric-grid">
      <article class="metric-card"><div class="metric-card-top"><span>USUARIOS ACTIVOS</span><span class="metric-icon">◎</span></div><strong>86</strong><small>↑ 8 este mes</small></article>
      <article class="metric-card"><div class="metric-card-top"><span>FINALIZACIÓN</span><span class="metric-icon">✓</span></div><strong>74%</strong><small>↑ 6% frente al mes anterior</small></article>
      <article class="metric-card"><div class="metric-card-top"><span>FORMACIÓN VENCIDA</span><span class="metric-icon" style="background:var(--red-soft);color:var(--red)">!</span></div><strong>12</strong><small style="color:var(--red)">Requiere seguimiento</small></article>
      <article class="metric-card"><div class="metric-card-top"><span>NOTA PROMEDIO</span><span class="metric-icon">◇</span></div><strong>88%</strong><small>Meta mínima 80%</small></article>
    </div>
    <div class="admin-grid">
      <article class="panel">
        <div class="section-head"><h2>Avance de participantes</h2><button class="secondary-button" id="exportReport">Exportar reporte</button></div>
        <div class="table-wrap"><table><thead><tr><th>Participante</th><th>Rol</th><th>Ruta</th><th>Progreso</th><th>Estado</th></tr></thead><tbody>
          <tr><td><div class="person"><span class="person-avatar">J</span>Joel</div></td><td>Dirección</td><td>Nivel 1</td><td>68%</td><td><span class="status-pill blue">En curso</span></td></tr>
          <tr><td><div class="person"><span class="person-avatar">CM</span>Carlos Méndez</div></td><td>Técnico</td><td>Nivel 1</td><td>100%</td><td><span class="status-pill green">Completado</span></td></tr>
          <tr><td><div class="person"><span class="person-avatar">LS</span>Laura Solano</div></td><td>Supervisora</td><td>Supervisión</td><td>82%</td><td><span class="status-pill blue">En curso</span></td></tr>
          <tr><td><div class="person"><span class="person-avatar">JV</span>José Vargas</div></td><td>Técnico</td><td>Nivel 1</td><td>22%</td><td><span class="status-pill" style="background:var(--red-soft);color:var(--red)">Atrasado</span></td></tr>
          <tr><td><div class="person"><span class="person-avatar">MP</span>María Pérez</div></td><td>Administrativa</td><td>Inducción</td><td>100%</td><td><span class="status-pill green">Completado</span></td></tr>
        </tbody></table></div>
      </article>
      <aside class="panel">
        <div class="section-head"><h2>Finalización semanal</h2><span class="status-pill green">+12%</span></div>
        <div class="bar-chart">${[32,48,44,68,74,83,76].map((h,i) => `<div class="bar-col"><div class="bar" style="height:${h}%"></div><span>${["L","M","X","J","V","S","D"][i]}</span></div>`).join("")}</div>
        <div class="announcement"><span class="announcement-icon">!</span><div><strong>12 asignaciones vencidas</strong><small>Enviar recordatorio a participantes</small></div></div>
        <button class="primary-button" id="sendReminder" style="width:100%">Enviar recordatorio</button>
      </aside>
    </div>
    <section class="section panel"><div class="section-head"><h2>Cursos publicados</h2><button class="secondary-button" id="newCourse">+ Nuevo curso</button></div><div class="table-wrap"><table><thead><tr><th>Curso</th><th>Participantes</th><th>Finalización</th><th>Nota promedio</th><th>Estado</th></tr></thead><tbody>
      <tr><td>Seguridad en mantenimiento de elevadores</td><td>46</td><td>74%</td><td>88%</td><td><span class="status-pill green">Publicado</span></td></tr>
      <tr><td>Diagnóstico básico de fallas</td><td>28</td><td>43%</td><td>84%</td><td><span class="status-pill green">Publicado</span></td></tr>
      <tr><td>Servicio al cliente en campo</td><td>35</td><td>18%</td><td>91%</td><td><span class="status-pill blue">Piloto</span></td></tr>
    </tbody></table></div></section>`;
}

function renderCourse(courseId = "seguridad") {
  const course = courses.find(c => c.id === courseId) || courses[0];
  currentView = "course";
  main.innerHTML = `
    <section class="course-player">
      <div class="player-main">
        <div class="player-head"><button class="back-button" data-view="home">← Volver al panel</button><span class="status-pill blue">${course.category} · ${course.level}</span></div>
        <div class="player-stage"><div class="lesson-illustration"><button class="play" id="playLesson" aria-label="Reproducir lección">▶</button><h2>${lessonData[currentLesson].title}</h2><p>Revise las condiciones del área, confirme los controles críticos y documente cualquier desviación antes de iniciar la intervención.</p></div></div>
        <div class="player-info">
          <div class="tabs"><button class="tab active" data-tab="summary">Resumen</button><button class="tab" data-tab="resources">Recursos</button><button class="tab" data-tab="notes">Notas</button></div>
          <div class="tab-content" id="tabContent"><strong>Objetivo de la lección</strong><p>Aplicar una revisión previa al ingreso al foso, identificar peligros y confirmar que las barreras y controles están en posición antes de comenzar el trabajo.</p><div class="button-row"><button class="primary-button" id="completeLesson">Marcar como completada</button><button class="secondary-button" id="openQuiz">Ir a evaluación</button></div></div>
        </div>
      </div>
      <aside class="lesson-sidebar">
        <div class="lesson-sidebar-head"><h3>${course.title}</h3><div class="progress-line"><span style="width:68%"></span></div><div class="progress-caption"><span>4 de 6 lecciones</span><span>68%</span></div></div>
        <div class="lesson-list">${lessonData.map((lesson,index) => `<button class="lesson-item ${lesson.complete ? "complete" : ""} ${index === currentLesson ? "active" : ""}" data-lesson="${index}"><span class="lesson-check">${lesson.complete ? "✓" : index + 1}</span><span><strong>${lesson.title}</strong><small>${lesson.quiz ? "Evaluación" : "Contenido"}</small></span><span class="lesson-time">${lesson.time}</span></button>`).join("")}</div>
      </aside>
    </section>`;
}

function renderCurrent() {
  if (currentView === "home") renderHome();
  if (currentView === "learning") renderLearning();
  if (currentView === "catalog") renderCatalog();
  if (currentView === "certificates") renderCertificates();
  if (currentView === "admin") renderAdmin();
  bindDynamicEvents();
  main.focus({ preventScroll: true });
}

function navigate(view) {
  currentView = view;
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
  sidebar.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderCurrent();
}

function openModal(html) {
  modalContent.innerHTML = html;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function showGuide() {
  openModal(`<p class="eyebrow" style="color:var(--blue);font-weight:800">GUÍA RÁPIDA</p><h2 id="modalTitle">Cómo usar ETSA Academy</h2><p>Este demo permite recorrer la experiencia de participante y una vista administrativa ilustrativa.</p><div class="guide-steps"><div class="guide-step"><div><strong>Revise su panel</strong><span>Consulte cursos asignados, fechas y progreso.</span></div></div><div class="guide-step"><div><strong>Complete la formación</strong><span>Abra un curso, avance por las lecciones y realice la evaluación.</span></div></div><div class="guide-step"><div><strong>Obtenga evidencia</strong><span>Los cursos aprobados generan un certificado y quedan registrados.</span></div></div><div class="guide-step"><div><strong>Supervise resultados</strong><span>La vista administrativa resume participación, avance y vencimientos.</span></div></div></div>`);
}

function showQuiz() {
  openModal(`<p class="eyebrow" style="color:var(--blue);font-weight:800">EVALUACIÓN DE MUESTRA</p><h2 id="modalTitle">Control previo al ingreso al foso</h2><p>¿Cuál acción debe completarse antes de ingresar al área de trabajo?</p><div class="quiz-options"><button class="quiz-option">Ingresar primero y revisar desde adentro</button><button class="quiz-option" data-correct="true">Confirmar aislamiento, señalización y ausencia de energía peligrosa</button><button class="quiz-option">Solicitar confirmación al cliente después de comenzar</button></div><button class="primary-button" id="submitQuiz">Enviar respuesta</button>`);
  let selected = null;
  document.querySelectorAll(".quiz-option").forEach(option => option.addEventListener("click", () => {
    document.querySelectorAll(".quiz-option").forEach(o => o.classList.remove("selected"));
    option.classList.add("selected");
    selected = option;
  }));
  document.getElementById("submitQuiz").addEventListener("click", () => {
    if (!selected) return showToast("Seleccione una respuesta");
    if (selected.dataset.correct) {
      closeModal();
      showToast("Respuesta correcta · Progreso actualizado");
    } else {
      showToast("Revise los controles de energía e intente nuevamente");
    }
  });
}

function bindDynamicEvents() {
  document.querySelectorAll("[data-view]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); navigate(el.dataset.view); }));
  document.querySelectorAll("[data-open-course]").forEach(el => el.addEventListener("click", () => { renderCourse(el.dataset.openCourse); bindDynamicEvents(); main.focus(); }));
  document.querySelectorAll("[data-filter]").forEach(el => el.addEventListener("click", () => { catalogFilter = el.dataset.filter; renderCatalog(); bindDynamicEvents(); }));
  document.querySelectorAll("[data-lesson]").forEach(el => el.addEventListener("click", () => { currentLesson = Number(el.dataset.lesson); renderCourse("seguridad"); bindDynamicEvents(); }));
  document.querySelectorAll("[data-tab]").forEach(el => el.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active")); el.classList.add("active");
    const content = document.getElementById("tabContent");
    if (el.dataset.tab === "summary") content.innerHTML = `<strong>Objetivo de la lección</strong><p>Aplicar una revisión previa al ingreso al foso, identificar peligros y confirmar que las barreras y controles están en posición antes de comenzar el trabajo.</p><div class="button-row"><button class="primary-button" id="completeLesson">Marcar como completada</button><button class="secondary-button" id="openQuiz">Ir a evaluación</button></div>`;
    if (el.dataset.tab === "resources") content.innerHTML = `<strong>Recursos disponibles</strong><p>Lista de verificación previa al mantenimiento · Procedimiento de bloqueo y etiquetado · Formato de reporte de condición insegura.</p><button class="secondary-button" id="downloadResource">Descargar lista de verificación</button>`;
    if (el.dataset.tab === "notes") content.innerHTML = `<strong>Notas personales</strong><p>Sus notas se guardarían aquí en la versión implementada.</p><textarea aria-label="Notas de la lección" style="width:100%;min-height:100px;border:1px solid var(--line);border-radius:12px;padding:12px;resize:vertical" placeholder="Escriba una nota..."></textarea>`;
    bindPlayerActions();
  }));
  bindPlayerActions();
  const download = document.getElementById("downloadCertificate"); if (download) download.addEventListener("click", () => showToast("Certificado de demostración preparado"));
  const report = document.getElementById("exportReport"); if (report) report.addEventListener("click", () => showToast("Reporte de demostración exportado"));
  const reminder = document.getElementById("sendReminder"); if (reminder) reminder.addEventListener("click", () => showToast("Recordatorio de muestra enviado a 12 participantes"));
  const newCourse = document.getElementById("newCourse"); if (newCourse) newCourse.addEventListener("click", () => showToast("En la implementación, este botón abriría el creador de cursos"));
}

function bindPlayerActions() {
  const play = document.getElementById("playLesson"); if (play) play.addEventListener("click", () => showToast("Reproduciendo contenido de demostración"));
  const complete = document.getElementById("completeLesson"); if (complete) complete.addEventListener("click", () => { lessonData[currentLesson].complete = true; showToast("Lección marcada como completada"); renderCourse("seguridad"); bindDynamicEvents(); });
  const quiz = document.getElementById("openQuiz"); if (quiz) quiz.addEventListener("click", showQuiz);
  const resource = document.getElementById("downloadResource"); if (resource) resource.addEventListener("click", () => showToast("Recurso de demostración preparado"));
}

document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.view)));
document.getElementById("mobileMenu").addEventListener("click", () => sidebar.classList.add("open"));
document.getElementById("mobileClose").addEventListener("click", () => sidebar.classList.remove("open"));
document.getElementById("helpButton").addEventListener("click", showGuide);
document.getElementById("modalClose").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", event => { if (event.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchInput.focus(); }
});
searchInput.addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();
  if (currentView !== "catalog" && query.length > 1) { currentView = "catalog"; catalogFilter = "Todos"; renderCatalog(); bindDynamicEvents(); }
  document.querySelectorAll("[data-course-card]").forEach(card => { card.style.display = !query || card.dataset.search.includes(query) ? "" : "none"; });
});

renderHome();
bindDynamicEvents();

