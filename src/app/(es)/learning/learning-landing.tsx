import Image from "next/image";
import Link from "next/link";

import styles from "./learning.module.css";

const services = [
  {
    icon: "design",
    title: "Diseño de cursos",
    text: "Convertimos el material y conocimiento de su empresa en experiencias claras, prácticas y alineadas con el trabajo real.",
  },
  {
    icon: "path",
    title: "Currículas por rol",
    text: "Organizamos rutas de aprendizaje por puesto, departamento, nivel o etapa de incorporación.",
  },
  {
    icon: "quiz",
    title: "Evaluaciones",
    text: "Creamos quizzes, exámenes y criterios de aprobación para comprobar comprensión y avance.",
  },
  {
    icon: "platform",
    title: "Plataforma administrada",
    text: "Configuramos usuarios, grupos, permisos, asignaciones y soporte para mantener la academia funcionando.",
  },
  {
    icon: "chart",
    title: "Seguimiento y reportes",
    text: "Visualizamos progreso, completion rate, resultados y personas que requieren acompañamiento.",
  },
  {
    icon: "refresh",
    title: "Mantenimiento continuo",
    text: "Actualizamos cursos, materiales y configuraciones mediante un servicio recurrente acordado con el cliente.",
  },
] as const;

const useCases = [
  ["01", "Inducción", "Una experiencia consistente para cada nuevo colaborador."],
  ["02", "Procesos y procedimientos", "El conocimiento operativo disponible cuando se necesita."],
  ["03", "Servicio al cliente", "Práctica, criterios y comportamientos que elevan la experiencia."],
  ["04", "Liderazgo", "Coaching, habilidades blandas y herramientas para supervisores."],
] as const;

const process = [
  ["Entendemos", "Validamos la necesidad, audiencia, comportamiento esperado y evidencia disponible."],
  ["Diseñamos", "Definimos currícula, contenidos, práctica, evaluación y experiencia tecnológica."],
  ["Implementamos", "Producimos, revisamos, configuramos usuarios y dejamos la solución lista para lanzar."],
  ["Administramos", "Damos soporte, reportamos resultados y mantenemos el contenido actualizado."],
] as const;

const managedItems = [
  "Administración de usuarios y asignaciones",
  "Soporte operativo de la plataforma",
  "Reporte periódico de avance",
  "Actualizaciones dentro del volumen acordado",
  "Revisión programada del contenido",
] as const;

export function LearningLanding() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/" aria-label="Corven, ir al sitio principal">
            <Image src="/brand/corven-imagotype-purple.png" alt="Corven" width={360} height={120} priority />
            <span>Learning</span>
          </Link>

          <nav className={styles.nav} aria-label="Navegación de Corven Learning">
            <a href="#capacidades">Capacidades</a>
            <a href="#casos-de-uso">Casos de uso</a>
            <a href="#proceso">Cómo trabajamos</a>
          </nav>

          <div className={styles.headerActions}>
            <Link className={styles.textLink} href="/">Corven Consulting</Link>
            <Link className={styles.headerButton} href="/demo/learning">Explorar demo</Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true"></div>
          <div className={styles.dots} aria-hidden="true"></div>
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>Managed Learning Services</p>
                <h1>Capacitación que su empresa puede <span>ver, medir y mantener.</span></h1>
                <p className={styles.heroLead}>
                  Transformamos procesos y conocimiento experto en cursos, currículas y herramientas de consulta; después administramos la plataforma para que el aprendizaje siga funcionando.
                </p>
                <div className={styles.buttonRow}>
                  <Link className={styles.primaryButton} href="/demo/learning">Ver la experiencia <span>→</span></Link>
                  <a className={styles.secondaryButton} href="#capacidades">Conocer el servicio</a>
                </div>
                <ul className={styles.heroSignals} aria-label="Componentes del servicio">
                  <li>Diseño instruccional</li>
                  <li>Plataforma administrada</li>
                  <li>Reportes y mejora continua</li>
                </ul>
              </div>

              <div className={styles.productVisual} aria-label="Vista ilustrativa del producto Corven Learning">
                <div className={styles.browserBar}>
                  <span></span><span></span><span></span>
                  <small>Academia Nova · Panel de aprendizaje</small>
                </div>
                <div className={styles.visualBody}>
                  <div className={styles.visualSidebar}>
                    <span className={styles.visualLogo}>N</span>
                    <i></i><i></i><i></i><i></i>
                  </div>
                  <div className={styles.visualContent}>
                    <div className={styles.visualHeading}>
                      <div><small>Resumen del equipo</small><strong>Aprendizaje visible</strong></div>
                      <span>Este mes</span>
                    </div>
                    <div className={styles.visualKpis}>
                      <div><small>Completion rate</small><strong>78%</strong><em>+12%</em></div>
                      <div><small>Personas asignadas</small><strong>24</strong><em>3 equipos</em></div>
                      <div><small>Evaluación promedio</small><strong>88%</strong><em>Meta 80%</em></div>
                    </div>
                    <div className={styles.visualLower}>
                      <div className={styles.curriculumCard}>
                        <small>Currícula activa</small>
                        <strong>Inducción de servicio</strong>
                        {[100, 76, 42].map((value, index) => (
                          <div className={styles.progressRow} key={value}>
                            <span>{index + 1}</span>
                            <i><b style={{ width: `${value}%` }}></b></i>
                            <small>{value}%</small>
                          </div>
                        ))}
                      </div>
                      <div className={styles.chartCard}>
                        <small>Avance semanal</small>
                        <div className={styles.miniChart}>{[34, 47, 42, 60, 69, 78].map((value) => <i key={value} style={{ height: `${value}%` }}></i>)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.floatingNote}><span>✓</span><div><strong>Reporte listo</strong><small>Datos demostrativos</small></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.valueStrip} aria-label="Propuesta de valor">
          <div className={styles.container}>
            <span>De cursos aislados</span>
            <strong>a una operación de aprendizaje sostenible.</strong>
            <p>Contenido + tecnología + administración</p>
          </div>
        </section>

        <section className={styles.section} id="capacidades">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <div><p className={styles.eyebrow}>Una solución completa</p><h2>Todo lo necesario para convertir conocimiento en desempeño.</h2></div>
              <p>Corven conecta diseño, tecnología y operación para que la capacitación sea clara para el empleado y visible para el liderazgo.</p>
            </div>

            <div className={styles.serviceGrid}>
              {services.map((service, index) => (
                <article className={styles.serviceCard} key={service.title}>
                  <div className={styles.serviceTop}><Icon name={service.icon} /><span>0{index + 1}</span></div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.outcomeSection}`}>
          <div className={styles.container}>
            <div className={styles.outcomeGrid}>
              <div className={styles.outcomeCopy}>
                <p className={styles.eyebrow}>Lo que cambia</p>
                <h2>Más claridad para el empleado. Más control para la empresa.</h2>
                <p>El aprendizaje deja de depender de archivos dispersos, explicaciones distintas y seguimiento manual.</p>
                <Link className={styles.darkButton} href="/demo/learning">Explorar el entorno demostrativo <span>→</span></Link>
              </div>
              <div className={styles.outcomeList}>
                <article><span>01</span><div><h3>Seguimiento real</h3><p>Sepa quién inició, completó, aprobó o necesita apoyo.</p></div></article>
                <article><span>02</span><div><h3>Experiencia consistente</h3><p>Cada persona recibe la misma base de conocimiento y criterios.</p></div></article>
                <article><span>03</span><div><h3>Contenido vigente</h3><p>Los cambios dejan de quedarse en documentos que nadie actualiza.</p></div></article>
                <article><span>04</span><div><h3>Menos carga operativa</h3><p>Corven acompaña la administración, soporte y mantenimiento.</p></div></article>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.useCaseSection}`} id="casos-de-uso">
          <div className={styles.container}>
            <div className={`${styles.sectionHeading} ${styles.centeredHeading}`}>
              <div><p className={styles.eyebrow}>Dónde empezar</p><h2>Casos de uso con valor inmediato.</h2></div>
              <p>Podemos iniciar con una necesidad concreta y ampliar la academia conforme aprendemos qué funciona.</p>
            </div>
            <div className={styles.useCaseGrid}>
              {useCases.map(([number, title, text]) => (
                <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.processSection}`} id="proceso">
          <div className={styles.container}>
            <div className={styles.processIntro}>
              <p className={styles.eyebrow}>Cómo trabajamos</p>
              <h2>Primero validamos la necesidad. Después construimos.</h2>
              <p>No comenzamos produciendo cursos hasta comprender la audiencia, el comportamiento esperado y las barreras reales de desempeño.</p>
            </div>
            <ol className={styles.processGrid}>
              {process.map(([title, text], index) => (
                <li key={title}><span>{index + 1}</span><h3>{title}</h3><p>{text}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${styles.section} ${styles.managedSection}`}>
          <div className={styles.container}>
            <div className={styles.managedCard}>
              <div className={styles.managedCopy}>
                <p className={styles.eyebrow}>Servicio administrado</p>
                <h2>La entrega no termina cuando publicamos el curso.</h2>
                <p>Podemos continuar administrando la academia mediante un servicio mensual definido según el volumen, alcance y nivel de soporte que necesite cada cliente.</p>
                <small>La inversión se define después de validar alcance, usuarios y nivel de servicio.</small>
              </div>
              <div className={styles.managedList}>
                <p>La operación puede incluir</p>
                <ul>{managedItems.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.ctaGlow} aria-hidden="true"></div>
          <div className={styles.container}>
            <div>
              <p className={styles.eyebrow}>Véalo en acción</p>
              <h2>Explore cómo se siente una experiencia de aprendizaje administrada.</h2>
              <p>La demo utiliza una empresa, empleados y resultados ficticios para mostrar el recorrido de aprendizaje y las vistas de supervisión.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link className={styles.lightButton} href="/demo/learning">Abrir demo interactiva <span>→</span></Link>
              <Link className={styles.outlineButton} href="/#contacto">Conversemos sobre su necesidad</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <Link className={styles.footerBrand} href="/">
            <Image src="/brand/corven-imagotype-purple.png" alt="Corven" width={360} height={120} />
            <span>Learning</span>
          </Link>
          <p>Diseño instruccional, tecnología y operación para aprendizaje que se puede sostener.</p>
          <div><Link href="/">Corven Consulting</Link><Link href="/demo/learning">Demo</Link><Link href="/#contacto">Contacto</Link></div>
          <small>© {new Date().getFullYear()} Corven. Contenido comercial inicial sujeto a validación.</small>
        </div>
      </footer>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    design: <><path d="M4 19.5V21h1.5L18 8.5 15.5 6 4 17.5v2Z"/><path d="m14 7 3 3M13 4H5a2 2 0 0 0-2 2v8"/></>,
    path: <><circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18c7 0 3-12 10-12"/></>,
    quiz: <><path d="M5 3h14v18H5z"/><path d="M8 8h8M8 12h5M8 16h3"/></>,
    platform: <><rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21h8M12 17v4"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    refresh: <><path d="M20 6v5h-5M4 18v-5h5"/><path d="M18 11a7 7 0 0 0-12-4M6 13a7 7 0 0 0 12 4"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
