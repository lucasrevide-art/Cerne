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
import {
  isInboxTask,
  isTodayTask,
  isAnytimeTask,
  isSomedayTask,
  isLogbookTask,
  sortTodayTasks,
} from "../features/tasks/taskFilters";
import {
  InboxIcon,
  SunIcon,
  AnytimeIcon,
  SomedayIcon,
  MenuIcon,
} from "../components/icons";
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
        description = "Captura bruta, ainda não classificada.";
        body = (
          <TaskList
            tasks={tasks.filter(isInboxTask)}
            emptyIcon={<InboxIcon width={28} height={28} />}
            emptyTitle="Está tudo em dia por aqui."
            emptyDescription="Capture qualquer coisa acima — classificar é opcional."
          />
        );
        break;
      case "today":
        title = "Today";
        description = "O compromisso de hoje.";
        body = (
          <TaskList
            tasks={sortTodayTasks(tasks.filter((t) => isTodayTask(t)))}
            quickAddDefaults={{ when: "today" }}
            emptyIcon={<SunIcon width={28} height={28} />}
            emptyTitle="Está tudo em dia por aqui."
            emptyDescription="Nada planejado para hoje."
          />
        );
        break;
      case "upcoming":
        title = "Upcoming";
        description = "O que vem pela frente.";
        body = <UpcomingView />;
        break;
      case "anytime":
        title = "Anytime";
        description = "Backlog ativo, sem data definida.";
        body = (
          <TaskList
            tasks={tasks.filter((t) => isAnytimeTask(t))}
            emptyIcon={<AnytimeIcon width={28} height={28} />}
            emptyTitle="Está tudo em dia por aqui."
            emptyDescription="Capture algo acima."
          />
        );
        break;
      case "someday":
        title = "Someday";
        description = "Adiado de propósito, fora do radar ativo.";
        body = (
          <TaskList
            tasks={tasks.filter((t) => isSomedayTask(t))}
            quickAddDefaults={{ when: "someday" }}
            emptyIcon={<SomedayIcon width={28} height={28} />}
            emptyTitle="Nada adiado por enquanto."
          />
        );
        break;
      case "logbook":
        title = "Logbook";
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
