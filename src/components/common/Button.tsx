import { ReactNode } from "react";

export interface ButtonOptions {
  type?: "primary" | "secondary" | "success" | "error" | "disabled";
  className?: string;
  outlined?: boolean;
  loading?: boolean;
  disabled?: boolean;
  padding?: string;
}

export interface ButtonProps extends ButtonOptions {
  onClick?: () => void;
  children: ReactNode;
}

export const Button = ({
  type,
  onClick,
  children,
  className,
  outlined = false,
  disabled = false,
  padding,
}: ButtonProps) => {
  const baseStyles = `${className} px-[12px] py-[2px] uppercase text-base font-semibold rounded-[2px] transition`;

  if (type === "error") {
    const cls = outlined
      ? `text-ui-errorBg border-ui-errorBg border-[0.5px] ${baseStyles}`
      : `bg-ui-errorBg text-ui-errorAccent ${baseStyles}`;
    return (
      <button
        disabled={disabled}
        onClick={onClick}
        className={cls}
        style={padding ? { padding: padding } : {}}
      >
        {children}
      </button>
    );
  }
  if (type === "success") {
    const cls = outlined
      ? `text-ui-successBg border-ui-successBg border-[0.5px] ${baseStyles}`
      : `bg-ui-successBg text-ui-successAccent ${baseStyles}`;
    return (
      <button
        disabled={disabled}
        onClick={onClick}
        className={cls}
        style={padding ? { padding: padding } : {}}
      >
        {children}
      </button>
    );
  }
  if (type === "primary") {
    const cls = outlined
      ? `text-brand border-brand border-[0.5px] ${baseStyles}`
      : `bg-brand text-dark ${baseStyles}`;
    return (
      <button
        disabled={disabled}
        onClick={onClick}
        className={cls}
        style={padding ? { padding: padding } : {}}
      >
        {children}
      </button>
    );
  }

  if (type === "disabled") {
    const cls = outlined
      ? `text-dark-secondary border-dark-secondary border-[0.5px] ${baseStyles}`
      : `bg-dark-secondary text-dark ${baseStyles}`;
    return (
      <button
        disabled={disabled}
        onClick={onClick}
        className={cls}
        style={padding ? { padding: padding } : {}}
      >
        {children}
      </button>
    );
  }

  const cls = outlined
    ? `text-dark-secondary border-dark-secondary border-[0.5px] ${baseStyles}`
    : `bg-dark-primary text-dark ${baseStyles}`;
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cls}
      style={padding ? { padding: padding } : {}}
    >
      {children}
    </button>
  );
};
