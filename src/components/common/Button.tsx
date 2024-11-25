import { ReactNode } from "react";

export interface ButtonOptions {
  type?: "primary" | "secondary" | "success" | "error";
  className?: string;
  outlined?: boolean;
  loading?: boolean;
}

export interface ButtonProps extends ButtonOptions {
  onClick: () => void;
  children: ReactNode;
}

export const Button = ({
  type,
  onClick,
  children,
  className,
  outlined = false,
}: ButtonProps) => {
  const baseStyles = `px-[12px] py-[2px] uppercase text-base font-semibold rounded-[2px] transition${
    className === undefined ? "" : " " + className
  }`;

  if (type === "error") {
    const cls = outlined
      ? `text-ui-errorBg border-ui-errorBg border-[0.5px] ${baseStyles}`
      : `bg-ui-errorBg text-ui-errorAccent ${baseStyles}`;
    return (
      <button onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }
  if (type === "success") {
    const cls = outlined
      ? `text-ui-successBg border-ui-successBg border-[0.5px] ${baseStyles}`
      : `bg-ui-successBg text-ui-successAccent ${baseStyles}`;
    return (
      <button onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }
  if (type === "primary") {
    const cls = outlined
      ? `text-brand-carmine border-brand-carmine border-[0.5px] ${baseStyles}`
      : `bg-brand-carmine text-dark-base ${baseStyles}`;
    return (
      <button onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }

  const cls = outlined
    ? `text-dark-secondary border-dark-secondary border-[0.5px] ${baseStyles}`
    : `bg-dark-primary text-dark-base ${baseStyles}`;
  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
};
