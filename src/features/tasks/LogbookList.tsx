import type { Task } from "../../types";
import { useTaskStore } from "../../store/taskStore";
import { TaskRow } from "../../components/TaskRow";
import { EmptyState } from "../../components/EmptyState";
import { LogbookIcon } from "../../components/icons";
import { groupLogbookTasks } from "./taskFilters";
import { ConfirmButton } from "../../components/ConfirmButton";
import "./LogbookList.css";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  const formatted = dateFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

interface LogbookListProps {
  tasks: Task[];
}

export function LogbookList({ tasks }: LogbookListProps) {
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const clearCompleted = useTaskStore((s) => s.clearCompleted);
  const groups = groupLogbookTasks(tasks);

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<LogbookIcon width={28} height={28} />}
        title="Nada concluído ainda."
        description="O que você concluir aparece aqui, agrupado por dia."
      />
    );
  }

  return (
    <div className="cerne-logbook">
      <div className="cerne-logbook__toolbar">
        <span className="text-body-small">
          {tasks.length} {tasks.length === 1 ? "tarefa armazenada" : "tarefas armazenadas"}
        </span>
        <ConfirmButton
          confirmLabel="Confirmar limpeza"
          onConfirm={() => void clearCompleted()}
        >
          Limpar concluídas
        </ConfirmButton>
      </div>
      {groups.map((group) => (
        <div key={group.date} className="cerne-logbook__group">
          <p className="text-caption cerne-logbook__date">{formatDay(group.date)}</p>
          <div className="cerne-logbook__rows">
            {group.tasks.map((task) => (
              <TaskRow
                key={task.id}
                title={task.title}
                completed
                onToggleComplete={() => toggleComplete(task.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
