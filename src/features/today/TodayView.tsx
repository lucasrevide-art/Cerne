import { useMemo, useState } from "react";
import { useTaskStore } from "../../store/taskStore";
import { SunIcon } from "../../components/icons";
import { TaskList } from "../tasks/TaskList";
import { isDueTodayTask, isOverdueTask, isTodayTask } from "../tasks/taskFilters";
import "./TodayView.css";

type TodayFilter = "all" | "overdue" | "due";

export function TodayView() {
  const tasks = useTaskStore((state) => state.tasks);
  const [filter, setFilter] = useState<TodayFilter>("all");

  const todayTasks = useMemo(() => tasks.filter((task) => isTodayTask(task)), [tasks]);
  const overdueTasks = useMemo(
    () => todayTasks.filter((task) => isOverdueTask(task)),
    [todayTasks],
  );
  const dueTasks = useMemo(
    () => todayTasks.filter((task) => isDueTodayTask(task)),
    [todayTasks],
  );

  const visibleTasks =
    filter === "overdue" ? overdueTasks : filter === "due" ? dueTasks : todayTasks;

  const filters: { id: TodayFilter; label: string; count: number }[] = [
    { id: "all", label: "Tudo", count: todayTasks.length },
    { id: "overdue", label: "Atrasadas", count: overdueTasks.length },
    { id: "due", label: "Para hoje", count: dueTasks.length },
  ];

  return (
    <div className="cerne-today-view">
      <div className="cerne-today-view__filters" aria-label="Filtros de Hoje">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`cerne-today-view__filter${
              filter === item.id ? " cerne-today-view__filter--active" : ""
            }${item.id === "overdue" && item.count > 0 ? " cerne-today-view__filter--danger" : ""}`}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            <span>{item.count}</span>
          </button>
        ))}
      </div>

      <TaskList
        tasks={visibleTasks}
        quickAddDefaults={{ when: "today" }}
        showProjectTag
        emptyIcon={<SunIcon width={28} height={28} />}
        emptyTitle={filter === "overdue" ? "Nenhuma tarefa atrasada." : "Nada previsto para hoje."}
        emptyDescription={
          filter === "overdue"
            ? "Seu planejamento está em dia."
            : "Adicione uma tarefa ou aproveite para processar a Inbox."
        }
      />
    </div>
  );
}
