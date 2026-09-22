import React from "react";

interface BrandLogoProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "dark" | "light" | "auto";
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showEmblemOnly?: boolean;
  className?: string;
}

export function BrandLogo({
  variant = "auto",
  size = "md",
  showText = false,
  showEmblemOnly = false,
  className = "",
  ...props
}: BrandLogoProps) {
  // Height presets for the logo mark
  const imgHeightClass = {
    sm: "h-7",
    md: "h-11",
    lg: "h-14",
    xl: "h-20 md:h-24",
  }[size];

  const textClass = {
    sm: "text-sm tracking-[0.14em]",
    md: "text-lg md:text-xl tracking-[0.16em]",
    lg: "text-2xl md:text-3xl tracking-[0.18em]",
    xl: "text-3xl md:text-5xl tracking-[0.2em]",
  }[size];

  // If emblem only, use the cropped monogram; otherwise use full logo
  const logoSrc = showEmblemOnly
    ? (variant === "light" ? "/emblem-white.png" : "/emblem-dark.png")
    : (variant === "light" ? "/logo-white.png" : "/logo-transparent.png");

  return (
    <a
      href="/"
      aria-label="Maison de Silk"
      className={`inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 ${className}`}
      {...props}
    >
      <img
        src={logoSrc}
        alt="Maison de Silk"
        className={`${imgHeightClass} w-auto object-contain shrink-0 drop-shadow-sm select-none`}
        loading="eager"
      />
      {showText && (
        <span
          className={`font-display font-medium uppercase select-none ${
            variant === "light" ? "text-primary-foreground" : "text-foreground"
          } ${textClass}`}
        >
          Maison de <span className="text-accent">Silk</span>
        </span>
      )}
    </a>
  );
}

export function BrandMark({
  variant = "auto",
  className = "h-8 w-auto",
  alt = "Maison de Silk",
}: {
  variant?: "dark" | "light" | "auto";
  className?: string;
  alt?: string;
}) {
  const src = variant === "light" ? "/logo-white.png" : "/logo-transparent.png";
  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain select-none ${className}`}
      loading="eager"
    />
  );
}
