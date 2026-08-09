import type { ReactNode } from "react";
import { CheckIcon } from "./icons";
import "./TaskRow.css";

interface TaskRowProps {
  title: string;
  completed?: boolean;
  metadata?: ReactNode;
  onToggleComplete?: () => void;
}

/**
 * Componente primitivo, ainda sem lógica de domínio — recebe estado via
 * props. A ligação com dados reais (store/repository) entra na Fase 2.
 */
export function TaskRow({
  title,
  completed = false,
  metadata,
  onToggleComplete,
}: TaskRowProps) {
  return (
    <div className={`cerne-task-row${completed ? " cerne-task-row--completed" : ""}`}>
      <button
        type="button"
        className="cerne-task-row__checkbox"
        role="checkbox"
        aria-checked={completed}
        aria-label={completed ? "Marcar como não concluída" : "Concluir tarefa"}
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete?.();
        }}
      >
        {completed && <CheckIcon width={12} height={12} />}
      </button>
      <span className="cerne-task-row__title">{title}</span>
      {metadata && <span className="cerne-task-row__metadata">{metadata}</span>}
    </div>
  );
}
