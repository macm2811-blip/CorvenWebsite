type BrandLogoProps = { footer?: boolean };

export function BrandLogo({ footer = false }: BrandLogoProps) {
  return (
    <span className={`brand-logo${footer ? " brand-logo-footer" : ""}`}>
      <span className="brand-wordmark" aria-hidden="true">
        CORVEN
      </span>
      <span className="brand-dot" aria-hidden="true"></span>
      <span className="sr-only">CORVEN</span>
    </span>
  );
}
