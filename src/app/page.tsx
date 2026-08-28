import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const solutions = [
  {
    number: "01",
    title: "Operaciones que funcionan",
    text: "Organizamos, mejoramos y podemos acompañar la administración de operaciones para lograr un funcionamiento óptimo y estratégico.",
  },
  {
    number: "02",
    title: "Datos que se entienden",
    text: "Convertimos información dispersa en indicadores y visualizaciones claras que muestran qué está ocurriendo en la empresa.",
  },
  {
    number: "03",
    title: "Proyección para decidir",
    text: "Construimos escenarios y proyecciones que ayudan a anticipar posibilidades y tomar mejores decisiones en el presente.",
  },
];

const deliverables = [
  "Operations Snapshot de una página",
  "Tres prioridades operativas",
  "Tres acciones recomendadas y ordenadas",
  "Plan inicial de 30 días",
  "Responsables sugeridos",
  "Señales sencillas para medir avance",
];

const steps = [
  ["01", "Entendemos", "Escuchamos sus objetivos y conocemos cómo funciona realmente la empresa."],
  ["02", "Hacemos visible", "Conectamos procesos, datos y señales relevantes para obtener una visión clara."],
  ["03", "Definimos dirección", "Priorizamos oportunidades y construimos escenarios para decidir qué hacer primero."],
  ["04", "Impulsamos la acción", "Convertimos la dirección elegida en un plan práctico y acompañamos su avance."],
];

const pillars = [
  ["01", "Claridad", "Hacemos comprensible lo complejo para facilitar decisiones con propósito."],
  ["02", "Evidencia", "Conectamos observación, información y datos antes de recomendar una dirección."],
  ["03", "Ejecución", "Convertimos ideas y análisis en acciones concretas que la empresa puede sostener."],
  ["04", "Colaboración", "Trabajamos junto al cliente, respetando su experiencia, contexto y capacidad."],
  ["05", "Evolución", "Buscamos mejoras que fortalezcan el presente y preparen a la empresa para el futuro."],
];

export default function Home() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span aria-hidden="true"></span> Operaciones · Datos · Estrategia</p>
              <h1>
                Convierta la realidad de su empresa en decisiones que <span>construyen su futuro.</span>
              </h1>
              <p className="hero-lead">
                CORVEN integra gestión operativa, visualización de datos y proyección estratégica para ayudar a las empresas a actuar hoy con una visión más clara del mañana.
              </p>
              <div className="button-row">
                <a className="button button-primary" href="#contacto">
                  Conversemos
                  <span aria-hidden="true">→</span>
                </a>
                <a className="button button-secondary" href="#soluciones">
                  Conocer nuestras soluciones
                </a>
              </div>
              <ul className="trust-list" aria-label="Enfoque de CORVEN">
                <li>Decisiones con evidencia</li>
                <li>Ejecución práctica</li>
                <li>Visión de futuro</li>
              </ul>
              <div className="hero-proof" aria-label="Enfoque integral">
                <span>Nuestro enfoque</span>
                <strong>Entender → Visualizar → Proyectar → Actuar</strong>
              </div>
            </div>

            <div className="snapshot-wrap" aria-label="Ejemplo ilustrativo de un Business Snapshot">
              <div className="snapshot-note"><span aria-hidden="true"></span> Ejemplo ilustrativo</div>
              <article className="snapshot-card">
                <div className="snapshot-header">
                  <div>
                    <p>Business Snapshot</p>
                    <strong>Decisiones conectadas</strong>
                  </div>
                  <span>Presente + futuro</span>
                </div>
                <div className="snapshot-body">
                  <p className="snapshot-label">Una visión integral</p>
                  <div className="priority priority-high">
                    <span>1</span>
                    <div><strong>Operación</strong><small>Procesos, responsabilidades y control</small></div>
                  </div>
                  <div className="priority priority-medium">
                    <span>2</span>
                    <div><strong>Datos</strong><small>Indicadores visibles para decidir</small></div>
                  </div>
                  <div className="priority priority-low">
                    <span>3</span>
                    <div><strong>Proyección</strong><small>Escenarios para actuar a tiempo</small></div>
                  </div>
                </div>
                <div className="snapshot-footer">
                  <span>Operación</span><span>Datos</span><span>Estrategia</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="signal-strip" aria-label="Mensaje principal">
          <div className="container signal-content">
            <span className="signal-mark">C</span>
            <p>Hacemos visible lo que ocurre hoy para construir <strong>mejores decisiones mañana.</strong></p>
          </div>
        </section>

        <section className="section section-challenges" id="soluciones">
          <div className="container">
            <div className="section-heading heading-split">
              <div><p className="eyebrow">Qué hacemos</p><h2>Tres capacidades conectadas para fortalecer su empresa.</h2></div>
              <p>Analizamos el presente, hacemos visible la información importante y ayudamos a convertirla en dirección y acción.</p>
            </div>
            <div className="challenge-grid solutions-grid">
              {solutions.map((solution) => (
                <article className="challenge-card" key={solution.number}>
                  <span>{solution.number}</span><h3>{solution.title}</h3><p>{solution.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-diagnostic" id="diagnostico">
          <div className="container diagnostic-grid">
            <div className="diagnostic-copy">
              <p className="eyebrow eyebrow-light">Servicio de entrada</p>
              <h2>Diagnóstico Operativo Express: claridad para decidir qué mejorar primero.</h2>
              <p>Revisamos de forma ligera cómo funciona hoy la operación para identificar prioridades y convertirlas en un plan inicial práctico.</p>
              <div className="effort-card">
                <span>Participación estimada del cliente</span><strong>2,5 a 3,5 horas</strong>
                <small>Distribuidas entre el formulario, las conversaciones y la sesión de resultados.</small>
              </div>
            </div>
            <div className="deliverables-card">
              <p className="card-kicker">Al finalizar, usted recibe</p>
              <ul>{deliverables.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
              <p className="deliverables-note">Recomendaciones acordes con la realidad y capacidad actual de la empresa.</p>
            </div>
          </div>
        </section>

        <section className="section section-process" id="como-trabajamos">
          <div className="container">
            <div className="section-heading centered-heading">
              <p className="eyebrow">Cómo trabajamos</p><h2>De la realidad actual a una dirección clara</h2>
              <p>Un enfoque directo para conectar operación, información, futuro y ejecución.</p>
            </div>
            <ol className="process-grid process-grid-four">
              {steps.map(([number, title, text]) => (
                <li key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section-vision" id="vision">
          <div className="container">
            <div className="vision-statement">
              <p className="eyebrow eyebrow-light">Nuestra visión</p>
              <h2>Ayudar a construir la mejor versión de los negocios.</h2>
              <p>Queremos que cada empresa pueda comprender mejor su presente, anticipar posibilidades y avanzar con decisiones estratégicas que fortalezcan su futuro.</p>
            </div>
            <div className="pillars-heading">
              <p className="eyebrow">Los cinco pilares de CORVEN</p>
              <p>La forma en que pensamos, decidimos y trabajamos con cada cliente.</p>
            </div>
            <div className="pillars-grid">
              {pillars.map(([number, title, text]) => (
                <article className="pillar-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-about" id="sobre-corven">
          <div className="container about-grid">
            <p className="eyebrow eyebrow-light">Sobre CORVEN</p>
            <div>
              <h2>Una compañía que conecta operación, información y futuro.</h2>
              <p>CORVEN ayuda a las empresas a entender cómo funcionan, visualizar lo que sus datos revelan y convertir ese conocimiento en decisiones y acciones estratégicas.</p>
            </div>
          </div>
        </section>

        <section className="section section-contact" id="contacto">
          <div className="container contact-card">
            <div>
              <p className="eyebrow">Conversemos</p><h2>Construyamos una visión más clara para su empresa.</h2>
              <p>Cuéntenos qué necesita entender, mejorar o proyectar. Empezaremos por identificar la conversación más útil para avanzar.</p>
            </div>
            <div className="contact-actions">
              <span className="button button-primary button-disabled" aria-disabled="true">Solicitar información</span>
              <small>Correo y WhatsApp pendientes de confirmación antes de publicar.</small>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
