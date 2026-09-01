import { BrandLogo } from "@/components/brand-logo";

const footerContent = {
  es: {
    statement: "Operaciones, datos y estrategia para construir mejores decisiones.",
    scope: "Alcance global",
    scopeText: "Trabajamos con empresas que quieren comprender, mejorar y proyectar su negocio.",
    links: [["Soluciones", "#soluciones"], ["Diagnóstico Express", "#diagnostico"], ["Visión y pilares", "#vision"]],
    privacy: "Privacidad — próxima etapa",
    validation: "Contenido inicial sujeto a validación.",
  },
  en: {
    statement: "Operations, data, and strategy for better business decisions.",
    scope: "Global reach",
    scopeText: "We work with companies seeking to understand, improve, and shape their future.",
    links: [["Solutions", "#solutions"], ["Express Diagnostic", "#diagnostic"], ["Vision and pillars", "#vision"]],
    privacy: "Privacy — coming next",
    validation: "Initial content subject to validation.",
  },
} as const;

export function SiteFooter({ locale }: { locale: "es" | "en" }) {
  const content = footerContent[locale];

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-footer"><BrandLogo footer /></div>
          <p>{content.statement}</p>
        </div>
        <div>
          <strong>{content.scope}</strong>
          <p>{content.scopeText}</p>
        </div>
        <div className="footer-links">
          {content.links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
          <span>{content.privacy}</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CORVEN.</span>
        <span>{content.validation}</span>
      </div>
    </footer>
  );
}
