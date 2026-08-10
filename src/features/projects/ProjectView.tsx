import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";
import { useNavigationStore } from "../../store/navigationStore";
import { UpcomingIcon } from "../../components/icons";
import { TaskList } from "../tasks/TaskList";
import { ConfirmButton } from "../../components/ConfirmButton";
import "./ProjectView.css";

interface ProjectViewProps {
  projectId: string;
}

export function ProjectView({ projectId }: ProjectViewProps) {
  const project = useProjectStore((s) =>
    s.projects.find((p) => p.id === projectId),
  );
  const removeProject = useProjectStore((s) => s.removeProject);
  const allTasks = useTaskStore((s) => s.tasks);
  const tasks = allTasks.filter(
    (t) => t.projectId === projectId && t.status === "open",
  );
  const setArea = useNavigationStore((s) => s.setArea);
  const setFixedView = useNavigationStore((s) => s.setFixedView);

  if (!project) return null;

  return (
    <div className="cerne-project-view">
      <TaskList
        tasks={tasks}
        quickAddDefaults={{ projectId }}
        reorderable
        emptyIcon={<UpcomingIcon width={28} height={28} />}
        emptyTitle="Este projeto ainda não tem tarefas."
        emptyDescription="Capture a primeira acima."
      />

      <div className="cerne-project-view__actions">
        <ConfirmButton
          confirmLabel="Confirmar exclusão do projeto"
          onConfirm={() => {
            const areaId = project.areaId;
            removeProject(projectId);
            if (areaId) setArea(areaId);
            else setFixedView("inbox");
          }}
        >
          Excluir projeto
        </ConfirmButton>
      </div>
    </div>
  );
}
