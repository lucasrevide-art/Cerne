import { useNavigationStore } from "../store/navigationStore";
import { useTaskStore } from "../store/taskStore";
import { useAreaStore } from "../store/areaStore";
import { useProjectStore } from "../store/projectStore";
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
} from "../components/icons";
import "./MainContent.css";

export function MainContent() {
  const route = useNavigationStore((s) => s.route);
  const tasks = useTaskStore((s) => s.tasks);
  const area = useAreaStore((s) =>
    route.type === "area" ? s.areas.find((a) => a.id === route.areaId) : undefined,
  );
  const project = useProjectStore((s) =>
    route.type === "project"
      ? s.projects.find((p) => p.id === route.projectId)
      : undefined,
  );

  if (route.type === "area") {
    return (
      <main className="cerne-main">
        <header className="cerne-main__header">
          <h1 className="text-h1">{area?.name ?? "Área"}</h1>
        </header>
        {area && <AreaView areaId={area.id} />}
      </main>
    );
  }

  if (route.type === "project") {
    return (
      <main className="cerne-main">
        <header className="cerne-main__header">
          <h1 className="text-h1">{project?.name ?? "Projeto"}</h1>
        </header>
        {project && <ProjectView projectId={project.id} />}
      </main>
    );
  }

  switch (route.view) {
    case "inbox": {
      const inboxTasks = tasks.filter(isInboxTask);
      return (
        <main className="cerne-main">
          <header className="cerne-main__header">
            <h1 className="text-h1">Inbox</h1>
            <p className="text-body-small">Captura bruta, ainda não classificada.</p>
          </header>
          <TaskList
            tasks={inboxTasks}
            emptyIcon={<InboxIcon width={28} height={28} />}
            emptyTitle="Está tudo em dia por aqui."
            emptyDescription="Capture qualquer coisa acima — classificar é opcional."
          />
        </main>
      );
    }
    case "today": {
      const todayTasks = sortTodayTasks(tasks.filter((t) => isTodayTask(t)));
      return (
        <main className="cerne-main">
          <header className="cerne-main__header">
            <h1 className="text-h1">Today</h1>
            <p className="text-body-small">O compromisso de hoje.</p>
          </header>
          <TaskList
            tasks={todayTasks}
            quickAddDefaults={{ when: "today" }}
            emptyIcon={<SunIcon width={28} height={28} />}
            emptyTitle="Está tudo em dia por aqui."
            emptyDescription="Nada planejado para hoje."
          />
        </main>
      );
    }
    case "upcoming": {
      return (
        <main className="cerne-main">
          <header className="cerne-main__header">
            <h1 className="text-h1">Upcoming</h1>
            <p className="text-body-small">O que vem pela frente.</p>
          </header>
          <UpcomingView />
        </main>
      );
    }
    case "anytime": {
      const anytimeTasks = tasks.filter((t) => isAnytimeTask(t));
      return (
        <main className="cerne-main">
          <header className="cerne-main__header">
            <h1 className="text-h1">Anytime</h1>
            <p className="text-body-small">Backlog ativo, sem data definida.</p>
          </header>
          <TaskList
            tasks={anytimeTasks}
            emptyIcon={<AnytimeIcon width={28} height={28} />}
            emptyTitle="Está tudo em dia por aqui."
            emptyDescription="Capture algo acima."
          />
        </main>
      );
    }
    case "someday": {
      const somedayTasks = tasks.filter((t) => isSomedayTask(t));
      return (
        <main className="cerne-main">
          <header className="cerne-main__header">
            <h1 className="text-h1">Someday</h1>
            <p className="text-body-small">Adiado de propósito, fora do radar ativo.</p>
          </header>
          <TaskList
            tasks={somedayTasks}
            quickAddDefaults={{ when: "someday" }}
            emptyIcon={<SomedayIcon width={28} height={28} />}
            emptyTitle="Nada adiado por enquanto."
          />
        </main>
      );
    }
    case "logbook": {
      const logbookTasks = tasks.filter(isLogbookTask);
      return (
        <main className="cerne-main">
          <header className="cerne-main__header">
            <h1 className="text-h1">Logbook</h1>
            <p className="text-body-small">O que já foi concluído, por dia.</p>
          </header>
          <LogbookList tasks={logbookTasks} />
        </main>
      );
    }
  }
}
