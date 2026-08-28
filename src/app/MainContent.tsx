import type { ReactNode } from "react";
import { useNavigationStore } from "../store/navigationStore";
import { useTaskStore } from "../store/taskStore";
import { useAreaStore } from "../store/areaStore";
import { useProjectStore } from "../store/projectStore";
import { useUiStore } from "../store/uiStore";
import { TaskList } from "../features/tasks/TaskList";
import { LogbookList } from "../features/tasks/LogbookList";
import { AreaView } from "../features/areas/AreaView";
import { ProjectView } from "../features/projects/ProjectView";
import { UpcomingView } from "../features/upcoming/UpcomingView";
import { TodayView } from "../features/today/TodayView";
import { isFocusTask, isInboxTask, isLogbookTask, isWaitingTask } from "../features/tasks/taskFilters";
import { InboxIcon, StarIcon, WaitingIcon, MenuIcon } from "../components/icons";
import "./MainContent.css";

export function MainContent() {
  const route = useNavigationStore((s) => s.route);
  const tasks = useTaskStore((s) => s.tasks);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const area = useAreaStore((s) =>
    route.type === "area" ? s.areas.find((a) => a.id === route.areaId) : undefined,
  );
  const project = useProjectStore((s) =>
    route.type === "project"
      ? s.projects.find((p) => p.id === route.projectId)
      : undefined,
  );

  let title: string;
  let description: string | undefined;
  let body: ReactNode;

  if (route.type === "area") {
    title = area?.name ?? "Área";
    body = area && <AreaView areaId={area.id} />;
  } else if (route.type === "project") {
    title = project?.name ?? "Projeto";
    body = project && <ProjectView projectId={project.id} />;
  } else {
    switch (route.view) {
      case "inbox":
        title = "Inbox";
        description = "Demandas ainda sem área ou projeto.";
        body = (
          <TaskList
            tasks={tasks.filter(isInboxTask)}
            showProjectTag
            reorderable
            emptyIcon={<InboxIcon width={28} height={28} />}
            emptyTitle="Inbox processada."
            emptyDescription="Capture algo acima; depois escolha uma área ou projeto."
          />
        );
        break;
      case "today":
        title = "Hoje";
        description = "Tarefas agendadas, vencidas ou com prazo para hoje.";
        body = <TodayView />;
        break;
      case "focus":
        title = "A Única Coisa";
        description = "Sua prioridade principal agora — independente da área ou do projeto.";
        body = (
          <TaskList
            tasks={tasks.filter(isFocusTask)}
            showProjectTag
            reorderable
            hideQuickAdd
            emptyIcon={<StarIcon width={28} height={28} />}
            emptyTitle="Nada marcado como prioridade."
            emptyDescription="Abra uma tarefa e marque a estrela para definir seu foco principal."
          />
        );
        break;
      case "waiting":
        title = "Aguardando";
        description = "Demandas que dependem de uma resposta ou ação de terceiros.";
        body = (
          <TaskList
            tasks={tasks.filter(isWaitingTask)}
            quickAddDefaults={{ status: "waiting" }}
            showProjectTag
            emptyIcon={<WaitingIcon width={28} height={28} />}
            emptyTitle="Nada aguardando no momento."
            emptyDescription="Pause uma tarefa quando ela depender de outra pessoa."
          />
        );
        break;
      case "upcoming":
        title = "Próximas";
        description = "O que vem pela frente.";
        body = <UpcomingView />;
        break;
      case "logbook":
        title = "Concluídas";
        description = "O que já foi concluído, por dia.";
        body = <LogbookList tasks={tasks.filter(isLogbookTask)} />;
        break;
    }
  }

  return (
    <main className="cerne-main">
      <header className="cerne-main__header">
        <button
          type="button"
          className="cerne-main__menu-btn"
          aria-label="Abrir menu de navegação"
          onClick={toggleSidebar}
        >
          <MenuIcon width={20} height={20} />
        </button>
        <div>
          <h1 className="text-h1">{title}</h1>
          {description && <p className="text-body-small">{description}</p>}
        </div>
      </header>
      {body}
    </main>
  );
}
