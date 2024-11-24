import { FC, ReactNode } from "react";

export type TypographyProps = {
  className?: string;
  children?: ReactNode;
};

// Headers
export const H1: FC<TypographyProps> = ({ children, className }) => (
  <h1 className={`text-6xl font-semibold ${className || ""}`}>{children}</h1>
);

export const H2: FC<TypographyProps> = ({ children, className }) => (
  <h2 className={`text-5xl font-semibold ${className || ""}`}>{children}</h2>
);

export const H3: FC<TypographyProps> = ({ children, className }) => (
  <h3 className={`text-4xl font-semibold ${className || ""}`}>{children}</h3>
);

export const H4: FC<TypographyProps> = ({ children, className }) => (
  <h4 className={`text-3xl font-semibold ${className || ""}`}>{children}</h4>
);

export const H5: FC<TypographyProps> = ({ children, className }) => (
  <h5 className={`text-2xl font-semibold ${className || ""}`}>{children}</h5>
);

export const H6: FC<TypographyProps> = ({ children, className }) => (
  <h6 className={`text-xl font-semibold ${className || ""}`}>{children}</h6>
);

// Paragraphs
export const P3: FC<TypographyProps> = ({ children, className }) => (
  <p className={`text-base ${className || ""}`}>{children}</p>
);

export const P4: FC<TypographyProps> = ({ children, className }) => (
  <p className={`text-sm ${className || ""}`}>{children}</p>
);

// Labels
export const L1: FC<TypographyProps> = ({ children, className }) => (
  <span className={`text-xs ${className || ""}`}>{children}</span>
);

export const L2: FC<TypographyProps> = ({ children, className }) => (
  <span className={`text-[0.625rem] ${className || ""}`}>{children}</span>
);
