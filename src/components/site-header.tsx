import { BrandLogo } from "@/components/brand-logo";

const navigation = {
  es: [
    ["Soluciones", "#soluciones"],
    ["Diagnóstico", "#diagnostico"],
    ["Cómo trabajamos", "#como-trabajamos"],
    ["Sobre CORVEN", "#sobre-corven"],
  ],
  en: [
    ["Solutions", "#solutions"],
    ["Diagnostic", "#diagnostic"],
    ["How we work", "#how-we-work"],
    ["About CORVEN", "#about-corven"],
  ],
} as const;

export function SiteHeader({ locale }: { locale: "es" | "en" }) {
  const isEnglish = locale === "en";
  const links = navigation[locale];
  const homeHref = isEnglish ? "/en#home" : "/#inicio";
  const contactHref = isEnglish ? "#contact" : "#contacto";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href={homeHref} aria-label={isEnglish ? "CORVEN, go to home" : "CORVEN, ir al inicio"}>
          <BrandLogo />
        </a>

        <nav className="desktop-nav" aria-label={isEnglish ? "Main navigation" : "Navegación principal"}>
          {links.map(([label, href]) => (
            <a href={href} key={href}>{label}</a>
          ))}
        </nav>

        <a className="language-switch" href={isEnglish ? "/" : "/en"} lang={isEnglish ? "es" : "en"}>
          {isEnglish ? "ES" : "EN"}
        </a>
        <a className="header-cta" href={contactHref}>{isEnglish ? "Let's talk" : "Conversemos"}</a>

        <details className="mobile-menu">
          <summary aria-label={isEnglish ? "Open menu" : "Abrir menú"}><span></span><span></span><span></span></summary>
          <nav aria-label={isEnglish ? "Mobile navigation" : "Navegación móvil"}>
            {links.map(([label, href]) => (
              <a href={href} key={href}>{label}</a>
            ))}
            <a className="mobile-language" href={isEnglish ? "/" : "/en"} lang={isEnglish ? "es" : "en"}>
              {isEnglish ? "Español" : "English"}
            </a>
            <a className="button button-primary" href={contactHref}>{isEnglish ? "Let's talk" : "Conversemos"}</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
