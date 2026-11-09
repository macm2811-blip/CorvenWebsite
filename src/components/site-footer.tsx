import { BrandLogo } from "@/components/brand-logo";

const footerContent = {
  es: {
    statement: "Operaciones, datos y estrategia para construir mejores decisiones.",
    scope: "Alcance global",
    scopeText: "Trabajamos con empresas que quieren comprender, mejorar y proyectar su negocio.",
    links: [["Soluciones", "/#soluciones"], ["Portafolio", "/#portafolio"], ["Catálogo de precios", "/#precios"], ["Corven Learning", "/learning"], ["Sobre CORVEN", "/#sobre-corven"]],
    privacy: "Aviso de privacidad",
    privacyHref: "/privacidad",
    validation: "Servicios profesionales prestados por Malcon Corea bajo la marca CORVEN.",
  },
  en: {
    statement: "Operations, data, and strategy for better business decisions.",
    scope: "Global reach",
    scopeText: "We work with companies seeking to understand, improve, and shape their future.",
    links: [["Solutions", "/en#solutions"], ["Portfolio", "/en#portfolio"], ["Pricing", "/en#pricing"], ["Express Diagnostic", "/en#diagnostic"], ["About CORVEN", "/en#about-corven"]],
    privacy: "Privacy notice",
    privacyHref: "/en/privacy",
    validation: "Professional services provided by Malcon Corea under the CORVEN brand.",
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
          <a href={content.privacyHref}>{content.privacy}</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CORVEN.</span>
        <span>{content.validation}</span>
      </div>
    </footer>
  );
}
