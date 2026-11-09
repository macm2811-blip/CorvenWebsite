import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const notices = {
  es: {
    label: "Privacidad y protección de datos",
    title: "Aviso de privacidad",
    updated: "Vigente desde el 9 de noviembre de 2026",
    intro: "Este aviso explica cómo CORVEN recopila y utiliza información personal cuando una persona visita el sitio, solicita información, conversa con nosotros o contrata un servicio.",
    sections: [
      ["Responsable", ["Malcon Corea presta servicios profesionales bajo la marca CORVEN y es responsable del tratamiento descrito en este aviso.", "Contacto para consultas y solicitudes: info@corvenconsulting.company y WhatsApp +506 6007 9321."]],
      ["Información que podemos recopilar", ["Datos de identificación y contacto que usted proporciona, como nombre, empresa, función, correo y teléfono.", "Mensajes, solicitudes, respuestas a formularios y datos necesarios para preparar una propuesta o prestar el servicio.", "Información operativa y documentos empresariales que el cliente decida compartir dentro del alcance acordado.", "Datos de facturación y pago necesarios para emitir comprobantes y controlar cobros. CORVEN no almacena datos completos de tarjetas.", "Información técnica básica generada al visitar el sitio, como registros de seguridad y funcionamiento suministrados por el proveedor de alojamiento."]],
      ["Finalidades", ["Responder consultas y coordinar reuniones.", "Evaluar el encaje, preparar propuestas, celebrar acuerdos y ejecutar servicios.", "Administrar cobros, comprobantes, entregas, calidad y seguimiento.", "Cumplir obligaciones legales, contables y de seguridad.", "Mejorar nuestros métodos mediante información agregada o anonimizada."]],
      ["Consentimiento y límites", ["Al enviar información por correo, WhatsApp, Instagram, Microsoft Forms u otro canal indicado por CORVEN, usted autoriza su uso para las finalidades informadas. Cuando corresponda, solicitaremos una confirmación expresa que pueda conservarse como evidencia.", "No solicitamos contraseñas, datos médicos, información financiera sensible ni datos personales de empleados, clientes finales u otras personas que no sean necesarios. Antes de compartir muestras, el cliente debe eliminar o anonimizar información de terceros."]],
      ["Proveedores y transferencias", ["Podemos utilizar proveedores tecnológicos para alojamiento, correo, mensajería, formularios, almacenamiento y colaboración, incluidos Microsoft 365, Vercel y los servicios de Meta que la persona elija utilizar. Estos proveedores pueden procesar información fuera de Costa Rica conforme a sus condiciones y medidas de seguridad.", "CORVEN no vende bases de datos ni comparte información para publicidad de terceros. Solo se comunica información cuando es necesaria para prestar el servicio, existe autorización o lo exige la ley."]],
      ["Conservación y seguridad", ["Los datos de prospectos se conservan hasta 12 meses después del último contacto, salvo que exista una relación posterior o se solicite su eliminación.", "Los expedientes de clientes y registros de facturación se conservan durante el plazo necesario para prestar el servicio y cumplir obligaciones contractuales, contables y legales. Después se eliminan o anonimizan de forma segura.", "CORVEN limita el acceso a las personas asignadas y utiliza controles razonables en su entorno Microsoft 365. Ningún sistema ofrece seguridad absoluta; por ello evitamos recopilar información innecesaria."]],
      ["Derechos de la persona", ["Puede solicitar acceso, actualización, rectificación o supresión de sus datos, revocar el consentimiento cuando corresponda y consultar el uso realizado. Envíe la solicitud a info@corvenconsulting.company con información suficiente para verificar su identidad y ubicar el registro.", "CORVEN responderá dentro del plazo aplicable. Si considera que sus derechos no fueron atendidos, puede acudir a la Agencia de Protección de Datos de los Habitantes de Costa Rica."]],
      ["Cambios al aviso", ["Podemos actualizar este aviso cuando cambien los canales, proveedores o finalidades. La versión vigente y su fecha se publicarán en esta página.", "Este aviso se interpreta conforme a la Ley 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales y su reglamentación aplicable en Costa Rica."]],
    ],
  },
  en: {
    label: "Privacy and data protection",
    title: "Privacy notice",
    updated: "Effective November 9, 2026",
    intro: "This notice explains how CORVEN collects and uses personal information when a person visits this site, requests information, contacts us, or engages our services.",
    sections: [
      ["Controller", ["Malcon Corea provides professional services under the CORVEN brand and is responsible for the processing described in this notice.", "Contact for privacy questions and requests: info@corvenconsulting.company and WhatsApp +506 6007 9321."]],
      ["Information we may collect", ["Identification and contact information you provide, such as name, company, role, email, and telephone number.", "Messages, requests, form responses, and information needed to prepare a proposal or provide services.", "Operational information and business documents the client chooses to share within the agreed scope.", "Billing and payment information needed to issue receipts and manage collections. CORVEN does not store full payment card details.", "Basic technical information generated when visiting this site, including security and operation logs supplied by the hosting provider."]],
      ["Purposes", ["Respond to inquiries and coordinate meetings.", "Assess fit, prepare proposals, enter into agreements, and provide services.", "Manage payments, receipts, delivery, quality, and follow-up.", "Meet legal, accounting, and security obligations.", "Improve our methods using aggregated or anonymized information."]],
      ["Consent and limits", ["By sending information through email, WhatsApp, Instagram, Microsoft Forms, or another CORVEN channel, you authorize its use for the purposes disclosed. When required, we will request an express confirmation that can be retained as evidence.", "We do not request passwords, medical data, sensitive financial information, or unnecessary personal data about employees, end customers, or other people. Clients must remove or anonymize third-party information before sharing samples."]],
      ["Providers and transfers", ["We may use technology providers for hosting, email, messaging, forms, storage, and collaboration, including Microsoft 365, Vercel, and the Meta services a person chooses to use. These providers may process information outside Costa Rica under their terms and security measures.", "CORVEN does not sell databases or share information for third-party advertising. Information is disclosed only when required to provide the service, authorized by the person, or required by law."]],
      ["Retention and security", ["Prospect data is retained for up to 12 months after the last contact unless a later relationship exists or deletion is requested.", "Client files and billing records are retained as needed to provide the service and meet contractual, accounting, and legal obligations. They are then securely deleted or anonymized.", "CORVEN limits access to assigned personnel and uses reasonable controls in its Microsoft 365 environment. No system provides absolute security, so we avoid collecting unnecessary information."]],
      ["Your rights", ["You may request access, updating, correction, or deletion of your data, withdraw consent when applicable, and ask how your information has been used. Send requests to info@corvenconsulting.company with enough information to verify your identity and locate the record.", "CORVEN will respond within the applicable period. If you believe your rights have not been addressed, you may contact Costa Rica's data protection authority, PRODHAB."]],
      ["Changes to this notice", ["We may update this notice when our channels, providers, or purposes change. The current version and effective date will be published on this page.", "This notice is governed by Costa Rica Law 8968 on the Protection of Individuals regarding the Processing of Personal Data and its applicable regulations."]],
    ],
  },
} as const;

export function PrivacyPage({ locale }: { locale: "es" | "en" }) {
  const notice = notices[locale];
  return (
    <div className="site-shell" lang={locale}>
      <SiteHeader locale={locale} />
      <main className="legal-page">
        <div className="container legal-layout">
          <header className="legal-heading">
            <p className="eyebrow">{notice.label}</p>
            <h1>{notice.title}</h1>
            <p>{notice.intro}</p>
            <small>{notice.updated}</small>
          </header>
          <div className="legal-content">
            {notice.sections.map(([title, paragraphs]) => (
              <section key={title}>
                <h2>{title}</h2>
                {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
