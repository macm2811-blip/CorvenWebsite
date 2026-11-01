import Image from "next/image";

type BrandLogoProps = { footer?: boolean };

export function BrandLogo({ footer = false }: BrandLogoProps) {
  return (
    <span className={`brand-logo${footer ? " brand-logo-footer" : ""}`}>
      <Image
        className="brand-imagotype"
        src="/brand/corven-imagotype-purple.png"
        alt="CORVEN"
        width={360}
        height={120}
        sizes="(max-width: 700px) 148px, 172px"
      />
      <span className="sr-only">CORVEN</span>
    </span>
  );
}
