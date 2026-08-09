import type { InputHTMLAttributes } from "react";
import "./Input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...rest }: InputProps) {
  const classes = ["cerne-input", error && "cerne-input--error", className]
    .filter(Boolean)
    .join(" ");

  return <input className={classes} {...rest} />;
}
