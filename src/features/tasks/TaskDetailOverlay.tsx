import { useState } from "react";
import type { Task } from "../../types";
import { Overlay } from "../../components/Overlay";
import { TaskPreview } from "./TaskPreview";
import { TaskEditor } from "./TaskEditor";

interface TaskDetailOverlayProps {
  task: Task;
  onClose: () => void;
}

/** Popup de tarefa: abre sempre no resumo enxuto; o ícone de lápis leva ao formulário completo. */
export function TaskDetailOverlay({ task, onClose }: TaskDetailOverlayProps) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");

  return (
    <Overlay onClose={onClose} label={task.title}>
      {mode === "preview" ? (
        <TaskPreview task={task} onEdit={() => setMode("edit")} />
      ) : (
        <TaskEditor task={task} onClose={onClose} onBack={() => setMode("preview")} />
      )}
    </Overlay>
  );
}
