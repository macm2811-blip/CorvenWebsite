import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const challenges = [
  {
    number: "01",
    title: "Todo pasa por la persona dueña",
    text: "Las decisiones, autorizaciones y respuestas se detienen cuando usted no está disponible.",
  },
  {
    number: "02",
    title: "Cada persona trabaja diferente",
    text: "Los procesos cambian según quién atienda, venda, compre o coordine el trabajo.",
  },
  {
    number: "03",
    title: "La información no está clara",
    text: "Cuesta saber qué hay, qué falta, qué se vendió o quién debe encargarse de cada cosa.",
  },
  {
    number: "04",
    title: "Los problemas se repiten",
    text: "El equipo pierde tiempo corrigiendo errores, buscando información o rehaciendo tareas.",
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
  ["01", "Conversamos", "Confirmamos qué necesita y si el diagnóstico es adecuado para su negocio."],
  ["02", "Entendemos", "Usted completa un formulario breve y nos explica cómo funciona la operación hoy."],
  ["03", "Revisamos", "Analizamos procesos, responsabilidades, controles y ejemplos que ya existan."],
  ["04", "Priorizamos", "Identificamos qué sería más útil mejorar primero, según su capacidad actual."],
  ["05", "Creamos el plan", "Ordenamos acciones concretas en un plan inicial de 30 días."],
  ["06", "Usted decide", "Presentamos los resultados y usted elige cómo desea continuar."],
];

const audiences = [
  "Comercios pequeños",
  "Negocios familiares",
  "Empresas de servicios",
  "Contratistas y cuadrillas",
  "Operaciones técnicas en campo",
  "Equipos de 2 a 25 personas",
];

export default function Home() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main>
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span aria-hidden="true"></span> Consultoría práctica para pequeñas empresas</p>
              <h1>
                Entienda qué está frenando su negocio. <span>Decida qué mejorar primero.</span>
              </h1>
              <p className="hero-lead">
                CORVEN ayuda a organizar y mejorar su operación con prioridades claras,
                acciones realistas y sin agregar burocracia innecesaria.
              </p>
              <div className="button-row">
                <a className="button button-primary" href="#contacto">
                  Agendar una conversación
                  <span aria-hidden="true">→</span>
                </a>
                <a className="button button-secondary" href="#diagnostico">
                  Conocer el diagnóstico
                </a>
              </div>
              <ul className="trust-list" aria-label="Características del servicio">
                <li>Empresas de 2 a 25 personas</li>
                <li>Enfoque práctico</li>
                <li>Sin reportes nuevos</li>
              </ul>
              <div className="hero-proof" aria-label="Resultado del servicio">
                <span>El objetivo</span>
                <strong>Claridad → Prioridades → Acción</strong>
              </div>
            </div>

            <div className="snapshot-wrap" aria-label="Ejemplo ilustrativo de un Operations Snapshot">
              <div className="snapshot-note"><span aria-hidden="true"></span> Ejemplo ilustrativo</div>
              <article className="snapshot-card">
                <div className="snapshot-header">
                  <div>
                    <p>Operations Snapshot</p>
                    <strong>Claridad para actuar</strong>
                  </div>
                  <span>30 días</span>
                </div>
                <div className="snapshot-body">
                  <p className="snapshot-label">Prioridades identificadas</p>
                  <div className="priority priority-high">
                    <span>1</span>
                    <div>
                      <strong>Definir responsabilidades</strong>
                      <small>Reduce decisiones que dependen del dueño</small>
                    </div>
                  </div>
                  <div className="priority priority-medium">
                    <span>2</span>
                    <div>
                      <strong>Ordenar el control diario</strong>
                      <small>Hace visible qué pasó y qué requiere atención</small>
                    </div>
                  </div>
                  <div className="priority priority-low">
                    <span>3</span>
                    <div>
                      <strong>Estandarizar una rutina</strong>
                      <small>Evita resolver el mismo problema cada semana</small>
                    </div>
                  </div>
                </div>
                <div className="snapshot-footer">
                  <span>Prioridades</span>
                  <span>Acciones</span>
                  <span>Responsables</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="signal-strip" aria-label="Mensaje principal">
          <div className="container signal-content">
            <span className="signal-mark">C</span>
            <p>Primero buscamos <strong>claridad</strong>. Después se decide qué implementar.</p>
          </div>
        </section>

        <section className="section section-challenges" id="problemas">
          <div className="container">
            <div className="section-heading heading-split">
              <div>
                <p className="eyebrow">Cuando crecer empieza a sentirse pesado</p>
                <h2>¿Alguna de estas situaciones le resulta familiar?</h2>
              </div>
              <p>
                No significa que su negocio esté mal. Muchas veces significa que creció y ahora
                necesita una forma más clara de operar.
              </p>
            </div>
            <div className="challenge-grid">
              {challenges.map((challenge) => (
                <article className="challenge-card" key={challenge.number}>
                  <span>{challenge.number}</span>
                  <h3>{challenge.title}</h3>
                  <p>{challenge.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-diagnostic" id="diagnostico">
          <div className="container diagnostic-grid">
            <div className="diagnostic-copy">
              <p className="eyebrow eyebrow-light">Diagnóstico Operativo Express</p>
              <h2>Una mirada clara a su operación, sin convertirla en una auditoría interminable.</h2>
              <p>
                Revisamos de forma ligera cómo funciona hoy su negocio para identificar dónde
                conviene concentrar tiempo y atención primero.
              </p>
              <div className="effort-card">
                <span>Participación estimada del cliente</span>
                <strong>2,5 a 3,5 horas</strong>
                <small>Distribuidas entre el formulario, las conversaciones y la sesión de resultados.</small>
              </div>
            </div>
            <div className="deliverables-card">
              <p className="card-kicker">Al finalizar, usted recibe</p>
              <ul>
                {deliverables.map((item) => (
                  <li key={item}><span aria-hidden="true">✓</span>{item}</li>
                ))}
              </ul>
              <p className="deliverables-note">
                Recomendaciones adaptadas a la capacidad actual del negocio, no una lista genérica de sistemas por comprar.
              </p>
            </div>
          </div>
        </section>

        <section className="section section-process" id="como-trabajamos">
          <div className="container">
            <div className="section-heading centered-heading">
              <p className="eyebrow">Cómo trabajamos</p>
              <h2>De una conversación a un plan inicial</h2>
              <p>Un proceso ligero, ordenado y pensado para no interrumpir innecesariamente su operación.</p>
            </div>
            <ol className="process-grid">
              {steps.map(([number, title, text]) => (
                <li key={number}>
                  <span className="step-number">{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section-audience" id="para-quien">
          <div className="container audience-grid">
            <div>
              <p className="eyebrow">Para quién es</p>
              <h2>Para negocios reales, con operaciones reales.</h2>
              <p className="section-intro">
                Especialmente útil cuando el negocio ha crecido gracias al esfuerzo de sus dueños y necesita más estructura sin perder agilidad.
              </p>
            </div>
            <div className="audience-list">
              {audiences.map((audience) => (
                <div key={audience}><span aria-hidden="true">↗</span><strong>{audience}</strong></div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-boundaries">
          <div className="container boundaries-grid">
            <div className="principle-card">
              <p className="eyebrow">Nuestro principio</p>
              <blockquote>“Trabajamos sobre procesos, no sobre culpables.”</blockquote>
              <p>
                Queremos entender cómo funciona realmente la operación y recomendar acciones que el negocio pueda sostener.
              </p>
            </div>
            <div className="boundary-copy">
              <p className="eyebrow">Alcance claro desde el inicio</p>
              <h2>Diagnosticar no significa imponer.</h2>
              <p>
                El servicio no es una auditoría contable, no evalúa personas para encontrar culpables y no obliga a comprar sistemas ni contratar una implementación posterior.
              </p>
              <p>
                Cualquier acompañamiento adicional se conversa y cotiza por separado. Usted mantiene el control de la decisión.
              </p>
            </div>
          </div>
        </section>

        <section className="section section-about" id="sobre-corven">
          <div className="container about-grid">
            <p className="eyebrow eyebrow-light">Sobre CORVEN</p>
            <div>
              <h2>Orden, claridad y mejora práctica para pequeñas empresas.</h2>
              <p>
                CORVEN Consulting nace para acercar herramientas de gestión operativa a negocios que necesitan soluciones útiles, comprensibles y acordes con su realidad.
              </p>
              <p className="pending-copy">Historia y biografías de los socios: contenido pendiente de confirmación.</p>
            </div>
          </div>
        </section>

        <section className="section section-contact" id="contacto">
          <div className="container contact-card">
            <div>
              <p className="eyebrow">Conversemos</p>
              <h2>Descubra qué sería más útil mejorar primero.</h2>
              <p>
                Una conversación inicial nos permitirá conocer su situación y confirmar si el Diagnóstico Operativo Express es adecuado para su negocio.
              </p>
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
