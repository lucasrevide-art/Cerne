import { useState, type ReactElement } from "react";
import { useNavigationStore, type FixedView } from "../store/navigationStore";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { TaskRow } from "../components/TaskRow";
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
        <ComponentPreview />
      ) : (
        <EmptyState
          icon={<Icon width={28} height={28} />}
          title="Está tudo em dia por aqui."
          description="A engine de tarefas chega na Fase 2."
        />
      )}
    </main>
  );
}

/**
 * Demonstra os primitivos da Fase 1 (Button, Input, Task Row) com dados de
 * exemplo — sem persistência. A captura e conclusão reais chegam na Fase 2.
 */
function ComponentPreview() {
  const [draft, setDraft] = useState("");
  const [rows, setRows] = useState([
    { id: "1", title: "Revisar tokens de cor", completed: false },
    { id: "2", title: "Configurar sidebar de navegação", completed: true },
    { id: "3", title: "Aprovar Fase 1 com o Lucas", completed: false },
  ]);

  function toggle(id: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, completed: !row.completed } : row,
      ),
    );
  }

  return (
    <section className="cerne-preview">
      <p className="text-caption cerne-preview__label">
        Pré-visualização de componentes — Fase 1
      </p>

      <div className="cerne-preview__quick-add">
        <Input
          placeholder="Adicionar tarefa…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button variant="primary" onClick={() => setDraft("")}>
          Adicionar
        </Button>
      </div>

      <div className="cerne-preview__rows">
        {rows.map((row) => (
          <TaskRow
            key={row.id}
            title={row.title}
            completed={row.completed}
            onToggleComplete={() => toggle(row.id)}
          />
        ))}
      </div>
    </section>
  );
}
