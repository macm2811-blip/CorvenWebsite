type BrandLogoProps = {
  footer?: boolean;
};

export function BrandLogo({ footer = false }: BrandLogoProps) {
  return (
    <span className={`brand-logo${footer ? " brand-logo-footer" : ""}`}>
      <span className="brand-wordmark" aria-hidden="true">
        corven<span className="brand-dot">.</span>
      </span>
      <span className="brand-descriptor" aria-hidden="true">consulting</span>
      <span className="sr-only">CORVEN Consulting</span>
    </span>
  );
}
