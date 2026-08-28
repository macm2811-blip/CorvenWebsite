import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-footer"><BrandLogo footer /></div>
          <p>Claridad operativa para pequeñas empresas.</p>
        </div>
        <div>
          <strong>Costa Rica</strong>
          <p>Zona de servicio y datos de contacto pendientes de confirmación.</p>
        </div>
        <div className="footer-links">
          <a href="#diagnostico">Diagnóstico Express</a>
          <a href="#como-trabajamos">Cómo trabajamos</a>
          <span>Privacidad — próxima etapa</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} CORVEN Consulting.</span>
        <span>Contenido inicial sujeto a validación.</span>
      </div>
    </footer>
  );
}
