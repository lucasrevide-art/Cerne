import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";
import { UpcomingIcon } from "../../components/icons";
import { TaskList } from "../tasks/TaskList";

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId),
  );
  const allTasks = useTaskStore((s) => s.tasks);
  const tasks = allTasks.filter(
    (t) => t.projectId === projectId && t.status === "open",
  );

  if (!project) return null;

  return (
    <TaskList
      tasks={tasks}
      quickAddDefaults={{ projectId }}
      emptyIcon={<UpcomingIcon width={28} height={28} />}
      emptyTitle="Este projeto ainda não tem tarefas."
      emptyDescription="Capture a primeira acima."
    />
  );
}
