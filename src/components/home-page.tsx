import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Locale = "es" | "en";

const content = {
  es: {
    ids: { home: "inicio", solutions: "soluciones", diagnostic: "diagnostico", process: "como-trabajamos", about: "sobre-corven", contact: "contacto" },
    hero: {
      eyebrow: "Operaciones · Datos · Estrategia", title: "Construya su", titleAccent: "futuro.",
      lead: "CORVEN integra gestión operativa, visualización de datos y proyección estratégica para ayudar a las empresas a actuar hoy con una visión más clara del mañana.",
      primaryCta: "Conversemos", secondaryCta: "Conocer nuestras soluciones", trustLabel: "Enfoque de CORVEN",
      trust: ["Decisiones con evidencia", "Ejecución práctica", "Visión de futuro"], approachLabel: "Nuestro enfoque",
      approach: "Entender → Visualizar → Proyectar → Actuar", cycleLabel: "Ciclo de mejora continua: entender, visualizar, proyectar y actuar",
      cycleCenterTop: "Mejora", cycleCenterBottom: "continua", cycleSteps: ["Entender", "Visualizar", "Proyectar", "Actuar"],
    },
    signal: { label: "Mensaje principal", text: "Hacemos visible lo que ocurre hoy para construir", strong: "mejores decisiones mañana." },
    solutions: {
      eyebrow: "Qué hacemos", title: "Tres capacidades conectadas para fortalecer su empresa.",
      intro: "Analizamos el presente, hacemos visible la información importante y ayudamos a convertirla en dirección y acción.",
      items: [
        ["1", "Operaciones que funcionan", "Organizamos, mejoramos y podemos acompañar la administración de operaciones para lograr un funcionamiento óptimo y estratégico."],
        ["2", "Datos que se entienden", "Convertimos información dispersa en indicadores y visualizaciones claras que muestran qué está ocurriendo en la empresa."],
        ["3", "Proyección para decidir", "Construimos escenarios y proyecciones que ayudan a anticipar posibilidades y tomar mejores decisiones en el presente."],
      ],
    },
    diagnostic: {
      eyebrow: "Servicio de entrada", title: "Diagnóstico Operativo Express: claridad para decidir qué mejorar primero.",
      intro: "Revisamos de forma ligera cómo funciona hoy la operación para identificar prioridades y convertirlas en un plan inicial práctico.",
      deliverablesTitle: "Al finalizar, usted recibe",
      deliverables: ["Panorama Estratégico de una página", "Tres prioridades operativas", "Tres acciones recomendadas y ordenadas", "Plan inicial de 30 días", "Responsables sugeridos", "Señales sencillas para medir avance"],
      note: "Recomendaciones acordes con la realidad y capacidad actual de la empresa.",
    },
    snapshot: {
      eyebrow: "Una visión conectada", title: "Panorama Estratégico CORVEN",
      intro: "Una lectura clara del presente que conecta operación, datos y proyección para definir prioridades y orientar las próximas decisiones.",
      aria: "Ejemplo ilustrativo del Panorama Estratégico CORVEN", example: "Ejemplo ilustrativo", cardTitle: "Panorama Estratégico",
      cardStrong: "Decisiones conectadas", timing: "Presente + futuro", label: "Una visión integral",
      priorities: [["1", "Operación", "Procesos, responsabilidades y control"], ["2", "Datos", "Indicadores visibles para decidir"], ["3", "Proyección", "Escenarios para actuar a tiempo"]],
      footer: ["Operación", "Datos", "Estrategia"],
    },
    process: {
      eyebrow: "Cómo trabajamos", title: "De la realidad actual a una dirección clara",
      intro: "Un enfoque directo para conectar operación, información, futuro y ejecución.",
      items: [
        ["1", "Entendemos", "Escuchamos sus objetivos y conocemos cómo funciona realmente la empresa."],
        ["2", "Hacemos visible", "Conectamos procesos, datos y señales relevantes para obtener una visión clara."],
        ["3", "Definimos dirección", "Priorizamos oportunidades y construimos escenarios para decidir qué hacer primero."],
        ["4", "Impulsamos la acción", "Convertimos la dirección elegida en un plan práctico y acompañamos su avance."],
      ],
    },
    vision: {
      eyebrow: "Nuestra visión", title: "Ayudar a construir la mejor versión de los negocios.",
      intro: "Queremos que cada empresa pueda comprender mejor su presente, anticipar posibilidades y avanzar con decisiones estratégicas que fortalezcan su futuro.",
      pillarsTitle: "Los cinco pilares de CORVEN", pillarsIntro: "La forma en que pensamos, decidimos y trabajamos con cada cliente.",
      pillars: [
        ["1", "Claridad", "Hacemos comprensible lo complejo para facilitar decisiones con propósito."],
        ["2", "Evidencia", "Conectamos observación, información y datos antes de recomendar una dirección."],
        ["3", "Ejecución", "Convertimos ideas y análisis en acciones concretas que la empresa puede sostener."],
        ["4", "Colaboración", "Trabajamos junto al cliente, respetando su experiencia, contexto y capacidad."],
        ["5", "Evolución", "Buscamos mejoras que fortalezcan el presente y preparen a la empresa para el futuro."],
      ],
    },
    about: { eyebrow: "Sobre CORVEN", title: "Una compañía que conecta operación, información y futuro.", text: "CORVEN ayuda a las empresas a entender cómo funcionan, visualizar lo que sus datos revelan y convertir ese conocimiento en decisiones y acciones estratégicas." },
    contact: { eyebrow: "Conversemos", title: "Construyamos una visión más clara para su empresa.", text: "Cuéntenos qué necesita entender, mejorar o proyectar. Empezaremos por identificar la conversación más útil para avanzar.", cta: "Solicitar información", pending: "Correo y WhatsApp pendientes de confirmación antes de publicar." },
  },
  en: {
    ids: { home: "home", solutions: "solutions", diagnostic: "diagnostic", process: "how-we-work", about: "about-corven", contact: "contact" },
    hero: {
      eyebrow: "Operations · Data · Strategy", title: "Build your", titleAccent: "future.",
      lead: "CORVEN brings together operations management, data visualization, and strategic forecasting to help companies act today with a clearer view of tomorrow.",
      primaryCta: "Let's talk", secondaryCta: "Explore our solutions", trustLabel: "CORVEN's approach",
      trust: ["Evidence-based decisions", "Practical execution", "Forward-looking vision"], approachLabel: "Our approach",
      approach: "Understand → Visualize → Project → Act", cycleLabel: "Continuous improvement cycle: understand, visualize, project, and act",
      cycleCenterTop: "Continuous", cycleCenterBottom: "improvement", cycleSteps: ["Understand", "Visualize", "Project", "Act"],
    },
    signal: { label: "Key message", text: "We make today's reality visible to build", strong: "better decisions for tomorrow." },
    solutions: {
      eyebrow: "What we do", title: "Three connected capabilities to strengthen your company.",
      intro: "We analyze the present, make critical information visible, and help turn it into direction and action.",
      items: [
        ["1", "Operations that perform", "We organize and improve operations—and can support their ongoing management—to achieve optimal, strategic performance."],
        ["2", "Data you can understand", "We turn scattered information into clear indicators and visualizations that reveal what is happening across the company."],
        ["3", "Foresight for better decisions", "We build scenarios and projections that help companies anticipate possibilities and make better decisions today."],
      ],
    },
    diagnostic: {
      eyebrow: "Entry service", title: "Express Operations Diagnostic: clarity on what to improve first.",
      intro: "We take a focused look at how your operations work today, identify priorities, and turn them into a practical initial plan.",
      deliverablesTitle: "What you receive",
      deliverables: ["One-page Strategic Overview", "Three operational priorities", "Three prioritized recommendations", "Initial 30-day plan", "Suggested owners", "Simple progress indicators"],
      note: "Recommendations aligned with the company's current reality and capacity.",
    },
    snapshot: {
      eyebrow: "A connected perspective", title: "CORVEN Strategic Overview",
      intro: "A clear view of the present that connects operations, data, and projections to define priorities and guide the decisions ahead.",
      aria: "Illustrative example of the CORVEN Strategic Overview", example: "Illustrative example", cardTitle: "Strategic Overview",
      cardStrong: "Connected decisions", timing: "Present + future", label: "An integrated view",
      priorities: [["1", "Operations", "Processes, responsibilities, and control"], ["2", "Data", "Visible indicators for better decisions"], ["3", "Foresight", "Scenarios that support timely action"]],
      footer: ["Operations", "Data", "Strategy"],
    },
    process: {
      eyebrow: "How we work", title: "From today's reality to clear direction",
      intro: "A direct approach connecting operations, information, the future, and execution.",
      items: [
        ["1", "We understand", "We listen to your goals and learn how the company actually operates."],
        ["2", "We make it visible", "We connect processes, data, and relevant signals to create a clear view."],
        ["3", "We define direction", "We prioritize opportunities and build scenarios to decide what should come first."],
        ["4", "We drive action", "We turn the chosen direction into a practical plan and support its progress."],
      ],
    },
    vision: {
      eyebrow: "Our vision", title: "Help build the best version of every business.",
      intro: "We want every company to understand its present, anticipate possibilities, and move forward with strategic decisions that strengthen its future.",
      pillarsTitle: "CORVEN's five pillars", pillarsIntro: "The principles behind how we think, decide, and work with every client.",
      pillars: [
        ["1", "Clarity", "We make complexity understandable so decisions can be made with purpose."],
        ["2", "Evidence", "We connect observation, information, and data before recommending a direction."],
        ["3", "Execution", "We turn ideas and analysis into concrete actions the company can sustain."],
        ["4", "Collaboration", "We work alongside each client, respecting their experience, context, and capacity."],
        ["5", "Evolution", "We pursue improvements that strengthen the present and prepare the company for the future."],
      ],
    },
    about: { eyebrow: "About CORVEN", title: "A company connecting operations, information, and the future.", text: "CORVEN helps companies understand how they operate, see what their data reveals, and turn that knowledge into strategic decisions and action." },
    contact: { eyebrow: "Let's talk", title: "Let's build a clearer vision for your company.", text: "Tell us what you need to understand, improve, or project. We will begin by identifying the most useful conversation to move forward.", cta: "Request information", pending: "Email and WhatsApp details pending confirmation before publication." },
  },
} as const;

export function HomePage({ locale }: { locale: Locale }) {
  const c = content[locale];
  return (
    <div className="site-shell" lang={locale}>
      <SiteHeader locale={locale} />
      <main>
        <section className="hero" id={c.ids.home}>
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span aria-hidden="true"></span> {c.hero.eyebrow}</p>
              <h1>{c.hero.title} <span>{c.hero.titleAccent}</span></h1>
              <p className="hero-lead">{c.hero.lead}</p>
              <div className="button-row"><a className="button button-primary" href={`#${c.ids.contact}`}>{c.hero.primaryCta}<span aria-hidden="true">→</span></a><a className="button button-secondary" href={`#${c.ids.solutions}`}>{c.hero.secondaryCta}</a></div>
              <ul className="trust-list" aria-label={c.hero.trustLabel}>{c.hero.trust.map((item) => <li key={item}>{item}</li>)}</ul>
              <div className="hero-proof" aria-label={c.hero.approachLabel}><span>{c.hero.approachLabel}</span><strong>{c.hero.approach}</strong></div>
            </div>
          </div>
        </section>
        <section className="cycle-section" aria-label={c.hero.cycleLabel}>
          <div className="container">
            <div className="improvement-cycle" aria-label={c.hero.cycleLabel}>
              <div className="cycle-orbit" aria-hidden="true"></div><div className="cycle-center"><span>{c.hero.cycleCenterTop}</span><strong>{c.hero.cycleCenterBottom}</strong></div>
              {c.hero.cycleSteps.map((step, index) => <div className={`cycle-step cycle-step-${index + 1}`} key={step}><span>{index + 1}</span><strong>{step}</strong></div>)}
              <span className="cycle-arrow cycle-arrow-1" aria-hidden="true">→</span><span className="cycle-arrow cycle-arrow-2" aria-hidden="true">↓</span><span className="cycle-arrow cycle-arrow-3" aria-hidden="true">←</span><span className="cycle-arrow cycle-arrow-4" aria-hidden="true">↑</span>
            </div>
          </div>
        </section>
        <section className="signal-strip" aria-label={c.signal.label}><div className="container signal-content"><span className="signal-mark">C</span><p>{c.signal.text} <strong>{c.signal.strong}</strong></p></div></section>
        <section className="section section-challenges" id={c.ids.solutions}><div className="container"><div className="section-heading heading-split"><div><p className="eyebrow">{c.solutions.eyebrow}</p><h2>{c.solutions.title}</h2></div><p>{c.solutions.intro}</p></div><div className="challenge-grid solutions-grid">{c.solutions.items.map(([number, title, text]) => <article className="challenge-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
        <section className="section section-diagnostic" id={c.ids.diagnostic}><div className="container diagnostic-grid"><div className="diagnostic-copy"><p className="eyebrow eyebrow-light">{c.diagnostic.eyebrow}</p><h2>{c.diagnostic.title}</h2><p>{c.diagnostic.intro}</p></div><div className="deliverables-card"><p className="card-kicker">{c.diagnostic.deliverablesTitle}</p><ul>{c.diagnostic.deliverables.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul><p className="deliverables-note">{c.diagnostic.note}</p></div></div></section>
        <section className="section section-snapshot" aria-labelledby={`snapshot-title-${locale}`}><div className="container snapshot-section-grid"><div className="snapshot-section-copy"><p className="eyebrow">{c.snapshot.eyebrow}</p><h2 id={`snapshot-title-${locale}`}>{c.snapshot.title}</h2><p>{c.snapshot.intro}</p></div><div className="snapshot-wrap" aria-label={c.snapshot.aria}><div className="snapshot-note"><span aria-hidden="true"></span> {c.snapshot.example}</div><article className="snapshot-card"><div className="snapshot-header"><div><p>{c.snapshot.cardTitle}</p><strong>{c.snapshot.cardStrong}</strong></div><span>{c.snapshot.timing}</span></div><div className="snapshot-body"><p className="snapshot-label">{c.snapshot.label}</p>{c.snapshot.priorities.map(([number, title, text], index) => <div className={`priority ${["priority-high", "priority-medium", "priority-low"][index]}`} key={number}><span>{number}</span><div><strong>{title}</strong><small>{text}</small></div></div>)}</div><div className="snapshot-footer">{c.snapshot.footer.map((item) => <span key={item}>{item}</span>)}</div></article></div></div></section>
        <section className="section section-process" id={c.ids.process}><div className="container"><div className="section-heading centered-heading"><p className="eyebrow">{c.process.eyebrow}</p><h2>{c.process.title}</h2><p>{c.process.intro}</p></div><ol className="process-grid process-grid-four">{c.process.items.map(([number, title, text]) => <li key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>
        <section className="section section-vision" id="vision"><div className="container"><div className="vision-statement"><p className="eyebrow eyebrow-light">{c.vision.eyebrow}</p><h2>{c.vision.title}</h2><p>{c.vision.intro}</p></div><div className="pillars-heading"><p className="eyebrow">{c.vision.pillarsTitle}</p><p>{c.vision.pillarsIntro}</p></div><div className="pillars-grid">{c.vision.pillars.map(([number, title, text]) => <article className="pillar-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
        <section className="section section-about" id={c.ids.about}><div className="container about-grid"><p className="eyebrow eyebrow-light">{c.about.eyebrow}</p><div><h2>{c.about.title}</h2><p>{c.about.text}</p></div></div></section>
        <section className="section section-contact" id={c.ids.contact}><div className="container contact-card"><div><p className="eyebrow">{c.contact.eyebrow}</p><h2>{c.contact.title}</h2><p>{c.contact.text}</p></div><div className="contact-actions"><span className="button button-primary button-disabled" aria-disabled="true">{c.contact.cta}</span><small>{c.contact.pending}</small></div></div></section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
