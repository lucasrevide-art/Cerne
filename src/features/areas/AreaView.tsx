import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";
import { useNavigationStore } from "../../store/navigationStore";
import { TaskList } from "../tasks/TaskList";
import { AreasIcon } from "../../components/icons";
import "./AreaView.css";

interface AreaViewProps {
  areaId: string;
}

export function AreaView({ areaId }: AreaViewProps) {
  const area = useAreaStore((s) => s.areas.find((a) => a.id === areaId));
  const allProjects = useProjectStore((s) => s.projects);
  const allTasks = useTaskStore((s) => s.tasks);
  const setProject = useNavigationStore((s) => s.setProject);

  const projects = allProjects.filter((p) => p.areaId === areaId);
  const tasks = allTasks.filter(
    (t) => t.areaId === areaId && t.projectId === null && t.status === "open",
  );

  if (!area) return null;

  return (
    <div className="cerne-area-view">
      {projects.length > 0 && (
        <div className="cerne-area-view__projects">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className="cerne-area-view__project-card"
              onClick={() => setProject(project.id)}
            >
              {project.name}
            </button>
          ))}
        </div>
      )}

      <TaskList
        tasks={tasks}
        quickAddDefaults={{ areaId }}
        emptyIcon={<AreasIcon width={28} height={28} />}
        emptyTitle="Nenhuma tarefa avulsa nesta área."
        emptyDescription="Capture algo acima ou crie um projeto para organizar melhor."
      />
    </div>
  );
}
