import type { ReactElement } from "react";
import { useNavigationStore, type FixedView } from "../store/navigationStore";
import { useCommandPaletteStore } from "../store/commandPaletteStore";
import { useUiStore } from "../store/uiStore";
import { useBackupPanelStore } from "../store/backupPanelStore";
import { useChangePasswordPanelStore } from "../store/changePasswordPanelStore";
import { AreaNavList } from "../features/areas/AreaNavList";
import { supabase } from "../lib/supabase/client";
import { useTaskStore } from "../store/taskStore";
import { isInboxTask, isTodayTask } from "../features/tasks/taskFilters";
import {
  InboxIcon,
  SunIcon,
  StarIcon,
  UpcomingIcon,
  LogbookIcon,
  SearchIcon,
  BackupIcon,
  KeyIcon,
  LogoutIcon,
  SettingsIcon,
  ChevronRightIcon,
} from "../components/icons";
import "./Sidebar.css";

interface NavEntry {
  id: FixedView;
  label: string;
  icon: (props: { width?: number; height?: number }) => ReactElement;
}

const topEntries: NavEntry[] = [
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "today", label: "Hoje", icon: SunIcon },
  { id: "focus", label: "A Única Coisa", icon: StarIcon },
  { id: "upcoming", label: "Próximas", icon: UpcomingIcon },
];

export function Sidebar() {
  const route = useNavigationStore((s) => s.route);
  const setFixedView = useNavigationStore((s) => s.setFixedView);
  const openCommandPalette = useCommandPaletteStore((s) => s.open);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const openBackupPanel = useBackupPanelStore((s) => s.open);
  const openChangePasswordPanel = useChangePasswordPanelStore((s) => s.open);
  const tasks = useTaskStore((s) => s.tasks);
  const taskCounts: Partial<Record<FixedView, number>> = {
    inbox: tasks.filter(isInboxTask).length,
    today: tasks.filter((task) => isTodayTask(task)).length,
  };

  return (
    <nav
      className={`cerne-sidebar${sidebarOpen ? " cerne-sidebar--open" : ""}`}
      aria-label="Navegação principal"
    >
      <div className="cerne-sidebar__brand">
        <span className="text-h2">Cerne</span>
      </div>

      <button
        type="button"
        className="cerne-sidebar__search-trigger"
        onClick={openCommandPalette}
      >
        <SearchIcon width={16} height={16} />
        <span>Buscar</span>
        <kbd className="cerne-sidebar__search-hint">⌘K</kbd>
      </button>

      <ul className="cerne-sidebar__list cerne-sidebar__secondary">
        {topEntries.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              type="button"
              className={`cerne-sidebar__item${
                route.type === "fixed" && route.view === id
                  ? " cerne-sidebar__item--active"
                  : ""
              }`}
              onClick={() => setFixedView(id)}
            >
              <Icon width={18} height={18} />
              <span>{label}</span>
              {taskCounts[id] !== undefined && taskCounts[id]! > 0 && (
                <span className="cerne-sidebar__count" aria-label={`${taskCounts[id]} tarefas`}>
                  {taskCounts[id]}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="cerne-sidebar__divider" />

      <AreaNavList />

      <div className="cerne-sidebar__divider" />

      <ul className="cerne-sidebar__list">
        <li>
          <button
            type="button"
            className={`cerne-sidebar__item${
              route.type === "fixed" && route.view === "logbook"
                ? " cerne-sidebar__item--active"
                : ""
            }`}
            onClick={() => setFixedView("logbook")}
          >
            <LogbookIcon width={18} height={18} />
            <span>Concluídas</span>
          </button>
        </li>
      </ul>

      <details className="cerne-sidebar__settings">
        <summary className="cerne-sidebar__item">
          <SettingsIcon width={18} height={18} />
          <span>Ajustes</span>
          <ChevronRightIcon width={12} height={12} className="cerne-sidebar__settings-chevron" />
        </summary>
        <ul className="cerne-sidebar__list cerne-sidebar__settings-list">
          <li>
            <button type="button" className="cerne-sidebar__item" onClick={openBackupPanel}>
              <BackupIcon width={18} height={18} />
              <span>Backup</span>
            </button>
          </li>
          <li>
            <button type="button" className="cerne-sidebar__item" onClick={openChangePasswordPanel}>
              <KeyIcon width={18} height={18} />
              <span>Trocar senha</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="cerne-sidebar__item"
              onClick={() => void supabase.auth.signOut()}
            >
              <LogoutIcon width={18} height={18} />
              <span>Sair</span>
            </button>
          </li>
        </ul>
      </details>
    </nav>
  );
}
