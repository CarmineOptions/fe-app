import { FC, ReactNode } from "react";

export type TypographyProps = {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
};

// Headers
export const H1: FC<TypographyProps> = ({ children, className, onClick }) => (
  <h1 onClick={onClick} className={`text-6xl font-semibold ${className || ""}`}>
    {children}
  </h1>
);

export const H2: FC<TypographyProps> = ({ children, className, onClick }) => (
  <h2 onClick={onClick} className={`text-5xl font-semibold ${className || ""}`}>
    {children}
  </h2>
);

export const H3: FC<TypographyProps> = ({ children, className, onClick }) => (
  <h3 onClick={onClick} className={`text-4xl font-semibold ${className || ""}`}>
    {children}
  </h3>
);

export const H4: FC<TypographyProps> = ({ children, className, onClick }) => (
  <h4
    onClick={onClick}
    className={`text-[32px] font-semibold ${className || ""}`}
  >
    {children}
  </h4>
);

export const H5: FC<TypographyProps> = ({ children, className, onClick }) => (
  <h5
    onClick={onClick}
    className={`text-[1.6rem] font-semibold ${className || ""}`}
  >
    {children}
  </h5>
);

export const H6: FC<TypographyProps> = ({ children, className, onClick }) => (
  <h6 onClick={onClick} className={`text-xl font-semibold ${className || ""}`}>
    {children}
  </h6>
);

// Paragraphs
export const P3: FC<TypographyProps> = ({ children, className, onClick }) => (
  <p onClick={onClick} className={`text-[15px] ${className || ""}`}>
    {children}
  </p>
);

export const P4: FC<TypographyProps> = ({ children, className, onClick }) => (
  <p onClick={onClick} className={`text-[12px] ${className || ""}`}>
    {children}
  </p>
);

// Labels
export const L1: FC<TypographyProps> = ({ children, className, onClick }) => (
  <span onClick={onClick} className={`text-[0.75rem] ${className || ""}`}>
    {children}
  </span>
);

export const L2: FC<TypographyProps> = ({ children, className, onClick }) => (
  <span onClick={onClick} className={`text-[0.625rem] ${className || ""}`}>
    {children}
  </span>
);
