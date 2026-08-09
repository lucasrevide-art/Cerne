import type { ReactElement } from "react";
import { useNavigationStore, type FixedView } from "../store/navigationStore";
import { EmptyState } from "../components/EmptyState";
import { TaskList } from "../features/tasks/TaskList";
import {
  InboxIcon,
  SunIcon,
  UpcomingIcon,
  AnytimeIcon,
  SomedayIcon,
  LogbookIcon,
} from "../components/icons";
import "./MainContent.css";

const viewCopy: Record<
  FixedView,
  { label: string; description: string; icon: (props: { width?: number; height?: number }) => ReactElement }
> = {
  inbox: {
    label: "Inbox",
    description: "Captura bruta, ainda não classificada.",
    icon: InboxIcon,
  },
  today: {
    label: "Today",
    description: "O compromisso de hoje.",
    icon: SunIcon,
  },
  upcoming: {
    label: "Upcoming",
    description: "O que vem pela frente.",
    icon: UpcomingIcon,
  },
  anytime: {
    label: "Anytime",
    description: "Backlog ativo, sem data definida.",
    icon: AnytimeIcon,
  },
  someday: {
    label: "Someday",
    description: "Adiado de propósito, fora do radar ativo.",
    icon: SomedayIcon,
  },
  logbook: {
    label: "Logbook",
    description: "O que já foi concluído, por dia.",
    icon: LogbookIcon,
  },
};

export function MainContent() {
  const activeView = useNavigationStore((s) => s.activeView);
  const view = viewCopy[activeView];
  const Icon = view.icon;

  return (
    <main className="cerne-main">
      <header className="cerne-main__header">
        <h1 className="text-h1">{view.label}</h1>
        <p className="text-body-small">{view.description}</p>
      </header>

      {activeView === "inbox" ? (
        <TaskList />
      ) : (
        <EmptyState
          icon={<Icon width={28} height={28} />}
          title="Está tudo em dia por aqui."
          description="Organização por Today/Upcoming/Areas chega na Fase 3."
        />
      )}
    </main>
  );
}
