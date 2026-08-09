import { useMemo, useState } from "react";
import { useTaskStore } from "../../store/taskStore";
import { TaskList } from "../tasks/TaskList";
import { UpcomingCalendar } from "./UpcomingCalendar";
import { isUpcomingTask, sortUpcomingTasks } from "../tasks/taskFilters";
import { UpcomingIcon } from "../../components/icons";

export function UpcomingView() {
  const tasks = useTaskStore((s) => s.tasks);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const upcomingTasks = sortUpcomingTasks(tasks.filter((t) => isUpcomingTask(t)));

  const countsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of tasks) {
      if (task.status !== "open") continue;
      const date = task.whenDate ?? task.deadline;
      if (!date) continue;
      map.set(date, (map.get(date) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  const visibleTasks = selectedDate
    ? upcomingTasks.filter(
        (t) => t.whenDate === selectedDate || t.deadline === selectedDate,
      )
    : upcomingTasks;

  return (
    <div>
      <UpcomingCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        countsByDate={countsByDate}
      />
      <TaskList
        tasks={visibleTasks}
        emptyIcon={<UpcomingIcon width={28} height={28} />}
        emptyTitle={selectedDate ? "Nada agendado para esse dia." : "Nada agendado."}
        emptyDescription={
          selectedDate
            ? undefined
            : "Defina uma data ou prazo numa tarefa para ela aparecer aqui."
        }
      />
    </div>
  );
}
