import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";

const ARM_TIMEOUT_MS = 3000;

interface ConfirmButtonProps {
  onConfirm: () => void;
  confirmLabel: string;
  children: ReactNode;
}

/**
 * Ação destrutiva com confirmação em duas etapas: primeiro clique arma
 * (muda de aparência), segundo clique dentro de alguns segundos confirma.
 * Sem clique de confirmação, desarma sozinho.
 */
export function ConfirmButton({ onConfirm, confirmLabel, children }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function handleClick() {
    if (!armed) {
      setArmed(true);
      timerRef.current = window.setTimeout(() => setArmed(false), ARM_TIMEOUT_MS);
      return;
    }
    window.clearTimeout(timerRef.current);
    onConfirm();
  }

  return (
    <Button variant={armed ? "danger" : "ghost"} onClick={handleClick}>
      {armed ? confirmLabel : children}
    </Button>
  );
}
