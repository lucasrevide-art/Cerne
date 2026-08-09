import type { ReactNode } from "react";
import "./EmptyState.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

/** Vazio comunica controle, não ausência (princípio 07). */
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="cerne-empty-state">
      {icon && <div className="cerne-empty-state__icon">{icon}</div>}
      <p className="cerne-empty-state__title">{title}</p>
      {description && (
        <p className="cerne-empty-state__description">{description}</p>
      )}
    </div>
  );
}
