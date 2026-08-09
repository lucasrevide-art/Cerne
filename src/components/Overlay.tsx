import { useEffect, type MouseEvent, type ReactNode } from "react";
import "./Overlay.css";

interface OverlayProps {
  onClose: () => void;
  children: ReactNode;
}

export function Overlay({ onClose, children }: OverlayProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="cerne-overlay" onClick={handleBackdropClick}>
      <div className="cerne-overlay__panel">{children}</div>
    </div>
  );
}
