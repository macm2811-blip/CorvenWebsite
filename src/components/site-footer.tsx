import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-footer"><BrandLogo footer /></div>
          <p>Operaciones, datos y estrategia para construir mejores decisiones.</p>
        </div>
        <div>
          <strong>Alcance global</strong>
          <p>Trabajamos con empresas que quieren comprender, mejorar y proyectar su negocio.</p>
        </div>
        <div className="footer-links">
          <a href="#soluciones">Soluciones</a>
          <a href="#diagnostico">Diagnóstico Express</a>
          <a href="#vision">Visión y pilares</a>
          <span>Privacidad — próxima etapa</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CORVEN.</span>
        <span>Contenido inicial sujeto a validación.</span>
      </div>
    </footer>
  );
}
