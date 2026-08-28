import { useEffect, useState } from "react";
import { useAreaStore } from "../../store/areaStore";
import { useProjectStore } from "../../store/projectStore";
import { useTaskStore } from "../../store/taskStore";
import { useNavigationStore } from "../../store/navigationStore";
import { TaskList } from "../tasks/TaskList";
import { FinancialSummary } from "../finance/FinancialSummary";
import { AreasIcon } from "../../components/icons";
import { ConfirmButton } from "../../components/ConfirmButton";
import { Button } from "../../components/Button";
import "./AreaView.css";

interface AreaViewProps {
  areaId: string;
}

export function AreaView({ areaId }: AreaViewProps) {
  const area = useAreaStore((s) => s.areas.find((a) => a.id === areaId));
  const updateArea = useAreaStore((s) => s.updateArea);
  const removeArea = useAreaStore((s) => s.removeArea);
  const allProjects = useProjectStore((s) => s.projects);
  const allTasks = useTaskStore((s) => s.tasks);
  const setProject = useNavigationStore((s) => s.setProject);
  const setFixedView = useNavigationStore((s) => s.setFixedView);

  const [notes, setNotes] = useState(area?.notes ?? "");
  const [notesStatus, setNotesStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // AreaView não desmonta ao trocar de área (só o prop areaId muda) — sem
  // isso o rascunho local de uma área vazaria pra outra.
  useEffect(() => {
    setNotes(area?.notes ?? "");
  }, [areaId, area?.notes]);

  useEffect(() => {
    setNotesStatus("idle");
  }, [areaId]);

  async function commitNotes() {
    if (!area || notes === area.notes) return;
    setNotesStatus("saving");
    try {
      await updateArea(area.id, { notes });
      setNotesStatus("saved");
    } catch {
      setNotesStatus("error");
    }
  }

  const projects = allProjects.filter((p) => p.areaId === areaId);
  const tasks = allTasks.filter(
    (t) => t.areaId === areaId && t.projectId === null && t.status === "open",
  );
  const projectIds = new Set(projects.map((p) => p.id));
  const financialScopeTasks = allTasks.filter(
    (t) => t.areaId === areaId || (t.projectId !== null && projectIds.has(t.projectId)),
  );

  if (!area) return null;

  return (
    <div className="cerne-area-view">
      <textarea
        className="cerne-area-view__notes"
        placeholder="Notas soltas, ideias, o que quiser guardar aqui…"
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setNotesStatus("idle");
        }}
        rows={6}
      />

      <div className="cerne-area-view__notes-actions">
        <span className={`cerne-area-view__notes-status cerne-area-view__notes-status--${notesStatus}`}>
          {notesStatus === "saving" && "Salvando…"}
          {notesStatus === "saved" && "Notas salvas"}
          {notesStatus === "error" && "Não foi possível salvar"}
        </span>
        <Button
          variant="secondary"
          disabled={notes === area.notes || notesStatus === "saving"}
          onClick={() => void commitNotes()}
        >
          Salvar notas
        </Button>
      </div>

      <FinancialSummary tasks={financialScopeTasks} />

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
        reorderable
        emptyIcon={<AreasIcon width={28} height={28} />}
        emptyTitle="Nenhuma tarefa avulsa nesta área."
        emptyDescription="Capture algo acima ou crie um projeto para organizar melhor."
      />

      <div className="cerne-area-view__actions">
        <ConfirmButton
          confirmLabel="Confirmar exclusão da área"
          onConfirm={() => {
            removeArea(areaId);
            setFixedView("inbox");
          }}
        >
          Excluir área
        </ConfirmButton>
      </div>
    </div>
  );
}
