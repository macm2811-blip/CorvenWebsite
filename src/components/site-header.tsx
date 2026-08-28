const navigation = [
  ["Problemas", "#problemas"],
  ["Diagnóstico", "#diagnostico"],
  ["Cómo trabajamos", "#como-trabajamos"],
  ["Para quién", "#para-quien"],
  ["CORVEN", "#sobre-corven"],
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#inicio" aria-label="CORVEN Consulting, ir al inicio">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>
            <strong>CORVEN</strong>
            <small>CONSULTING</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Navegación principal">
          {navigation.map(([label, href]) => (
            <a href={href} key={href}>{label}</a>
          ))}
        </nav>

        <a className="header-cta" href="#contacto">Conversemos</a>

        <details className="mobile-menu">
          <summary aria-label="Abrir menú"><span></span><span></span><span></span></summary>
          <nav aria-label="Navegación móvil">
            {navigation.map(([label, href]) => (
              <a href={href} key={href}>{label}</a>
            ))}
            <a className="button button-primary" href="#contacto">Conversemos</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
