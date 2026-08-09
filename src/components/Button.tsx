import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = "secondary",
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = ["cerne-button", `cerne-button--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
